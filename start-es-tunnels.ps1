# start-es-tunnels.ps1
# Script to create SSH tunnels to all Elasticsearch servers

$pemFile = ".\idpulse-es-key.pem"
$username = "esadmin"

$servers = @(
    @{
        Name = "Australia"
        IP = "68.218.20.143"
        LocalPort = 9201
    },
    @{
        Name = "Indonesia"
        IP = "4.194.177.159"
        LocalPort = 9202
    },
    @{
        Name = "Japan"
        IP = "130.33.64.251"
        LocalPort = 9203
    },
    @{
        Name = "Malaysia"
        IP = "52.148.66.168"
        LocalPort = 9204
    }
)

Write-Host "Starting SSH tunnels to all Elasticsearch servers..." -ForegroundColor Cyan

foreach ($server in $servers) {
    Write-Host "Starting tunnel to $($server.Name) ($($server.IP))..." -ForegroundColor Yellow
    
    $cmd = "ssh -i `"$pemFile`" -L $($server.LocalPort):localhost:9200 -N $username@$($server.IP)"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd -WindowStyle Minimized
    
    Write-Host "  → Local port $($server.LocalPort) forwarding to $($server.Name)" -ForegroundColor Green
}

Write-Host "`nAll tunnels started!" -ForegroundColor Green
Write-Host "`nLocal port mappings:" -ForegroundColor Cyan
Write-Host "  Australia:  http://localhost:9201" -ForegroundColor Gray
Write-Host "  Indonesia:  http://localhost:9202" -ForegroundColor Gray
Write-Host "  Japan:      http://localhost:9203" -ForegroundColor Gray
Write-Host "  Malaysia:   http://localhost:9204" -ForegroundColor Gray

Write-Host "`nPress any key to close all tunnels..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Kill all SSH processes
Get-Process ssh -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "All tunnels closed." -ForegroundColor Red