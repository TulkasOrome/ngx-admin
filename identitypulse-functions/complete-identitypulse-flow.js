// complete-identitypulse-flow-fixed.js
const fetch = require('node-fetch');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Configuration
const FUNCTIONS_URL = 'http://localhost:7071/api';
const BACKEND_URL = 'http://localhost:8000/api';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise(resolve => rl.question(prompt, resolve));
}

// Check if services are running
async function checkServices() {
    log('\n🔍 Checking services...', 'cyan');
    let allGood = true;
    
    // Check Backend
    try {
        const response = await fetch(`${BACKEND_URL.replace('/api', '')}/health`);
        const data = await response.json();
        if (data.status === 'healthy') {
            log('  ✅ Backend is running', 'green');
        } else {
            log('  ⚠️ Backend health issue', 'yellow');
        }
    } catch (error) {
        log('  ❌ Backend not running! Start with: cd backend && uvicorn app.main:app --reload', 'red');
        allGood = false;
    }
    
    // Check Azure Functions
    try {
        const response = await fetch('http://localhost:7071');
        log('  ✅ Azure Functions are running', 'green');
    } catch (error) {
        log('  ❌ Azure Functions not running! Start with: cd identitypulse-functions && func start', 'red');
        allGood = false;
    }
    
    return allGood;
}

// Update local.settings.json for AUTO_APPROVE mode
async function setAutoApproveMode(enabled) {
    // Try multiple possible locations for local.settings.json
    const possiblePaths = [
        'local.settings.json',
        path.join(__dirname, 'local.settings.json'),
        path.join(process.cwd(), 'local.settings.json'),
        path.join(process.cwd(), 'identitypulse-functions', 'local.settings.json')
    ];
    
    let settingsPath = null;
    let settings = null;
    
    // Find the file
    for (const testPath of possiblePaths) {
        try {
            if (fs.existsSync(testPath)) {
                const content = fs.readFileSync(testPath, 'utf8');
                settings = JSON.parse(content);
                settingsPath = testPath;
                log(`  📄 Found settings at: ${testPath}`, 'cyan');
                break;
            }
        } catch (error) {
            // Continue to next path
        }
    }
    
    if (!settingsPath || !settings) {
        log(`  ⚠️ Could not find local.settings.json`, 'yellow');
        log(`  📝 Please set AUTO_APPROVE manually in your local.settings.json to: ${enabled}`, 'yellow');
        return false;
    }
    
    try {
        settings.Values.AUTO_APPROVE = enabled ? "true" : "false";
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        log(`  ✅ AUTO_APPROVE set to: ${enabled}`, 'green');
        return true;
    } catch (error) {
        log(`  ❌ Could not update settings: ${error.message}`, 'red');
        log(`  📝 Please manually set AUTO_APPROVE to: ${enabled}`, 'yellow');
        return false;
    }
}

// ==========================================
// AUTOMATED APPROVAL FLOW
// ==========================================
async function runAutomatedFlow() {
    console.clear();
    log('=================================================', 'magenta');
    log('  AUTOMATED APPROVAL FLOW', 'magenta');
    log('  (User is automatically approved after OTP)', 'cyan');
    log('=================================================', 'magenta');
    
    // Set AUTO_APPROVE to true
    log('\n⚙️ Setting AUTO_APPROVE mode to true...', 'blue');
    const updated = await setAutoApproveMode(true);
    
    if (updated) {
        log('  ⚠️ Please restart Azure Functions for the setting to take effect', 'yellow');
        log('  In the Azure Functions terminal, press Ctrl+C then run: func start', 'yellow');
    } else {
        log('\n  📝 Please manually edit local.settings.json:', 'yellow');
        log('     Set: "AUTO_APPROVE": "true"', 'cyan');
    }
    
    await question('\n  Press Enter after restarting Azure Functions...');
    
    const email = await question('\n📧 Enter email to test with (or press Enter for andyjwaugh@gmail.com): ');
    const testEmail = email || 'andyjwaugh@gmail.com';
    
    const formData = {
        firstName: 'Andy',
        lastName: 'Test',
        email: testEmail,
        company: 'Auto Test Company',
        phone: '+61412345678',
        country: 'Australia',
        useCase: 'Testing automated approval flow'
    };
    
    log('\n📊 Test User:', 'cyan');
    console.table(formData);
    
    // Step 1: Send OTP
    log('\n=================================================', 'magenta');
    log('  Step 1: Send OTP Email', 'cyan');
    log('=================================================', 'magenta');
    
    log('📤 Sending OTP to ' + testEmail + '...', 'blue');
    
    try {
        const response = await fetch(`${FUNCTIONS_URL}/SendOTP`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                company: formData.company
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            log('  ✅ OTP email sent!', 'green');
            log(`  📬 Check your inbox at: ${testEmail}`, 'yellow');
            log('  📧 Subject: "IdentityPulse - Verify Your Email"', 'cyan');
        } else {
            const error = await response.text();
            log('  ❌ Failed to send OTP: ' + error, 'red');
            return;
        }
    } catch (error) {
        log('  ❌ Error: ' + error.message, 'red');
        return;
    }
    
    // Step 2: Verify OTP
    const otp = await question('\n🔢 Enter the 6-digit OTP from your email: ');
    
    log('\n=================================================', 'magenta');
    log('  Step 2: Verify OTP & Auto-Approve User', 'cyan');
    log('=================================================', 'magenta');
    
    log('📤 Verifying OTP and creating user...', 'blue');
    
    try {
        const response = await fetch(`${FUNCTIONS_URL}/VerifyOTP`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                otp: otp,
                formData: formData
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            log('  ✅ OTP verified!', 'green');
            
            if (result.autoApproved) {
                log('  ✅ User automatically approved and created!', 'green');
                if (result.userId) {
                    log(`  👤 User ID: ${result.userId}`, 'cyan');
                }
                
                log('\n📬 Emails that were sent:', 'cyan');
                log('  1. ✅ Welcome email with login credentials (to user)', 'green');
                log('  2. ✅ New user notification (to sales team)', 'green');
                
                log('\n📧 Check your email for:', 'yellow');
                log('  • Login credentials', 'white');
                log('  • Getting started information', 'white');
                
            } else {
                log('  ⚠️ User was NOT auto-approved', 'yellow');
                log('  Check if AUTO_APPROVE is set to "true" in Azure Functions', 'yellow');
            }
            
        } else {
            log('  ❌ Verification failed: ' + (result.error || 'Unknown error'), 'red');
        }
    } catch (error) {
        log('  ❌ Error: ' + error.message, 'red');
    }
    
    log('\n=================================================', 'magenta');
    log('  Automated Flow Complete!', 'green');
    log('=================================================', 'magenta');
}

// ==========================================
// MANUAL APPROVAL FLOW
// ==========================================
async function runManualFlow() {
    console.clear();
    log('=================================================', 'magenta');
    log('  MANUAL APPROVAL FLOW', 'magenta');
    log('  (Admin must approve after OTP verification)', 'cyan');
    log('=================================================', 'magenta');
    
    // Set AUTO_APPROVE to false
    log('\n⚙️ Setting AUTO_APPROVE mode to false...', 'blue');
    const updated = await setAutoApproveMode(false);
    
    if (updated) {
        log('  ⚠️ Please restart Azure Functions for the setting to take effect', 'yellow');
        log('  In the Azure Functions terminal, press Ctrl+C then run: func start', 'yellow');
    } else {
        log('\n  📝 Please manually edit local.settings.json:', 'yellow');
        log('     Set: "AUTO_APPROVE": "false"', 'cyan');
    }
    
    await question('\n  Press Enter after restarting Azure Functions...');
    
    const email = await question('\n📧 Enter email to test with (or press Enter for andyjwaugh@gmail.com): ');
    const testEmail = email || 'andyjwaugh@gmail.com';
    
    const formData = {
        firstName: 'Andy',
        lastName: 'Manual',
        email: testEmail,
        company: 'Manual Test Company',
        phone: '+61412345678',
        country: 'Australia',
        useCase: 'Testing manual approval flow'
    };
    
    log('\n📊 Test User:', 'cyan');
    console.table(formData);
    
    // Step 1: Send OTP
    log('\n=================================================', 'magenta');
    log('  Step 1: Send OTP Email', 'cyan');
    log('=================================================', 'magenta');
    
    log('📤 Sending OTP to ' + testEmail + '...', 'blue');
    
    try {
        const response = await fetch(`${FUNCTIONS_URL}/SendOTP`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                company: formData.company
            })
        });
        
        if (response.ok) {
            log('  ✅ OTP email sent!', 'green');
            log(`  📬 Check your inbox at: ${testEmail}`, 'yellow');
        } else {
            const error = await response.text();
            log('  ❌ Failed to send OTP: ' + error, 'red');
            return;
        }
    } catch (error) {
        log('  ❌ Error: ' + error.message, 'red');
        return;
    }
    
    // Step 2: Verify OTP
    const otp = await question('\n🔢 Enter the 6-digit OTP from your email: ');
    
    log('\n=================================================', 'magenta');
    log('  Step 2: Verify OTP', 'cyan');
    log('=================================================', 'magenta');
    
    log('📤 Verifying OTP...', 'blue');
    
    let approvalToken;
    try {
        // Verify OTP
        const verifyResponse = await fetch(`${FUNCTIONS_URL}/VerifyOTP`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                otp: otp,
                formData: formData
            })
        });
        
        const verifyResult = await verifyResponse.json();
        
        if (verifyResponse.ok && verifyResult.success) {
            log('  ✅ OTP verified!', 'green');
            log('  📧 Sales team has been notified', 'cyan');
            
            // Now create pending approval in backend
            log('\n📤 Creating pending approval...', 'blue');
            
            const approvalResponse = await fetch(`${BACKEND_URL}/approval/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testEmail,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    organization: formData.company,
                    reason: formData.useCase
                })
            });
            
            if (approvalResponse.ok) {
                const result = await approvalResponse.json();
                approvalToken = result.approval_token;
                log('  ✅ Pending approval created!', 'green');
                log(`  📋 Approval Token: ${approvalToken}`, 'yellow');
            } else {
                const error = await approvalResponse.json();
                if (error.detail && error.detail.includes('already')) {
                    log('  ⚠️ User already exists or pending', 'yellow');
                } else {
                    log('  ❌ Failed: ' + error.detail, 'red');
                }
                return;
            }
        } else {
            log('  ❌ OTP verification failed: ' + (verifyResult.error || 'Unknown error'), 'red');
            return;
        }
    } catch (error) {
        log('  ❌ Error: ' + error.message, 'red');
        return;
    }
    
    // Step 3: Manual Approval
    log('\n=================================================', 'magenta');
    log('  Step 3: Manual Approval Required', 'cyan');
    log('=================================================', 'magenta');
    
    log('\n📧 Admin approval link:', 'yellow');
    log(`  http://localhost:7071/api/ApproveUser?token=${approvalToken}`, 'cyan');
    
    log('\n👨‍💼 Options:', 'yellow');
    log('  1. Open the link above in a browser', 'white');
    log('  2. Or simulate approval here', 'white');
    
    const approveNow = await question('\nSimulate admin approval now? (y/n): ');
    
    if (approveNow.toLowerCase() === 'y') {
        log('\n📤 Approving user...', 'blue');
        
        // Generate credentials
        const username = testEmail.split('@')[0] + Math.floor(Math.random() * 1000);
        const password = 'Welcome' + Math.floor(Math.random() * 10000) + '!';
        
        try {
            const response = await fetch(`${BACKEND_URL}/approval/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    approval_token: approvalToken,
                    username: username,
                    password: password
                })
            });
            
            if (response.ok) {
                const user = await response.json();
                log('  ✅ User approved and created!', 'green');
                log(`\n  👤 User Details:`, 'cyan');
                log(`     ID: ${user.id}`, 'white');
                log(`     Username: ${username}`, 'white');
                log(`     Password: ${password}`, 'yellow');
                
                log('\n📬 In production, these emails would be sent:', 'cyan');
                log('  1. Welcome email with credentials (to user)', 'green');
                log('  2. Approval confirmation (to admin)', 'green');
            } else {
                const error = await response.json();
                log('  ❌ Failed: ' + error.detail, 'red');
            }
        } catch (error) {
            log('  ❌ Error: ' + error.message, 'red');
        }
    }
    
    log('\n=================================================', 'magenta');
    log('  Manual Flow Complete!', 'green');
    log('=================================================', 'magenta');
}

// ==========================================
// MAIN MENU
// ==========================================
async function main() {
    console.clear();
    log('=================================================', 'magenta');
    log('  IdentityPulse Complete Flow Testing', 'magenta');
    log('=================================================', 'magenta');
    
    // Check services first
    const servicesOk = await checkServices();
    if (!servicesOk) {
        log('\n❌ Please start all required services first!', 'red');
        rl.close();
        return;
    }
    
    log('\n📋 Select Test Flow:', 'cyan');
    log('  1. Automated Approval (AUTO_APPROVE=true)', 'white');
    log('     User is automatically approved after OTP', 'yellow');
    log('\n  2. Manual Approval (AUTO_APPROVE=false)', 'white');
    log('     Admin must approve after OTP verification', 'yellow');
    log('\n  3. Exit', 'white');
    
    const choice = await question('\nSelect option (1-3): ');
    
    switch(choice) {
        case '1':
            await runAutomatedFlow();
            break;
        case '2':
            await runManualFlow();
            break;
        default:
            log('\nGoodbye!', 'cyan');
    }
    
    rl.close();
}

// Run the application
main().catch(error => {
    log('\n❌ Fatal error: ' + error.message, 'red');
    console.error(error);
    rl.close();
});