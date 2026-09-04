# Remove two /for-him overrides that can no longer apply.
#
# Both were recorded against page text that a later rebuild replaced, so neither
# their DOM path nor their stored "original" matches anything on the page. They
# are invisible to the editor -- Alt+click cannot find them -- and "Undo all"
# would take the whole page's edits with it, images included.
#
# Reads the live doc, drops just those two keys, writes it back. Everything else
# is left exactly as it is. Run:
#   powershell -ExecutionPolicy Bypass -File tools\remove-dead-overrides.ps1

$ErrorActionPreference = 'Stop'
$Base = 'https://ecosophy.pages.dev'
$Route = '/for-him'
$Dead = @(
  'div0/div0/div0/div2/div5/div1/div3',
  'div0/div0/div0/div2/div5/div1/div4'
)

Write-Host "Fetching the live overrides..." -ForegroundColor Cyan
$doc = Invoke-RestMethod -Uri "$Base/api/content?t=$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())" -Headers @{ 'cache-control' = 'no-cache' }

if (-not $doc.pages.$Route) { Write-Host "No overrides stored for $Route - nothing to do." -ForegroundColor Yellow; exit 0 }

$before = @($doc.pages.$Route.PSObject.Properties).Count
Write-Host "$Route currently has $before edits." -ForegroundColor Cyan

$found = @()
foreach ($k in $Dead) {
  $p = $doc.pages.$Route.PSObject.Properties[$k]
  if ($p) {
    $found += $k
    $o = [string]$p.Value.o; $v = [string]$p.Value.v
    Write-Host "`n  will remove: $k"
    Write-Host "     original: $($o.Substring(0,[Math]::Min(70,$o.Length)))..."
    Write-Host "     value   : $($v.Substring(0,[Math]::Min(70,$v.Length)))..."
  } else {
    Write-Host "`n  already gone: $k" -ForegroundColor Yellow
  }
}
if (-not $found.Count) { Write-Host "`nBoth are already removed - nothing to do." -ForegroundColor Green; exit 0 }

Write-Host ""
if ((Read-Host "Remove $($found.Count) dead edit(s) from $Route? (y/N)") -notmatch '^[Yy]') {
  Write-Host "Cancelled - nothing was changed." -ForegroundColor Yellow; exit 0
}

foreach ($k in $found) { $doc.pages.$Route.PSObject.Properties.Remove($k) }
$after = @($doc.pages.$Route.PSObject.Properties).Count

$sec = Read-Host "Editor password" -AsSecureString
$pw = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))

$body = $doc | ConvertTo-Json -Depth 12 -Compress
try {
  # The live deployment still predates PATCH, so send the whole doc. It was read
  # moments ago; do not leave an editor tab saving alongside this.
  $res = Invoke-RestMethod -Uri "$Base/api/content" -Method Put `
           -Headers @{ 'x-eco-key' = $pw; 'content-type' = 'application/json' } -Body $body
  Write-Host "`nSaved. $Route now has $after edits (was $before). updated=$($res.updated)" -ForegroundColor Green
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 401) { Write-Host "`nWrong password - nothing was changed." -ForegroundColor Red }
  else { Write-Host "`nFailed ($code) - nothing was changed. $($_.Exception.Message)" -ForegroundColor Red }
  exit 1
} finally {
  $pw = $null; [GC]::Collect()
}
