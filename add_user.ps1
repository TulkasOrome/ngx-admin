# Azure AD User Creation using Az Module
param(
    [Parameter(Mandatory=$true)]
    [string]$FirstName,
    
    [Parameter(Mandatory=$true)]
    [string]$LastName,
    
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$true)]
    [string]$Company
)

$TenantId = "8bdc18c6-bf77-4267-adea-209af623f4fb"
$Domain = "identitypulse.ai"

Write-Host "=== Creating IdentityPulse User ===" -ForegroundColor Cyan

# Ensure connected
if (-not (Get-AzContext)) {
    Connect-AzAccount -TenantId $TenantId
}

# Generate username
$username = "$($FirstName.ToLower()).$($LastName.ToLower())@$Domain"
$username = $username -replace '[^a-zA-Z0-9.@]', ''

# Generate password
$password = -join ((65..90) + (97..122) + (48..57) + (33,35,64,42) | Get-Random -Count 16 | ForEach-Object {[char]$_})

Write-Host "Username: $username" -ForegroundColor Yellow

try {
    # Create password profile
    $PasswordProfile = @{
        Password = $password
        ForceChangePasswordNextSignIn = $true
    }
    
    # Create user
    $newUser = New-AzADUser `
        -DisplayName "$FirstName $LastName" `
        -UserPrincipalName $username `
        -MailNickname "$FirstName$LastName" `
        -GivenName $FirstName `
        -Surname $LastName `
        -Mail $Email `
        -CompanyName $Company `
        -UsageLocation "AU" `
        -PasswordProfile $PasswordProfile `
        -AccountEnabled
    
    Write-Host "✓ User created successfully!" -ForegroundColor Green
    Write-Host "User ID: $($newUser.Id)" -ForegroundColor Gray
    Write-Host "Password: $password" -ForegroundColor Yellow
    
    # Save credentials
    @{
        Username = $username
        Password = $password
        UserId = $newUser.Id
        Created = Get-Date
    } | ConvertTo-Json | Out-File "user-$FirstName-$LastName.json"
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}