#!/usr/bin/env python3
"""Compatibility wrapper for the local Decision Replay helper.

The implementation lives in decision_replay.py so query, roadmap, and recall
share one graph/index/query contract while each skill remains self-contained
after installation.
"""

from __future__ import annotations

from decision_replay import main


if __name__ == "__main__":
    raise SystemExit(main())
