# V2V Binary Setup Script
# Run this script once before first launch to download required binaries

$ErrorActionPreference = "Continue"

Write-Host "=== V2V Binary Setup ===" -ForegroundColor Cyan

# 1. Download FFmpeg Windows build
Write-Host "`n[1/3] Downloading FFmpeg..." -ForegroundColor Yellow
$ffmpegDir = ".\resources\ffmpeg\win32-x64"
New-Item -ItemType Directory -Force -Path $ffmpegDir | Out-Null

# Use BtbN FFmpeg Windows builds (faster than gyan.dev)
$ffmpegUrl = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
$ffmpegZip = "$env:TEMP\ffmpeg.zip"

if (-not (Test-Path "$ffmpegDir\ffmpeg.exe")) {
    Write-Host "  Downloading from GitHub..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $ffmpegUrl -OutFile $ffmpegZip -UseBasicParsing
    Write-Host "  Extracting..." -ForegroundColor Gray
    Expand-Archive -Path $ffmpegZip -DestinationPath "$env:TEMP\ffmpeg-temp" -Force

    # Find the bin directory inside the extracted folder
    $binDir = Get-ChildItem "$env:TEMP\ffmpeg-temp" -Directory | Select-Object -First 1
    $binPath = Join-Path $binDir.FullName "bin"

    Copy-Item "$binPath\ffmpeg.exe" $ffmpegDir
    Copy-Item "$binPath\ffprobe.exe" $ffmpegDir
    Copy-Item "$binPath\*.dll" $ffmpegDir

    Remove-Item $ffmpegZip -Force
    Remove-Item "$env:TEMP\ffmpeg-temp" -Recurse -Force
    Write-Host "  FFmpeg installed successfully!" -ForegroundColor Green
} else {
    Write-Host "  FFmpeg already installed." -ForegroundColor Green
}

# 2. Download whisper.cpp Windows binary
Write-Host "`n[2/3] Downloading whisper.cpp..." -ForegroundColor Yellow
$whisperDir = ".\resources\whisper\win32-x64"
New-Item -ItemType Directory -Force -Path $whisperDir | Out-Null

if (-not (Test-Path "$whisperDir\whisper-cli.exe")) {
    # whisper.cpp releases
    $whisperUrl = "https://github.com/ggml-org/whisper.cpp/releases/download/v1.7.5/whisper-bin-x64.zip"
    $whisperZip = "$env:TEMP\whisper.zip"

    try {
        Write-Host "  Downloading from GitHub..." -ForegroundColor Gray
        Invoke-WebRequest -Uri $whisperUrl -OutFile $whisperZip -UseBasicParsing
        Write-Host "  Extracting..." -ForegroundColor Gray
        Expand-Archive -Path $whisperZip -DestinationPath "$env:TEMP\whisper-temp" -Force

        $exe = Get-ChildItem "$env:TEMP\whisper-temp" -Recurse -Filter "whisper-cli.exe" | Select-Object -First 1
        if ($exe) {
            Copy-Item $exe.FullName $whisperDir

            # Also copy any needed DLLs
            $dlls = Get-ChildItem "$env:TEMP\whisper-temp" -Recurse -Filter "*.dll"
            foreach ($dll in $dlls) {
                Copy-Item $dll.FullName $whisperDir
            }

            Write-Host "  whisper.cpp installed successfully!" -ForegroundColor Green
        } else {
            Write-Host "  whisper-cli.exe not found in archive. You may need to compile whisper.cpp from source." -ForegroundColor Red
            Write-Host "  See: https://github.com/ggml-org/whisper.cpp" -ForegroundColor Gray
        }

        Remove-Item $whisperZip -Force
        Remove-Item "$env:TEMP\whisper-temp" -Recurse -Force
    } catch {
        Write-Host "  Download failed. You can manually compile whisper.cpp:" -ForegroundColor Red
        Write-Host "    git clone https://github.com/ggml-org/whisper.cpp.git" -ForegroundColor Gray
        Write-Host "    cd whisper.cpp && cmake -B build && cmake --build build --config Release" -ForegroundColor Gray
        Write-Host "    copy build\bin\Release\whisper-cli.exe to $whisperDir" -ForegroundColor Gray
    }
} else {
    Write-Host "  whisper.cpp already installed." -ForegroundColor Green
}

# 3. Download Whisper tiny model
Write-Host "`n[3/3] Downloading Whisper model..." -ForegroundColor Yellow
$modelDir = ".\models"
New-Item -ItemType Directory -Force -Path $modelDir | Out-Null

if (-not (Test-Path "$modelDir\ggml-tiny-q5_1.bin")) {
    $modelUrl = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny-q5_1.bin"
    Write-Host "  Downloading ggml-tiny-q5_1.bin (~31MB)..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $modelUrl -OutFile "$modelDir\ggml-tiny-q5_1.bin" -UseBasicParsing
    Write-Host "  Model downloaded!" -ForegroundColor Green
} else {
    Write-Host "  Model already downloaded." -ForegroundColor Green
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Run 'npm run start' to launch V2V." -ForegroundColor White
