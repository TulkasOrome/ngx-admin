# IdentityPulse Deployment - Without ACS CLI
# Run this after manually creating the Communication Service

# Variables
$resourceGroupName = "rg-identitypulse-prod"
$location = "australiaeast"
$storageAccountName = "stidentitypulse8565"  # Your existing storage account
$functionAppName = "func-identitypulse-$(Get-Random -Maximum 9999)"
$appServicePlanName = "asp-identitypulse-prod"

Write-Host "Starting Function App deployment..." -ForegroundColor Green

# Create App Service Plan
Write-Host "Creating App Service Plan..." -ForegroundColor Yellow
az appservice plan create `
    --name $appServicePlanName `
    --resource-group $resourceGroupName `
    --location $location `
    --sku B1

# Create Function App
Write-Host "Creating Function App..." -ForegroundColor Yellow
az functionapp create `
    --name $functionAppName `
    --resource-group $resourceGroupName `
    --plan $appServicePlanName `
    --runtime node `
    --runtime-version 18 `
    --functions-version 4 `
    --storage-account $storageAccountName

# Get storage connection string
$storageConnectionString = $(az storage account show-connection-string `
    --name $storageAccountName `
    --resource-group $resourceGroupName `
    --query connectionString -o tsv)

# Configure Function App settings
Write-Host "Configuring Function App..." -ForegroundColor Yellow
Write-Host "NOTE: You'll need to add the ACS_CONNECTION_STRING manually!" -ForegroundColor Red

az functionapp config appsettings set `
    --name $functionAppName `
    --resource-group $resourceGroupName `
    --settings `
        "ACS_CONNECTION_STRING=PASTE_YOUR_ACS_CONNECTION_STRING_HERE" `
        "STORAGE_CONNECTION_STRING=$storageConnectionString" `
        "SALES_EMAIL=sales@marketsoft.com.au" `
        "SENDER_EMAIL=noreply@identitypulse.com" `
        "WEBSITE_NODE_DEFAULT_VERSION=~18"

# Enable CORS
$websiteUrl = "https://stidentitypulse8565.z8.web.core.windows.net"

az functionapp cors add `
    --name $functionAppName `
    --resource-group $resourceGroupName `
    --allowed-origins $websiteUrl "http://localhost:*" "https://localhost:*"

# Enable CORS credentials
az functionapp cors credentials `
    --name $functionAppName `
    --resource-group $resourceGroupName `
    --enable

# Output deployment information
Write-Host "`n=================================" -ForegroundColor Green
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "Website URL: $websiteUrl" -ForegroundColor Cyan
Write-Host "Function App Name: $functionAppName" -ForegroundColor Cyan
Write-Host "Function App URL: https://$functionAppName.azurewebsites.net" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT NEXT STEPS:" -ForegroundColor Red
Write-Host "1. Update ACS_CONNECTION_STRING in Function App Configuration" -ForegroundColor Yellow
Write-Host "2. Update the API_BASE_URL in access.html" -ForegroundColor Yellow
Write-Host "3. Deploy the function code" -ForegroundColor Yellow

# Save configuration
$config = @{
    ResourceGroup = $resourceGroupName
    StorageAccount = $storageAccountName
    FunctionApp = $functionAppName
    FunctionAppUrl = "https://$functionAppName.azurewebsites.net"
    WebsiteUrl = $websiteUrl
}
$config | ConvertTo-Json | Out-File "azure-config.json"
Write-Host "`nConfiguration saved to azure-config.json" -ForegroundColor Green