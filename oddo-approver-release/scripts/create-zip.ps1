# Create release zip file
$releaseDir = "oddo-approver-release"
$zipFile = "oddo-approver-release.zip"

# Remove existing zip file
if (Test-Path $zipFile) {
    Remove-Item $zipFile
}

# Create zip file using PowerShell
Compress-Archive -Path "$releaseDir\*" -DestinationPath $zipFile -Force

Write-Host "Release package created: $zipFile"
Write-Host "Package size: $((Get-Item $zipFile).Length / 1MB) MB"
