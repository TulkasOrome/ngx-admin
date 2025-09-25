// test-local-flow.js - Complete local testing
const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:8000/api';
const FUNCTIONS_URL = 'http://localhost:7071/api';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

// Test 1: Check Backend Health
async function testBackendHealth() {
    log('\n📋 TEST 1: Backend Health Check', 'magenta');
    log('='*50, 'magenta');
    
    try {
        const response = await fetch('http://localhost:8000/health');
        const data = await response.json();
        
        if (data.status === 'healthy' && data.database === 'connected') {
            log('✅ Backend is healthy and database is connected', 'green');
            return true;
        } else {
            log('⚠️ Backend issue: ' + JSON.stringify(data), 'yellow');
            return false;
        }
    } catch (error) {
        log('❌ Backend not running: ' + error.message, 'red');
        return false;
    }
}

// Test 2: Create Pending Approval Directly in Backend
async function createPendingApproval(email) {
    log('\n📋 TEST 2: Create Pending Approval in Backend', 'magenta');
    log('='*50, 'magenta');
    
    const data = {
        email: email,
        first_name: 'Test',
        last_name: 'User',
        organization: 'Test Company',
        reason: 'Testing local flow'
    };
    
    try {
        const response = await fetch(`${BACKEND_URL}/approval/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const result = await response.json();
            log('✅ Approval request created', 'green');
            log('   Token: ' + result.approval_token, 'cyan');
            return result.approval_token;
        } else {
            const error = await response.text();
            log('❌ Failed to create approval: ' + error, 'red');
            
            // If user exists, try to delete them
            if (error.includes('already exists')) {
                log('   User already exists, please use a different email', 'yellow');
            }
            return null;
        }
    } catch (error) {
        log('❌ Error: ' + error.message, 'red');
        return null;
    }
}

// Test 3: Test Password Acceptance
async function testPasswordCreation(token) {
    log('\n📋 TEST 3: Test Password Creation', 'magenta');
    log('='*50, 'magenta');
    
    // Test different password formats
    const passwords = [
        { type: 'Simple', value: 'Password123' },
        { type: 'Complex No Special', value: 'Kp7mN9xR2La5wQ8t' },
        { type: 'With Special', value: 'Kp7#mN@9xR!2La$w' }
    ];
    
    for (const pwd of passwords) {
        log(`\nTesting ${pwd.type}: ${pwd.value}`, 'blue');
        
        const data = {
            approval_token: token,
            username: `testuser${Date.now()}`,
            password: pwd.value
        };
        
        try {
            const response = await fetch(`${BACKEND_URL}/approval/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const user = await response.json();
                log(`  ✅ ${pwd.type} password accepted! User ID: ${user.id}`, 'green');
                
                // Test login
                const loginResponse = await fetch(`${BACKEND_URL}/auth/signin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        password: pwd.value
                    })
                });
                
                if (loginResponse.ok) {
                    log('  ✅ Login successful with this password', 'green');
                } else {
                    log('  ❌ Login failed with this password', 'red');
                }
                
                return user;
            } else {
                const error = await response.text();
                log(`  ❌ ${pwd.type} password rejected: ${error}`, 'red');
            }
        } catch (error) {
            log(`  ❌ Error: ${error.message}`, 'red');
        }
    }
    
    return null;
}

// Test 4: Test via Azure Function
async function testViaAzureFunction(token) {
    log('\n📋 TEST 4: Test via Azure Function ApproveUser', 'magenta');
    log('='*50, 'magenta');
    
    const url = `${FUNCTIONS_URL}/ApproveUser?token=${token}&action=approve`;
    log('Calling: ' + url, 'blue');
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            timeout: 30000
        });
        
        if (response.ok) {
            log('✅ Azure Function executed successfully', 'green');
            // The response is HTML, so we just check status
            return true;
        } else {
            const text = await response.text();
            log('❌ Azure Function failed: ' + text.substring(0, 200), 'red');
            return false;
        }
    } catch (error) {
        log('❌ Error calling Azure Function: ' + error.message, 'red');
        return false;
    }
}

// Main test flow
async function runTests() {
    log('\n🚀 STARTING LOCAL INTEGRATION TESTS', 'magenta');
    log('='*60, 'magenta');
    
    // Check services
    const backendOk = await testBackendHealth();
    if (!backendOk) {
        log('\n❌ Please start the backend first!', 'red');
        log('   cd backend && uvicorn app.main:app --reload', 'yellow');
        return;
    }
    
    // Generate unique email
    const testEmail = `test${Date.now()}@example.com`;
    log(`\n📧 Using test email: ${testEmail}`, 'blue');
    
    // Create pending approval
    const token = await createPendingApproval(testEmail);
    if (!token) {
        log('\n❌ Could not create approval request', 'red');
        return;
    }
    
    // Test password creation directly
    await testPasswordCreation(token);
    
    // Test via Azure Function (need new token)
    const token2 = await createPendingApproval(`test${Date.now()}@example.com`);
    if (token2) {
        await testViaAzureFunction(token2);
    }
    
    log('\n✅ TESTS COMPLETE!', 'green');
    log('='*60, 'green');
}

// Run the tests
runTests().then(() => process.exit(0));