Add-Type -AssemblyName System.Drawing

$publicDir = Join-Path $PSScriptRoot "..\public"
$srcLogoPath = Join-Path $publicDir "logo-home.png"

# Hacemos copia de seguridad temporal en memoria
$originalImg = [System.Drawing.Image]::FromFile($srcLogoPath)

function Resize-ImageFile {
    param(
        [System.Drawing.Image]$source,
        [int]$width,
        [int]$height,
        [string]$outputPath,
        [System.Drawing.Imaging.ImageFormat]$format
    )
    $dest = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($source, 0, 0, $width, $height)
    
    # Si el archivo destino existe, primero lo guardamos en temp y reemplazamos
    $tempFile = [System.IO.Path]::GetTempFileName()
    $dest.Save($tempFile, $format)
    $g.Dispose()
    $dest.Dispose()

    Move-Item -Path $tempFile -Destination $outputPath -Force
    $sizeKb = [Math]::Round((Get-Item $outputPath).Length / 1024, 1)
    Write-Host "Generado $outputPath ($width x $height): $sizeKb KB"
}

# 1. logo-home.png: 512x512 (ideal para Retina displays, login y modals)
Resize-ImageFile $originalImg 512 512 (Join-Path $publicDir "logo-home-optimized.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 2. favicon.png: 128x128
Resize-ImageFile $originalImg 128 128 (Join-Path $publicDir "favicon-optimized.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 3. favicon.ico: 48x48
Resize-ImageFile $originalImg 48 48 (Join-Path $publicDir "favicon-optimized.ico") ([System.Drawing.Imaging.ImageFormat]::Icon)

$originalImg.Dispose()

# Ahora reemplazamos los archivos pesados originales por las versiones ultra-optimizadas
Move-Item (Join-Path $publicDir "logo-home-optimized.png") (Join-Path $publicDir "logo-home.png") -Force
Move-Item (Join-Path $publicDir "favicon-optimized.png") (Join-Path $publicDir "favicon.png") -Force
Move-Item (Join-Path $publicDir "favicon-optimized.ico") (Join-Path $publicDir "favicon.ico") -Force

Write-Host "¡Todas las imágenes fueron optimizadas con éxito!"
