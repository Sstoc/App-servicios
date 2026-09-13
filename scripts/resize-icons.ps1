Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot "..\public\logo-home.png"
$src = [System.Drawing.Image]::FromFile($srcPath)

$sizes = @(192, 512)
foreach ($size in $sizes) {
    $dest = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, 0, 0, $size, $size)
    $outPath = Join-Path $PSScriptRoot "..\public\pwa-$size.png"
    $dest.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $dest.Dispose()
    Write-Host "Generated $outPath"
}

$src.Dispose()
Write-Host "Done resizing icons."
