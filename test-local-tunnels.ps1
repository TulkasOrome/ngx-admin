# test-local-tunnels.ps1
# Test all Elasticsearch servers through SSH tunnels

$servers = @(
    @{ Name = "Australia"; Port = 9201 },
    @{ Name = "Indonesia"; Port = 9202 },
    @{ Name = "Japan"; Port = 9203 },
    @{ Name = "Malaysia"; Port = 9204 }
)

Write-Host "Testing Elasticsearch connections through SSH tunnels..." -ForegroundColor Cyan
Write-Host "Make sure you've run start-es-tunnels.ps1 first!" -ForegroundColor Yellow
Write-Host ""

foreach ($server in $servers) {
    Write-Host "Testing $($server.Name) on localhost:$($server.Port)..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$($server.Port)" -Method GET -TimeoutSec 5
        Write-Host "✓ Connected successfully" -ForegroundColor Green
        Write-Host "  Cluster: $($response.cluster_name)" -ForegroundColor Gray
        Write-Host "  Version: $($response.version.number)" -ForegroundColor Gray
        
        # Check cluster health
        $health = Invoke-RestMethod -Uri "http://localhost:$($server.Port)/_cluster/health" -Method GET
        $statusColor = "Gray"
        if ($health.status -eq "green") { $statusColor = "Green" }
        elseif ($health.status -eq "yellow") { $statusColor = "Yellow" }
        elseif ($health.status -eq "red") { $statusColor = "Red" }
        Write-Host "  Status: $($health.status)" -ForegroundColor $statusColor
        
        # Check indices
        try {
            $indices = Invoke-RestMethod -Uri "http://localhost:$($server.Port)/_cat/indices?format=json" -Method GET
            Write-Host "  Indices: $($indices.Count)" -ForegroundColor Gray
        } catch {
            Write-Host "  Indices: 0" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "✗ Connection failed: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test creating a test index in Australia
Write-Host "Creating test index in Australia server..." -ForegroundColor Yellow
$indexBody = @{
    mappings = @{
        properties = @{
            firstName = @{ type = "text" }
            lastName = @{ type = "text" }
            dateOfBirth = @{ type = "date" }
        }
    }
} | ConvertTo-Json -Depth 10

try {
    Invoke-RestMethod -Uri "http://localhost:9201/identity-test" -Method PUT -Body $indexBody -ContentType "application/json" | Out-Null
    Write-Host "✓ Test index created successfully" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*resource_already_exists_exception*") {
        Write-Host "⚠ Index already exists" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Failed to create index: $_" -ForegroundColor Red
    }
}