# Azure Deployment Script for IdentityPulse Access Form
# Run this script in PowerShell after logging in with 'az login'

# Variables - Update these as needed
$resourceGroupName = "rg-identitypulse-prod"
$location = "australiaeast"
$storageAccountName = "stidentitypulse$(Get-Random -Maximum 9999)"
$functionAppName = "func-identitypulse-$(Get-Random -Maximum 9999)"
$appServicePlanName = "asp-identitypulse-prod"
$communicationServiceName = "acs-identitypulse-prod"
$keyVaultName = "kv-idpulse-$(Get-Random -Maximum 999)"

Write-Host "Starting IdentityPulse Azure deployment..." -ForegroundColor Green

# Create Resource Group
Write-Host "Creating Resource Group..." -ForegroundColor Yellow
az group create --name $resourceGroupName --location $location

# Create Storage Account for static website hosting
Write-Host "Creating Storage Account..." -ForegroundColor Yellow
az storage account create `
    --name $storageAccountName `
    --resource-group $resourceGroupName `
    --location $location `
    --sku Standard_LRS `
    --kind StorageV2 `
    --allow-blob-public-access true

# Enable static website hosting
Write-Host "Enabling static website hosting..." -ForegroundColor Yellow
az storage blob service-properties update `
    --account-name $storageAccountName `
    --static-website `
    --index-document "access.html" `
    --404-document "404.html"

# Get storage account key
$storageKey = $(az storage account keys list `
    --resource-group $resourceGroupName `
    --account-name $storageAccountName `
    --query "[0].value" -o tsv)

# Upload HTML files to blob storage
Write-Host "Uploading website files..." -ForegroundColor Yellow
az storage blob upload `
    --account-name $storageAccountName `
    --account-key $storageKey `
    --container-name '$web' `
    --file "access.html" `
    --name "access.html" `
    --content-type "text/html"

# Create Azure Communication Service for email
Write-Host "Creating Azure Communication Service..." -ForegroundColor Yellow
az communication create `
    --name $communicationServiceName `
    --resource-group $resourceGroupName `
    --location "global" `
    --data-location "Australia"

# Get Communication Service connection string
$acsConnectionString = $(az communication list-key `
    --name $communicationServiceName `
    --resource-group $resourceGroupName `
    --query "primaryConnectionString" -o tsv)

# Create Key Vault for storing secrets
Write-Host "Creating Key Vault..." -ForegroundColor Yellow
az keyvault create `
    --name $keyVaultName `
    --resource-group $resourceGroupName `
    --location $location `
    --enabled-for-azure-disk-encryption `
    --enabled-for-deployment `
    --enabled-for-template-deployment

# Store ACS connection string in Key Vault
Write-Host "Storing secrets in Key Vault..." -ForegroundColor Yellow
az keyvault secret set `
    --vault-name $keyVaultName `
    --name "AcsConnectionString" `
    --value $acsConnectionString

# Create App Service Plan for Function App
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

# Configure Function App settings
Write-Host "Configuring Function App..." -ForegroundColor Yellow
az functionapp config appsettings set `
    --name $functionAppName `
    --resource-group $resourceGroupName `
    --settings `
        "ACS_CONNECTION_STRING=$acsConnectionString" `
        "STORAGE_CONNECTION_STRING=$(az storage account show-connection-string --name $storageAccountName --resource-group $resourceGroupName --query connectionString -o tsv)" `
        "SALES_EMAIL=sales@marketsoft.com.au" `
        "SENDER_EMAIL=noreply@identitypulse.com"

# Enable CORS for the static website
$websiteUrl = $(az storage account show `
    --name $storageAccountName `
    --resource-group $resourceGroupName `
    --query "primaryEndpoints.web" -o tsv)

az functionapp cors add `
    --name $functionAppName `
    --resource-group $resourceGroupName `
    --allowed-origins $websiteUrl

# Output deployment information
Write-Host "`nDeployment completed successfully!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Website URL: $websiteUrl" -ForegroundColor Cyan
Write-Host "Function App URL: https://$functionAppName.azurewebsites.net" -ForegroundColor Cyan
Write-Host "Resource Group: $resourceGroupName" -ForegroundColor Cyan
Write-Host "Storage Account: $storageAccountName" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Deploy the Azure Functions code using 'func azure functionapp publish $functionAppName'" -ForegroundColor White
Write-Host "2. Configure email domain in Azure Communication Service" -ForegroundColor White
Write-Host "3. Update the frontend JavaScript with the Function App URL" -ForegroundColor White

# Save configuration to file
$config = @{
    ResourceGroup = $resourceGroupName
    StorageAccount = $storageAccountName
    FunctionApp = $functionAppName
    WebsiteUrl = $websiteUrl
    FunctionUrl = "https://$functionAppName.azurewebsites.net"
}
$config | ConvertTo-Json | Out-File "azure-config.json"
Write-Host "`nConfiguration saved to azure-config.json" -ForegroundColor Green