[CmdletBinding()]
param(
    [switch]$Install
)

$ErrorActionPreference = "Stop"

$appDir = Join-Path $PSScriptRoot "qeraat-native"
$nodeDir = "C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs"
$port = 5173
$hostName = "127.0.0.1"
$url = "http://$hostName`:$port/"

function Test-WebApp {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    }
    catch {
        return $false
    }
}

function Get-WebAppProcessId {
    $server = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($server) {
        return $server.OwningProcess
    }

    return $null
}

if (!(Test-Path (Join-Path $appDir "package.json"))) {
    throw "Could not find qeraat-native/package.json from $PSScriptRoot."
}

$npmCommand = Get-Command "npm.cmd" -ErrorAction SilentlyContinue
if ($npmCommand) {
    $npmPath = $npmCommand.Source
}
else {
    $npmPath = Join-Path $nodeDir "npm.cmd"
    if (!(Test-Path $npmPath)) {
        throw "npm.cmd was not found on PATH or at $npmPath."
    }

    $env:PATH = "$nodeDir;$env:PATH"
}
$npmPath = $npmPath.Trim()

Push-Location $appDir
try {
    $logDir = Join-Path $appDir ".codex-logs"
    if (!(Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir | Out-Null
    }

    if ($Install -or !(Test-Path (Join-Path $appDir "node_modules"))) {
        & $npmPath install --cache .npm-cache
    }

    if (Test-WebApp) {
        Write-Output "Qeraat web app is already running at $url"
        $processId = Get-WebAppProcessId
        if ($processId) {
            Write-Output "Process ID: $processId"
        }

        return
    }

    $outLog = Join-Path $logDir "vite.out.log"
    $errLog = Join-Path $logDir "vite.err.log"
    Remove-Item $outLog,$errLog -ErrorAction SilentlyContinue

    $runnerPath = Join-Path $logDir "start-vite.cmd"
    $runnerLines = @(
        "@echo off",
        "set ""PATH=$nodeDir;%PATH%""",
        "cd /d ""$appDir""",
        ('"{0}" run dev -- --host {1} --strictPort --clearScreen false 1>"{2}" 2>"{3}"' -f $npmPath, $hostName, $outLog, $errLog)
    )
    Set-Content -Path $runnerPath -Value $runnerLines -Encoding ASCII

    $processInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $processInfo.FileName = "cmd.exe"
    $processInfo.Arguments = "/d /c start ""qeraat-vite"" /min ""$runnerPath"""
    $processInfo.WorkingDirectory = $appDir
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $true

    [System.Diagnostics.Process]::Start($processInfo) | Out-Null

    for ($attempt = 1; $attempt -le 20; $attempt++) {
        Start-Sleep -Seconds 1

        if (Test-WebApp) {
            Write-Output "Qeraat web app is running at $url"
            $processId = Get-WebAppProcessId
            if ($processId) {
                Write-Output "Process ID: $processId"
            }

            Write-Output "Logs: $logDir"
            return
        }
    }

    if (Test-Path $outLog) {
        Get-Content $outLog -Tail 80
    }

    if (Test-Path $errLog) {
        Get-Content $errLog -Tail 80
    }

    throw "Timed out waiting for Vite to start on $url."
}
finally {
    Pop-Location
}
