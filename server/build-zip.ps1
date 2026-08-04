Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$serverDir = 'Z:\Developing\Mentorship-App\server'
$zipPath = "$serverDir\server-deploy.zip"

if (Test-Path $zipPath) { Remove-Item $zipPath }

$stream = [System.IO.File]::OpenWrite($zipPath)
$archive = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create)

$files = Get-ChildItem -Path $serverDir -Recurse | Where-Object { 
    !$_.PSIsContainer -and $_.FullName -notmatch '\\(node_modules|\.git|\.npm-cache|uploads|server-deploy\.zip|build-zip\.ps1|\.env)' 
}

foreach ($file in $files) {
    $relPath = $file.FullName.Substring($serverDir.Length + 1).Replace('\', '/')
    Write-Host "Adding: $relPath"
    $entry = $archive.CreateEntry($relPath, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $fileStream = [System.IO.File]::OpenRead($file.FullName)
    $fileStream.CopyTo($entryStream)
    $fileStream.Dispose()
    $entryStream.Dispose()
}

$archive.Dispose()
$stream.Dispose()
Write-Host "SUCCESS: Created $zipPath with POSIX forward slashes"
