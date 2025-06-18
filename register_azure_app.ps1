# 1-register-azure-app.ps1
# Run this script to register your app in Azure AD

$tenantId = "8bdc18c6-bf77-4267-adea-209af623f4fb"
$appName = "IdentityPulse-Portal"
$resourceGroup = "identity-pulse-sydney-rg"

Write-Host "Creating Azure AD App Registration..." -ForegroundColor Green

# Set your app details with both local and production URLs
$replyUrls = @(
    "http://localhost:4200",
    "http://localhost:4200/auth/callback",
    "https://identitypulse.azurestaticapps.net",
    "https://identitypulse.azurestaticapps.net/auth/callback"
)

# Create the app registration
$app = New-AzADApplication -DisplayName $appName -ReplyUrls $replyUrls -AvailableToOtherTenants $false

# Create a client secret (valid for 2 years)
$secret = New-AzADAppCredential -ApplicationId $app.ApplicationId -EndDate (Get-Date).AddYears(2)

# Create a service principal for the app
$sp = New-AzADServicePrincipal -ApplicationId $app.ApplicationId

# Get the Microsoft Graph Service Principal
$graphApp = Get-AzADServicePrincipal -Filter "appId eq '00000003-0000-0000-c000-000000000000'"

# Add User.Read permission
$userReadPermission = $graphApp.OAuth2PermissionScopes | Where-Object { $_.Value -eq "User.Read" }

Add-AzADAppPermission -ApplicationId $app.ApplicationId `
    -ApiId $graphApp.AppId `
    -PermissionId $userReadPermission.Id `
    -Type Scope

# Enable ID tokens and Access tokens
Update-AzADApplication -ApplicationId $app.ApplicationId -IdentifierUris "api://$($app.ApplicationId)"

# Output the details to a file
$configDetails = @"
Azure AD App Registration Details
=================================
App Name: $appName
Application (client) ID: $($app.ApplicationId)
Directory (tenant) ID: $tenantId
Client Secret: $($secret.SecretText)
Object ID: $($app.ObjectId)

IMPORTANT: Save these values securely!
Client secret will not be shown again.

Next Steps:
1. Update src/environments/environment.ts with these values
2. Update src/environments/environment.prod.ts with these values
3. Run 2-configure-static-webapp.ps1 after deploying to Azure
"@

$configDetails | Out-File -FilePath "azure-app-config.txt"
Write-Host $configDetails -ForegroundColor Yellow

Write-Host "`nApp Registration Created Successfully!" -ForegroundColor Green
Write-Host "Configuration saved to: azure-app-config.txt" -ForegroundColor Cyan