Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Run($Description, $ScriptBlock) {
  Write-Host "==> $Description"
  & $ScriptBlock
}

function Assert-LastExit($Description) {
  if ($LASTEXITCODE -ne 0) {
    throw "$Description failed with exit code $LASTEXITCODE"
  }
}

$repo = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $repo
$tempVault = Join-Path ([System.IO.Path]::GetTempPath()) ("lode-roadmap-" + [System.Guid]::NewGuid().ToString("N"))

try {
  Run "Validate raw JSON examples" {
    Get-ChildItem -Path "examples/vault/raw" -Recurse -Filter "*.json" | ForEach-Object {
      python -m json.tool $_.FullName | Out-Null
      Assert-LastExit "json validation for $($_.FullName)"
    }
    python -m json.tool "examples/artifact-index.json" | Out-Null
    Assert-LastExit "json validation for examples/artifact-index.json"
  }

  Run "Validate artifact index upsert create/update" {
    New-Item -ItemType Directory -Force -Path $tempVault | Out-Null
    $first = python "skills/lode-arch-doc/scripts/lode_raw.py" upsert-artifact --artifact "examples/artifact-index.json" --cwd "." --vault $tempVault | ConvertFrom-Json
    Assert-LastExit "artifact upsert create"
    if ($first.action -ne "created" -or $first.total_artifacts -ne 1) {
      throw "Expected first artifact upsert to create one entry"
    }
    $second = python "skills/lode-arch-doc/scripts/lode_raw.py" upsert-artifact --artifact "examples/artifact-index.json" --cwd "." --vault $tempVault | ConvertFrom-Json
    Assert-LastExit "artifact upsert update"
    if ($second.action -ne "updated" -or $second.total_artifacts -ne 1) {
      throw "Expected second artifact upsert to update without duplicating"
    }
  }

  Run "Validate recall context helper" {
    $recall = python "skills/lode-session-start-recall/scripts/recall_context.py" --cwd "." --vault "examples/vault" --slug "storyboard-pipeline" --limit 5 | ConvertFrom-Json
    Assert-LastExit "recall context helper"
    if ($recall.open_questions.Count -lt 1 -or $recall.artifacts.Count -lt 1) {
      throw "Recall context did not include open questions and artifacts"
    }
  }

  Run "Validate intent target discovery" {
    $targets = python "skills/lode-intent-sync/scripts/intent_targets.py" --cwd "." | ConvertFrom-Json
    Assert-LastExit "intent target discovery"
    $paths = @($targets.targets | ForEach-Object { $_.repo_relative_path })
    foreach ($required in @("DESIGN.md", "PLAN.md", "AGENTS.md", "README.md")) {
      if ($paths -notcontains $required) {
        throw "Intent targets missing $required"
      }
    }
  }

  Run "Validate lifecycle derivation" {
    $state = python "skills/lode-hard-stuff-radar/scripts/derive_lifecycle.py" --vault "examples/vault" --slug "storyboard-pipeline" | ConvertFrom-Json
    Assert-LastExit "lifecycle derivation"
    if ($state.open_questions.Count -lt 1 -or $state.active_risks.Count -lt 1) {
      throw "Lifecycle derivation did not find expected open questions and risks"
    }
  }

  Run "Validate distillation candidates" {
    $distill = python "skills/lode-experience-distillation/scripts/distill_candidates.py" --vault "examples/vault" --slug "storyboard-pipeline" | ConvertFrom-Json
    Assert-LastExit "distillation candidates"
    if ($distill.candidates.Count -lt 1) {
      throw "Expected at least one distillation candidate"
    }
  }

  Run "Validate static roadmap contracts" {
    rg -n "开工 -> 实现探索 -> 同步意图 -> 收工 -> 周期复盘 -> 沉淀经验" README.md README.cn.md docs/roadmap.md | Out-Null
    Assert-LastExit "habit loop grep"
    rg -n "raw/artifacts|artifact index|Artifact Index" references docs skills | Out-Null
    Assert-LastExit "artifact governance grep"
    rg -n "lode-session-start-recall|lode-intent-sync|lode-hard-stuff-radar|lode-experience-distillation" README.md README.cn.md AGENTS.md cli/src/utils.ts cli/scripts/check-skills.mjs | Out-Null
    Assert-LastExit "new skill registration grep"
  }

  Run "Validate CLI build and skill packaging" {
    Push-Location "cli"
    try {
      npm run build
      Assert-LastExit "npm run build"
      npm run test:doctor
      Assert-LastExit "npm run test:doctor"
      npm run copy-skills
      Assert-LastExit "npm run copy-skills"
      npm run check-skills
      Assert-LastExit "npm run check-skills"
    } finally {
      Pop-Location
    }
  }

  Write-Host "Roadmap validation passed."
} finally {
  Pop-Location
  Remove-Item -LiteralPath $tempVault -Recurse -Force -ErrorAction SilentlyContinue
}
