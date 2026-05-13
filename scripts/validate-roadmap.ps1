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
    $first = python "scripts/lode_raw.py" upsert-artifact --artifact "examples/artifact-index.json" --cwd "." --vault $tempVault | ConvertFrom-Json
    Assert-LastExit "artifact upsert create"
    if ($first.action -ne "created" -or $first.total_artifacts -ne 1) {
      throw "Expected first artifact upsert to create one entry"
    }
    $second = python "scripts/lode_raw.py" upsert-artifact --artifact "examples/artifact-index.json" --cwd "." --vault $tempVault | ConvertFrom-Json
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

  Run "Validate static roadmap contracts" {
    rg -n "开工 -> 实现探索 -> 收工 -> 周期复盘" README.md README.cn.md docs/roadmap.md | Out-Null
    Assert-LastExit "habit loop grep"
    rg -n "raw/artifacts|artifact index|Artifact Index" references docs skills | Out-Null
    Assert-LastExit "artifact governance grep"
    rg -n "sync_suggestions|Potentially Stale Intent Artifacts|Accumulating Risks|hard stuff this week|Candidate Rules" skills references | Out-Null
    Assert-LastExit "absorbed behavior grep"
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
