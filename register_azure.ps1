# Fixed Azure AD App Registration Script
param(
    [string]$AppName = "IdentityPulse-Portal",
    [switch]$DeleteExisting
)

Write-Host "Azure AD App Registration Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check Azure connection
$context = Get-AzContext
if (-not $context) {
    Write-Host "Not connected to Azure. Running Connect-AzAccount..." -ForegroundColor Yellow
    Connect-AzAccount
}

$tenantId = (Get-AzContext).Tenant.Id
Write-Host "Using Tenant ID: $tenantId" -ForegroundColor Green

# Check if app already exists
$existingApp = Get-AzADApplication -DisplayName $AppName -ErrorAction SilentlyContinue

if ($existingApp) {
    Write-Host "App '$AppName' already exists!" -ForegroundColor Yellow
    
    if ($DeleteExisting) {
        Write-Host "Deleting existing app..." -ForegroundColor Yellow
        Remove-AzADApplication -ApplicationId $existingApp.AppId -Force
        Start-Sleep -Seconds 5
    } else {
        Write-Host "Using existing app. To recreate, run with -DeleteExisting flag" -ForegroundColor Yellow
        $app = $existingApp
    }
}

if (-not $existingApp -or $DeleteExisting) {
    Write-Host "Creating new Azure AD App Registration..." -ForegroundColor Green
    
    try {
        # Create the app with proper parameters
        $app = New-AzADApplication -DisplayName $AppName `
            -AvailableToOtherTenants $false `
            -ReplyUrl @("http://localhost:4200", "https://identitypulse.azurestaticapps.net") `
            -ErrorAction Stop
        
        if ($app) {
            Write-Host "App created successfully!" -ForegroundColor Green
            Write-Host "App ID: $($app.AppId)" -ForegroundColor Green
        } else {
            throw "Failed to create app"
        }
    } catch {
        Write-Host "Error creating app: $_" -ForegroundColor Red
        exit 1
    }
}

# Create client secret
Write-Host "Creating client secret..." -ForegroundColor Green
try {
    $endDate = (Get-Date).AddYears(2)
    $secret = New-AzADAppCredential -ApplicationId $app.AppId -EndDate $endDate -ErrorAction Stop
    $clientSecret = $secret.SecretText
    Write-Host "Client secret created successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error creating client secret: $_" -ForegroundColor Red
    # Continue without secret for now
    $clientSecret = "CREATE_IN_PORTAL"
}

# Create service principal
Write-Host "Creating service principal..." -ForegroundColor Green
try {
    $sp = Get-AzADServicePrincipal -ApplicationId $app.AppId -ErrorAction SilentlyContinue
    if (-not $sp) {
        $sp = New-AzADServicePrincipal -ApplicationId $app.AppId -ErrorAction Stop
        Write-Host "Service principal created successfully!" -ForegroundColor Green
    } else {
        Write-Host "Service principal already exists" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error creating service principal: $_" -ForegroundColor Red
}

# Configure API permissions
Write-Host "Configuring API permissions..." -ForegroundColor Green
try {
    # Microsoft Graph API ID
    $graphApiId = "00000003-0000-0000-c000-000000000000"
    
    # User.Read permission
    $userReadPermission = @{
        Id = "e1fe6dd8-ba31-4d61-89e7-88639da4683d"
        Type = "Scope"
    }
    
    # Get current permissions
    $currentPermissions = Get-AzADApplication -ApplicationId $app.AppId | Select-Object -ExpandProperty RequiredResourceAccess
    
    # Check if Graph permissions already exist
    $graphPermissions = $currentPermissions | Where-Object { $_.ResourceAppId -eq $graphApiId }
    
    if (-not $graphPermissions) {
        # Add permissions using Update-AzADApplication
        $requiredResourceAccess = @{
            ResourceAppId = $graphApiId
            ResourceAccess = @($userReadPermission)
        }
        
        Update-AzADApplication -ApplicationId $app.AppId -RequiredResourceAccess @($requiredResourceAccess) -ErrorAction Stop
        Write-Host "API permissions configured successfully!" -ForegroundColor Green
    } else {
        Write-Host "API permissions already configured" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error configuring API permissions: $_" -ForegroundColor Red
    Write-Host "Please configure permissions manually in Azure Portal" -ForegroundColor Yellow
}

# Configure authentication
Write-Host "Configuring authentication settings..." -ForegroundColor Green
try {
    # Configure SPA redirect URIs
    $webConfig = @{
        RedirectUris = @(
            "http://localhost:4200",
            "https://identitypulse.azurestaticapps.net"
        )
        ImplicitGrantSettings = @{
            EnableIdTokenIssuance = $true
            EnableAccessTokenIssuance = $true
        }
    }
    
    Update-AzADApplication -ApplicationId $app.AppId -Web $webConfig -ErrorAction Stop
    Write-Host "Authentication configured successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error configuring authentication: $_" -ForegroundColor Red
    Write-Host "Please configure authentication manually in Azure Portal" -ForegroundColor Yellow
}

# Output configuration
Write-Host "`nAzure AD App Registration Details" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "App Name: $($app.DisplayName)" -ForegroundColor White
Write-Host "Application (client) ID: $($app.AppId)" -ForegroundColor Green
Write-Host "Directory (tenant) ID: $tenantId" -ForegroundColor Green
Write-Host "Client Secret: $clientSecret" -ForegroundColor Yellow
Write-Host "Object ID: $($app.Id)" -ForegroundColor White

# Save configuration
$config = @"
Azure AD App Registration Configuration
======================================
App Name: $($app.DisplayName)
Application (client) ID: $($app.AppId)
Directory (tenant) ID: $tenantId
Client Secret: $clientSecret
Object ID: $($app.Id)

Redirect URIs:
- http://localhost:4200 (development)
- https://identitypulse.azurestaticapps.net (production)

API Permissions:
- Microsoft Graph: User.Read (Delegated)
"@

$config | Out-File -FilePath "azure-app-config.txt" -Force
Write-Host "`nConfiguration saved to: azure-app-config.txt" -ForegroundColor Green

Write-Host "`nIMPORTANT: Save these values securely!" -ForegroundColor Red
Write-Host "Client secret will not be shown again." -ForegroundColor Red

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Update src/environments/environment.ts with clientId: '$($app.AppId)'" -ForegroundColor White
Write-Host "2. Update src/environments/environment.prod.ts with clientId: '$($app.AppId)'" -ForegroundColor White
Write-Host "3. If client secret shows 'CREATE_IN_PORTAL', create it manually in Azure Portal" -ForegroundColor White
Write-Host "4. Grant admin consent in Azure Portal for API permissions" -ForegroundColor White
Write-Host "5. Run deployment script after updating configuration" -ForegroundColor White