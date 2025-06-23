# Create Function App with correct Node version

$resourceGroupName = "rg-identitypulse-prod"
$storageAccountName = "stidentitypulse8565"
$appServicePlanName = "asp-identitypulse-prod"
$functionAppName = "func-identitypulse-$(Get-Random -Maximum 9999)"

Write-Host "Creating Function App with Node.js 20..." -ForegroundColor Green

# Create the Function App with Node 20
az functionapp create `
    --name $functionAppName `
    --resource-group $resourceGroupName `
    --plan $appServicePlanName `
    --runtime node `
    --runtime-version 20 `
    --functions-version 4 `
    --storage-account $storageAccountName

# Wait a moment for the function app to be fully created
Write-Host "Waiting for Function App to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check if it was created
$functionAppCheck = az functionapp show `
    --name $functionAppName `
    --resource-group $resourceGroupName `
    --query "state" -o tsv

if ($functionAppCheck -eq "Running") {
    Write-Host "Function App created successfully!" -ForegroundColor Green
    
    # Get storage connection string
    $storageConnectionString = $(az storage account show-connection-string `
        --name $storageAccountName `
        --resource-group $resourceGroupName `
        --query connectionString -o tsv)
    
    # Configure Function App settings
    Write-Host "Configuring Function App settings..." -ForegroundColor Yellow
    az functionapp config appsettings set `
        --name $functionAppName `
        --resource-group $resourceGroupName `
        --settings `
            "ACS_CONNECTION_STRING=PASTE_YOUR_ACS_CONNECTION_STRING_HERE" `
            "STORAGE_CONNECTION_STRING=$storageConnectionString" `
            "SALES_EMAIL=sales@marketsoft.com.au" `
            "SENDER_EMAIL=noreply@identitypulse.com" `
            "WEBSITE_NODE_DEFAULT_VERSION=~20"
    
    # Enable CORS
    $websiteUrl = "https://stidentitypulse8565.z8.web.core.windows.net"
    
    Write-Host "Configuring CORS..." -ForegroundColor Yellow
    az functionapp cors add `
        --name $functionAppName `
        --resource-group $resourceGroupName `
        --allowed-origins $websiteUrl "http://localhost:3000" "https://localhost:3000"
    
    # Output the details
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "Function App Created Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Function App Name: $functionAppName" -ForegroundColor Cyan
    Write-Host "Function App URL: https://$functionAppName.azurewebsites.net" -ForegroundColor Cyan
    Write-Host "Website URL: $websiteUrl" -ForegroundColor Cyan
    
    # Save configuration
    $config = @{
        ResourceGroup = $resourceGroupName
        StorageAccount = $storageAccountName
        FunctionApp = $functionAppName
        FunctionAppUrl = "https://$functionAppName.azurewebsites.net"
        WebsiteUrl = $websiteUrl
    }
    $config | ConvertTo-Json | Out-File "azure-config.json" -Force
    
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "1. Create Azure Communication Service in the Portal" -ForegroundColor White
    Write-Host "2. Update ACS_CONNECTION_STRING in Function App settings" -ForegroundColor White
    Write-Host "3. Update API_BASE_URL in access.html to: https://$functionAppName.azurewebsites.net/api" -ForegroundColor White
    Write-Host "4. Deploy the function code using:" -ForegroundColor White
    Write-Host "   npm install" -ForegroundColor Gray
    Write-Host "   func azure functionapp publish $functionAppName" -ForegroundColor Gray
    
} else {
    Write-Host "Function App creation failed. Please check Azure Portal." -ForegroundColor Red
}