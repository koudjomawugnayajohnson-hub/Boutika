Add-Type -AssemblyName System.Drawing

$src = "C:\Users\koudj\OneDrive\Boutika\public\hero_image.png"
$dst = "C:\Users\koudj\OneDrive\Boutika\public\hero_image.jpg"

$image = [System.Drawing.Image]::FromFile($src)
$newWidth = 1280
$newHeight = [int]($image.Height * ($newWidth / $image.Width))

$bitmap = New-Object System.Drawing.Bitmap $newWidth, $newHeight
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($image, 0, 0, $newWidth, $newHeight)

$codecs = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()
$jpegCodec = $codecs | Where-Object { $_.MimeType -eq 'image/jpeg' }

$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$quality = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]75)
$encoderParams.Param[0] = $quality

$bitmap.Save($dst, $jpegCodec, $encoderParams)

$graphics.Dispose()
$bitmap.Dispose()
$image.Dispose()

Remove-Item $src
