"""End-to-end guards for evidence preservation and independent monthly input."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]


def load(name, relative):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


raw = load('raw', 'scripts/tracework_raw.py')
monthly = load('monthly', 'skills/monthly/scripts/prepare_monthly_data.py')
split = load('split', 'skills/monthly/scripts/split_daily_note.py')


class EvidenceFlowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='tracework-evidence-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.entry = self.root / 'entry.json'
        self.entry.write_text(json.dumps({
            'timestamp': '2026-08-31T12:00:00+08:00', 'type': 'decision',
            'summary': 'Direction chosen; rollout remains unverified',
            'context': 'Goal: preserve evidence. Gate: validate the rollout.',
            'source': 'session-recap', 'archetype': 'maintenance',
        }))
        self.config = patch.object(raw, 'resolve_config', return_value=({}, []))
        self.config.start()
        self.addCleanup(self.config.stop)

    def append(self):
        return raw.append_entries(self.entry, self.root, '2026-08-31', self.root, 'probe')

    def test_historical_capture_reaches_monthly_without_daily(self):
        result = self.append()
        stored = json.loads(Path(result['path']).read_text())[0]
        self.assertEqual(stored['timestamp'], '2026-08-31T12:00:00+08:00')
        self.assertIn('captured_at', stored)
        self.assertEqual(len(monthly.load_monthly_raw_entries(self.root, '2026-08')), 1)
        command = [sys.executable, '-B', str(ROOT / 'skills/monthly/scripts/prepare_monthly_data.py'),
                   '--vault', str(self.root), '--month', '2026-08',
                   '--signals-output', str(self.root / 'signals.json'),
                   '--skeleton-output', str(self.root / 'skeleton.json')]
        run = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(run.returncode, 0, run.stderr)
        skeleton = json.loads((self.root / 'skeleton.json').read_text())
        self.assertEqual(len(skeleton['raw_entries']), 1)
        self.assertEqual(skeleton['statistics']['total_days'], 0)

    def test_concurrent_append_preserves_all_entries(self):
        result = self.append()
        target = Path(result['path'])
        original = Path.read_text
        def slow_read(path, *args, **kwargs):
            content = original(path, *args, **kwargs)
            if path == target:
                time.sleep(0.01)
            return content
        with patch.object(Path, 'read_text', slow_read):
            with ThreadPoolExecutor(max_workers=8) as pool:
                list(pool.map(lambda _: self.append(), range(16)))
        self.assertEqual(len(json.loads(target.read_text())), 17)

    def test_failed_replace_preserves_original(self):
        target = Path(self.append()['path'])
        original = target.read_bytes()
        with patch.object(Path, 'replace', side_effect=OSError('synthetic write failure')):
            with self.assertRaises(OSError):
                self.append()
        self.assertEqual(target.read_bytes(), original)
        self.assertFalse(list(target.parent.glob('*.tmp')))

    def test_historical_date_mismatch_rejected(self):
        with self.assertRaises(ValueError):
            raw.append_entries(self.entry, self.root, '2026-08-30', self.root, 'probe')
        self.assertFalse((self.root / 'raw').exists())

    def test_registry_parallel_updates_and_corruption_preservation(self):
        def register(index):
            project = self.root / f"project-{index}"
            project.mkdir(exist_ok=True)
            return raw.register_project(project, self.root, f"Project {index}",
                                        f"project-{index}", None, "work")
        with ThreadPoolExecutor(max_workers=8) as pool:
            list(pool.map(register, range(16)))
        registry = self.root / "raw/projects.json"
        self.assertEqual(len(json.loads(registry.read_text())), 16)
        registry.write_text("invalid original")
        with self.assertRaises(ValueError):
            register(17)
        self.assertEqual(registry.read_text(), "invalid original")

    def test_empty_month_and_explicit_missing_archive(self):
        command = [sys.executable, '-B', str(ROOT / 'skills/monthly/scripts/prepare_monthly_data.py'),
                   '--vault', str(self.root), '--month', '2026-08',
                   '--signals-output', str(self.root / 'signals.json'),
                   '--skeleton-output', str(self.root / 'skeleton.json')]
        run = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(run.returncode, 0, run.stderr)
        signals = json.loads((self.root / 'signals.json').read_text())
        self.assertEqual(signals['raw_entries'], [])
        self.assertEqual(signals['entries'], [])
        previous = (self.root / 'signals.json').read_bytes()
        failed = subprocess.run(command + ['--input', str(self.root / 'missing.md')],
                                capture_output=True, text=True)
        self.assertNotEqual(failed.returncode, 0)
        self.assertEqual((self.root / 'signals.json').read_bytes(), previous)

    def test_daily_formats_preserve_body_through_archive_and_parser(self):
        for date in ('2026.08.31', '2026-08-31'):
            with self.subTest(date=date):
                note = self.root / 'Daily Note.md'
                body = f'### {date}\n\n- [Probe]\n  - 进展：已记录，仍待验证\n'
                note.write_text(body)
                months, _ = split.parse_daily_note(note)
                self.assertEqual(''.join(months['2026-08']), body)
                archive = self.root / '2026-08.md'
                archive.write_text(''.join(months['2026-08']))
                parsed = monthly.parse_monthly_file(archive)
                self.assertEqual(parsed['total_days'], 1)
                self.assertIn('已记录，仍待验证', parsed['entries'][0]['raw_text'])


if __name__ == '__main__':
    unittest.main()
