# inspect-es-indices.ps1
# Inspect indices on all Elasticsearch servers

$servers = @(
    @{ Name = "Australia"; Port = 9201; Country = "AU" },
    @{ Name = "Indonesia"; Port = 9202; Country = "ID" },
    @{ Name = "Japan"; Port = 9203; Country = "JP" },
    @{ Name = "Malaysia"; Port = 9204; Country = "MY" }
)

Write-Host "Inspecting Elasticsearch Indices..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

foreach ($server in $servers) {
    Write-Host "`n$($server.Name) Server (localhost:$($server.Port)):" -ForegroundColor Yellow
    
    try {
        # Get all indices
        $indices = Invoke-RestMethod -Uri "http://localhost:$($server.Port)/_cat/indices?format=json&v" -Method GET
        
        Write-Host "Found $($indices.Count) indices:" -ForegroundColor Green
        
        # Group and display indices
        $identityIndices = $indices | Where-Object { $_.index -like "*identity*" -or $_.index -like "*person*" -or $_.index -like "*individual*" }
        $otherIndices = $indices | Where-Object { $_.index -notlike "*identity*" -and $_.index -notlike "*person*" -and $_.index -notlike "*individual*" }
        
        if ($identityIndices) {
            Write-Host "`n  Identity-related indices:" -ForegroundColor Cyan
            foreach ($idx in $identityIndices) {
                $sizeInMB = [math]::Round([double]($idx.'store.size' -replace '[^\d.]') / 1MB, 2)
                Write-Host "    - $($idx.index): $($idx.'docs.count') docs, $sizeInMB MB, status: $($idx.health)" -ForegroundColor Gray
            }
        }
        
        if ($otherIndices) {
            Write-Host "`n  Other indices:" -ForegroundColor Cyan
            foreach ($idx in $otherIndices | Select-Object -First 5) {
                Write-Host "    - $($idx.index): $($idx.'docs.count') docs" -ForegroundColor Gray
            }
            if ($otherIndices.Count -gt 5) {
                Write-Host "    ... and $($otherIndices.Count - 5) more" -ForegroundColor DarkGray
            }
        }
        
        # Find the most likely identity index
        $primaryIndex = $null
        if ($identityIndices) {
            $primaryIndex = $identityIndices | Sort-Object { [int]$_.'docs.count' } -Descending | Select-Object -First 1
        } else {
            $primaryIndex = $indices | Sort-Object { [int]$_.'docs.count' } -Descending | Select-Object -First 1
        }
        
        if ($primaryIndex) {
            Write-Host "`n  Primary index appears to be: $($primaryIndex.index)" -ForegroundColor Green
            
            # Get mapping for primary index
            Write-Host "  Checking mapping..." -ForegroundColor Yellow
            try {
                $mapping = Invoke-RestMethod -Uri "http://localhost:$($server.Port)/$($primaryIndex.index)/_mapping" -Method GET
                $properties = $mapping.($primaryIndex.index).mappings.properties
                
                Write-Host "  Fields available:" -ForegroundColor Cyan
                $properties.PSObject.Properties | Select-Object -First 15 | ForEach-Object {
                    Write-Host "    - $($_.Name): $($_.Value.type)" -ForegroundColor Gray
                }
                if ($properties.PSObject.Properties.Count -gt 15) {
                    Write-Host "    ... and $($properties.PSObject.Properties.Count - 15) more fields" -ForegroundColor DarkGray
                }
                
                # Store the index name for later use
                Set-Content -Path "$($server.Country)-index.txt" -Value $primaryIndex.index
                
            } catch {
                Write-Host "  Could not retrieve mapping" -ForegroundColor Red
            }
        }
        
    } catch {
        Write-Host "  ✗ Failed to connect: $_" -ForegroundColor Red
    }
}

Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "Index inspection complete!" -ForegroundColor Green