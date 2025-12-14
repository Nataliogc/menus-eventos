
Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param([string]$InputFile, [string]$OutputFile)
    
    if (-not (Test-Path $InputFile)) { Write-Host "Missing $InputFile"; return }

    $img = [System.Drawing.Image]::FromFile($InputFile)
    $ratio = 300 / $img.Width
    $newHeight = [int]($img.Height * $ratio)
    
    $canvas = New-Object System.Drawing.Bitmap(300, $newHeight)
    $graph = [System.Drawing.Graphics]::FromImage($canvas)
    
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.DrawImage($img, 0, 0, 300, $newHeight)
    
    $canvas.Save($OutputFile, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    $img.Dispose()
    $canvas.Dispose()
    $graph.Dispose()
    
    Write-Host "Resized $InputFile to $OutputFile"
}

Resize-Image -InputFile "C:\Users\comun\Documents\GitHub\menus-eventos\img\guadiana logo.jpg" -OutputFile "C:\Users\comun\Documents\GitHub\menus-eventos\img\guadiana_small.jpg"

# Convert to Base64
$b64_guadiana = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\comun\Documents\GitHub\menus-eventos\img\guadiana_small.jpg"))
$b64_cumbria = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\comun\Documents\GitHub\menus-eventos\img\cumbria logo.jpg"))

$b64_guadiana | Out-File "C:\Users\comun\Documents\GitHub\menus-eventos\img\guadiana.b64" -Encoding ascii
$b64_cumbria | Out-File "C:\Users\comun\Documents\GitHub\menus-eventos\img\cumbria.b64" -Encoding ascii

Write-Host "Base64 generation complete."
