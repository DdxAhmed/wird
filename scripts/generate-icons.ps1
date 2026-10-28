[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Drawing

$width = 256
$height = 256
$bmp = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::Transparent)

# Background rounded rect
$rect = New-Object System.Drawing.Rectangle 12, 12, 232, 232
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$radius = 56
$d = $radius * 2
$path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
$path.AddArc(($rect.Right - $d), $rect.Y, $d, $d, 270, 90)
$path.AddArc(($rect.Right - $d), ($rect.Bottom - $d), $d, $d, 0, 90)
$path.AddArc($rect.X, ($rect.Bottom - $d), $d, $d, 90, 90)
$path.CloseFigure()

# Emerald gradient
$c1 = [System.Drawing.Color]::FromArgb(255, 5, 150, 105)
$c2 = [System.Drawing.Color]::FromArgb(255, 4, 120, 87)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 45.0
$g.FillPath($brush, $path)

# Subtle inner stroke
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(60, 255, 255, 255)), 2.5
$g.DrawPath($pen, $path)

# Draw Arabic letter Waw 'و'
$font = New-Object System.Drawing.Font "Segoe UI", 90, ([System.Drawing.FontStyle]::Bold)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center

$rectFShadow = New-Object System.Drawing.RectangleF 12.0, 16.0, 232.0, 232.0
$shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(60, 0, 40, 20))
$g.DrawString([char]0x0648, $font, $shadowBrush, $rectFShadow, $sf)

$rectFText = New-Object System.Drawing.RectangleF 12.0, 10.0, 232.0, 232.0
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g.DrawString([char]0x0648, $font, $textBrush, $rectFText, $sf)

# Save PNG
$resourcesDir = Join-Path $PSScriptRoot "..\resources"
if (-not (Test-Path $resourcesDir)) {
  New-Item -ItemType Directory -Path $resourcesDir -Force | Out-Null
}

$pngPath = Join-Path $resourcesDir "icon.png"
$icoPath = Join-Path $resourcesDir "icon.ico"

$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Convert to ICO
$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream $icoPath, ([System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

$g.Dispose()
$bmp.Dispose()

Write-Host "Icons generated successfully at $pngPath and $icoPath"
