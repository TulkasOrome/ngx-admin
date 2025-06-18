# Configure Azure AD App Registration
param(
    [string]$AppId = "23c5ab21-6d6d-47a2-abed-87dc774329b6"
)

Write-Host "Configuring Azure AD App Registration" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check if logged in
$context = Get-AzContext
if (-not $context) {
    Write-Host "Not logged in to Azure. Running Connect-AzAccount..." -ForegroundColor Yellow
    Connect-AzAccount
}

# Get the app
$app = Get-AzADApplication -ApplicationId $AppId
if (-not $app) {
    Write-Host "App not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Found app: $($app.DisplayName)" -ForegroundColor Green

# 1. Configure Redirect URIs for SPA
Write-Host "`nConfiguring Single Page Application redirect URIs..." -ForegroundColor Yellow

$spaRedirectUris = @(
    "http://localhost:4200",
    "https://identitypulse.azurestaticapps.net"
)

try {
    Update-AzADApplication -ApplicationId $AppId `
        -Web @{
            RedirectUri = $spaRedirectUris
            ImplicitGrantSetting = @{
                EnableAccessTokenIssuance = $true
                EnableIdTokenIssuance = $true
            }
        } `
        -ErrorAction Stop
    
    Write-Host "✓ Redirect URIs configured successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Error configuring redirect URIs: $_" -ForegroundColor Red
}

# 2. Configure API Permissions
Write-Host "`nConfiguring API permissions..." -ForegroundColor Yellow

# Microsoft Graph API ID
$graphApiId = "00000003-0000-0000-c000-000000000000"

# User.Read permission ID
$userReadPermissionId = "e1fe6dd8-ba31-4d61-89e7-88639da4683d"

# Create the required resource access object
$requiredResourceAccess = @{
    ResourceAppId = $graphApiId
    ResourceAccess = @(
        @{
            Id = $userReadPermissionId
            Type = "Scope"
        }
    )
}

try {
    Update-AzADApplication -ApplicationId $AppId `
        -RequiredResourceAccess @($requiredResourceAccess) `
        -ErrorAction Stop
    
    Write-Host "✓ API permissions configured successfully" -ForegroundColor Green
    Write-Host "  - Microsoft Graph: User.Read (Delegated)" -ForegroundColor White
} catch {
    Write-Host "✗ Error configuring API permissions: $_" -ForegroundColor Red
}

# 3. Set Identifier URI
Write-Host "`nSetting Identifier URI..." -ForegroundColor Yellow
$identifierUri = "api://$AppId"

try {
    Update-AzADApplication -ApplicationId $AppId `
        -IdentifierUri @($identifierUri) `
        -ErrorAction Stop
    
    Write-Host "✓ Identifier URI set to: $identifierUri" -ForegroundColor Green
} catch {
    Write-Host "✗ Error setting identifier URI: $_" -ForegroundColor Red
}

# 4. Check current configuration
Write-Host "`nCurrent App Configuration:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

$currentApp = Get-AzADApplication -ApplicationId $AppId
Write-Host "Display Name: $($currentApp.DisplayName)" -ForegroundColor White
Write-Host "Application ID: $($currentApp.AppId)" -ForegroundColor White
Write-Host "Object ID: $($currentApp.Id)" -ForegroundColor White

# Display redirect URIs
Write-Host "`nRedirect URIs:" -ForegroundColor Yellow
if ($currentApp.Web.RedirectUri) {
    $currentApp.Web.RedirectUri | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor White
    }
} else {
    Write-Host "  None configured" -ForegroundColor Red
}

# Display API permissions
Write-Host "`nAPI Permissions:" -ForegroundColor Yellow
if ($currentApp.RequiredResourceAccess) {
    foreach ($resource in $currentApp.RequiredResourceAccess) {
        if ($resource.ResourceAppId -eq $graphApiId) {
            Write-Host "  Microsoft Graph:" -ForegroundColor White
            foreach ($permission in $resource.ResourceAccess) {
                if ($permission.Id -eq $userReadPermissionId) {
                    Write-Host "    - User.Read (Delegated)" -ForegroundColor White
                }
            }
        }
    }
} else {
    Write-Host "  None configured" -ForegroundColor Red
}

Write-Host "`nIMPORTANT Manual Steps Required:" -ForegroundColor Red
Write-Host "===============================" -ForegroundColor Red
Write-Host "1. Go to Azure Portal > Azure Active Directory > App registrations" -ForegroundColor Yellow
Write-Host "2. Select 'IdentityPulse-Portal'" -ForegroundColor Yellow
Write-Host "3. Go to 'Authentication' section" -ForegroundColor Yellow
Write-Host "4. Under 'Platform configurations', click 'Add a platform'" -ForegroundColor Yellow
Write-Host "5. Select 'Single-page application'" -ForegroundColor Yellow
Write-Host "6. Add redirect URIs:" -ForegroundColor Yellow
Write-Host "   - http://localhost:4200" -ForegroundColor White
Write-Host "   - https://identitypulse.azurestaticapps.net" -ForegroundColor White
Write-Host "7. Check 'Access tokens' and 'ID tokens' under 'Implicit grant'" -ForegroundColor Yellow
Write-Host "8. Click 'Configure'" -ForegroundColor Yellow
Write-Host "" -ForegroundColor Yellow
Write-Host "9. Go to 'API permissions' section" -ForegroundColor Yellow
Write-Host "10. Click 'Grant admin consent for $($context.Tenant.Id)'" -ForegroundColor Yellow
Write-Host "" -ForegroundColor Yellow
Write-Host "11. Go to 'Certificates & secrets'" -ForegroundColor Yellow
Write-Host "12. Click 'New client secret'" -ForegroundColor Yellow
Write-Host "13. Add a description and expiry" -ForegroundColor Yellow
Write-Host "14. Copy the secret value immediately (it won't be shown again!)" -ForegroundColor Yellow

Write-Host "" -ForegroundColor Green
Write-Host "Press Enter to open Azure Portal..." -ForegroundColor Green
Read-Host
Start-Process "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Authentication/appId/$AppId"