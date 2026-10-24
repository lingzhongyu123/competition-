$ErrorActionPreference = 'Stop'
$targetDir = Join-Path $PSScriptRoot '..\data\longmemeval'
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
$targetFile = Join-Path $targetDir 'longmemeval_oracle.json'
$sourceUrl = 'https://huggingface.co/datasets/xiaowu0162/longmemeval-cleaned/resolve/98d7416c24c778c2fee6e6f3006e7a073259d48f/longmemeval_oracle.json'
curl.exe -L --fail --connect-timeout 20 --max-time 300 $sourceUrl -o $targetFile
if ($LASTEXITCODE -ne 0) { throw 'Download failed' }
$actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $targetFile).Hash.ToLowerInvariant()
if ($actualHash -ne '821a2034d219ab45846873dd14c14f12cfe7776e73527a483f9dac095d38620c') { throw 'SHA-256 mismatch' }
$records = Get-Content -LiteralPath $targetFile -Raw -Encoding utf8 | ConvertFrom-Json
if ($records.Count -ne 500) { throw 'Expected 500 records' }
Write-Output ('Downloaded and verified: ' + $targetFile)
