<#
.SYNOPSIS
    Build the MCSE Android TWA app using Bubblewrap.

.DESCRIPTION
    Validates prerequisites, fetches the web manifest, checks icon availability,
    then runs bubblewrap update and build to produce app-release-bundle.aab.

    Signing passwords are prompted interactively — they are never stored in this script.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $ScriptDir

function Write-Step { param([string]$Message) Write-Host "`n[*] $Message" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Message) Write-Host "    OK: $Message" -ForegroundColor Green }
function Write-Fail { param([string]$Message) Write-Host "    FAIL: $Message" -ForegroundColor Red; Pop-Location; exit 1 }

# ─── 1. Check bubblewrap CLI ────────────────────────────────────────────────
Write-Step "Checking bubblewrap CLI..."
$bbw = Get-Command bubblewrap -ErrorAction SilentlyContinue
if (-not $bbw) {
    Write-Fail "bubblewrap CLI not found. Install it with: npm install -g @nicolo-ribaudo/bubblewrap"
}
Write-Ok "bubblewrap found at $($bbw.Source)"

# ─── 2. Check twa-manifest.json ─────────────────────────────────────────────
Write-Step "Checking twa-manifest.json..."
$manifestPath = Join-Path $ScriptDir "twa-manifest.json"
if (-not (Test-Path $manifestPath)) {
    Write-Fail "twa-manifest.json not found in $ScriptDir"
}

$twaManifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

# Validate no null values in critical fields
$requiredFields = @("packageId", "host", "name", "launcherName", "themeColor",
                    "backgroundColor", "startUrl", "iconUrl", "webManifestUrl")
foreach ($field in $requiredFields) {
    $value = $twaManifest.$field
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Fail "twa-manifest.json field '$field' is null or empty"
    }
}
Write-Ok "twa-manifest.json is valid (all required fields present)"

# ─── 3. Verify web manifest URL returns valid JSON ──────────────────────────
Write-Step "Fetching web manifest from $($twaManifest.webManifestUrl)..."
try {
    $response = Invoke-WebRequest -Uri $twaManifest.webManifestUrl -UseBasicParsing -TimeoutSec 15
    $null = $response.Content | ConvertFrom-Json
    Write-Ok "Web manifest is valid JSON ($($response.Content.Length) bytes)"
} catch {
    Write-Fail "Failed to fetch or parse web manifest: $_"
}

# ─── 4. Check icons exist in ../public/ ──────────────────────────────────────
Write-Step "Checking local icon files..."
$publicDir = Join-Path $ScriptDir ".." "public"
$icons = @("web-app-manifest-192x192.png", "web-app-manifest-512x512.png")
foreach ($icon in $icons) {
    $iconPath = Join-Path $publicDir $icon
    if (-not (Test-Path $iconPath)) {
        Write-Fail "Icon not found: $iconPath"
    }
    Write-Ok "$icon exists"
}

# ─── 5. Check signing key reference ─────────────────────────────────────────
Write-Step "Checking signing key configuration..."
$keystorePath = Join-Path $ScriptDir $twaManifest.signingKey.path
if (-not (Test-Path $keystorePath)) {
    Write-Host "    WARN: Keystore not found at $keystorePath" -ForegroundColor Yellow
    Write-Host "    You must create it before building. Run:" -ForegroundColor Yellow
    Write-Host "    keytool -genkeypair -v -keystore android.keystore -alias $($twaManifest.signingKey.alias) -keyalg RSA -keysize 2048 -validity 10000" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "    Continue anyway? (y/N)"
    if ($continue -ne "y") {
        Pop-Location; exit 1
    }
} else {
    Write-Ok "Keystore found at $keystorePath"
}

# ─── 6. Prompt for signing passwords ────────────────────────────────────────
Write-Step "Signing credentials (passwords are not stored)..."
$storePass = Read-Host "    Keystore password" -AsSecureString
$keyPass   = Read-Host "    Key password" -AsSecureString

$storePlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($storePass))
$keyPlain   = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPass))

if ([string]::IsNullOrWhiteSpace($storePlain) -or [string]::IsNullOrWhiteSpace($keyPlain)) {
    Write-Fail "Passwords cannot be empty"
}
Write-Ok "Credentials received"

# ─── 7. Build signed AAB bundle ─────────────────────────────────────────────
Write-Step "Building signed release bundle..."
& .\gradlew.bat bundleRelease "-PSTORE_PASSWORD=$storePlain" "-PKEY_PASSWORD=$keyPlain"

# Clear passwords from memory
$storePlain = $null; $keyPlain = $null
[System.GC]::Collect()

if ($LASTEXITCODE -ne 0) {
    Write-Fail "Gradle bundleRelease failed with exit code $LASTEXITCODE"
}
Write-Ok "Bundle build completed"

# ─── 8. Verify output artifact ──────────────────────────────────────────────
Write-Step "Verifying build output..."
$aabFiles = Get-ChildItem -Path $ScriptDir -Filter "*.aab" -Recurse -ErrorAction SilentlyContinue
if ($aabFiles.Count -eq 0) {
    Write-Fail "No .aab file found after build. Check build output above for errors."
}
foreach ($aab in $aabFiles) {
    Write-Ok "Built: $($aab.FullName) ($([math]::Round($aab.Length / 1MB, 2)) MB)"
}

Write-Host "`n[✓] Build complete! Upload the .aab file to the Google Play Console." -ForegroundColor Green
Pop-Location
