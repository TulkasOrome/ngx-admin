// identitypulse-functions/ApproveUser/index.js - With Strong Password Generation
const { EmailClient } = require("@azure/communication-email");
const crypto = require('crypto');

// Strong password generator function
function generateStrongPassword() {
    const length = 16; // 16 character password
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least 2 of each type for complexity
    for (let i = 0; i < 2; i++) {
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    // Fill the remaining characters randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password to avoid predictable patterns
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Generate secure username
function generateSecureUsername(email) {
    const prefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = crypto.randomBytes(3).toString('hex'); // 6 character hex string
    return `${prefix}_${randomSuffix}`;
}

module.exports = async function (context, req) {
    context.log('ApproveUser function triggered');
    
    const token = req.query.token || (req.body && req.body.token);
    const action = req.query.action || (req.body && req.body.action) || 'approve'; // Default to approve
    
    if (!token) {
        context.res = {
            status: 400,
            headers: { "Content-Type": "text/html" },
            body: generateHTMLResponse(false, "No token provided")
        };
        return;
    }
    
    context.log(`Processing ${action} for token: ${token}`);
    
    try {
        const fetch = require('node-fetch');
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        const emailClient = new EmailClient(process.env.ACS_CONNECTION_STRING);
        
        // Step 1: Verify the token with backend
        const verifyResponse = await fetch(`${backendUrl}/api/approval/verify/${token}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!verifyResponse.ok) {
            context.log('Token verification failed:', verifyResponse.status);
            context.res = {
                status: 400,
                headers: { "Content-Type": "text/html" },
                body: generateHTMLResponse(false, "Invalid or expired token", null, action)
            };
            return;
        }
        
        const userInfo = await verifyResponse.json();
        context.log('Token verified for:', userInfo.email);
        
        if (action === 'reject') {
            // ==========================================
            // REJECT USER
            // ==========================================
            context.log('Rejecting user:', userInfo.email);
            
            // Send rejection email to user
            const rejectionEmail = {
                senderAddress: process.env.SENDER_EMAIL,
                recipients: {
                    to: [{ 
                        address: userInfo.email, 
                        displayName: `${userInfo.first_name} ${userInfo.last_name}` 
                    }]
                },
                content: {
                    subject: "IdentityPulse Access Request - Update",
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; text-align: center;">
                                <h1 style="color: white; margin: 0;">Access Request Update</h1>
                            </div>
                            <div style="padding: 30px; background: #f7f9fc;">
                                <h2 style="color: #1a1a1a;">Hi ${userInfo.first_name},</h2>
                                <p style="color: #6b7280; font-size: 16px;">
                                    Thank you for your interest in IdentityPulse. After reviewing your access request, 
                                    we are unable to approve your account at this time.
                                </p>
                                <p style="color: #6b7280; font-size: 16px;">
                                    If you believe this is an error or would like to discuss your requirements further, 
                                    please contact our sales team at sales@identitypulse.ai
                                </p>
                                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                    <p style="color: #9ca3af; font-size: 14px; text-align: center;">
                                        © 2025 IdentityPulse. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    `
                }
            };
            
            await emailClient.beginSend(rejectionEmail);
            
            // Notify sales team
            const salesNotification = {
                senderAddress: process.env.SENDER_EMAIL,
                recipients: {
                    to: [{ address: process.env.SALES_EMAIL || "sales@identitypulse.ai" }]
                },
                content: {
                    subject: `User Rejected: ${userInfo.email}`,
                    html: `
                        <div style="font-family: Arial, sans-serif;">
                            <h2 style="color: #ef4444;">❌ User Access Rejected</h2>
                            <table style="border-collapse: collapse;">
                                <tr><td style="padding: 8px;"><strong>Name:</strong></td><td>${userInfo.first_name} ${userInfo.last_name}</td></tr>
                                <tr><td style="padding: 8px;"><strong>Email:</strong></td><td>${userInfo.email}</td></tr>
                                <tr><td style="padding: 8px;"><strong>Company:</strong></td><td>${userInfo.organization || 'N/A'}</td></tr>
                                <tr><td style="padding: 8px;"><strong>Action:</strong></td><td style="color: #ef4444;">REJECTED</td></tr>
                                <tr><td style="padding: 8px;"><strong>Date:</strong></td><td>${new Date().toLocaleString()}</td></tr>
                            </table>
                        </div>
                    `
                }
            };
            
            await emailClient.beginSend(salesNotification);
            
            context.res = {
                status: 200,
                headers: { "Content-Type": "text/html" },
                body: generateHTMLResponse(true, "User access rejected", userInfo, 'rejected')
            };
            
        } else {
            // ==========================================
            // APPROVE USER
            // ==========================================
            context.log('Approving user:', userInfo.email);
            
            // Generate secure credentials
            const username = generateSecureUsername(userInfo.email);
            const securePassword = generateStrongPassword();
            
            context.log('Generated secure credentials for user');
            
            // Complete registration in backend
            const completeResponse = await fetch(`${backendUrl}/api/approval/complete`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    approval_token: token,
                    username: username,
                    password: securePassword
                })
            });
            
            if (!completeResponse.ok) {
                const errorText = await completeResponse.text();
                context.log('User creation failed:', errorText);
                
                context.res = {
                    status: 500,
                    headers: { "Content-Type": "text/html" },
                    body: generateHTMLResponse(false, "Failed to create user account", userInfo, action)
                };
                return;
            }
            
            const newUser = await completeResponse.json();
            context.log('User created successfully:', newUser.id);
            
            // Send welcome email with secure credentials to user
            const welcomeEmail = {
                senderAddress: process.env.SENDER_EMAIL,
                recipients: {
                    to: [{ 
                        address: userInfo.email, 
                        displayName: `${userInfo.first_name} ${userInfo.last_name}` 
                    }]
                },
                content: {
                    subject: "Welcome to IdentityPulse - Your Secure Account Credentials",
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #4B7BF5, #3B5EDB); padding: 20px; text-align: center;">
                                <h1 style="color: white; margin: 0;">Welcome to IdentityPulse!</h1>
                            </div>
                            <div style="padding: 30px; background: #f7f9fc;">
                                <h2 style="color: #1a1a1a;">Hi ${userInfo.first_name},</h2>
                                <p style="color: #6b7280; font-size: 16px;">
                                    Great news! Your account has been approved and is ready to use. 
                                    Below are your secure login credentials.
                                </p>
                                
                                <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <h3 style="color: #4B7BF5; margin-top: 0;">Your Secure Login Credentials</h3>
                                    <table style="width: 100%;">
                                        <tr>
                                            <td style="padding: 8px 0;"><strong>Username:</strong></td>
                                            <td><code style="background: #f3f4f6; padding: 4px 8px; border-radius: 3px; font-family: monospace;">${username}</code></td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; vertical-align: top;"><strong>Password:</strong></td>
                                            <td><code style="background: #f3f4f6; padding: 4px 8px; border-radius: 3px; font-family: monospace; font-size: 12px; word-break: break-all; display: inline-block;">${securePassword}</code></td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0;"><strong>Email:</strong></td>
                                            <td>${userInfo.email}</td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <div style="background: #dbeafe; border: 1px solid #60a5fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                    <p style="color: #1e40af; margin: 0;">
                                        <strong>🔒 Security Notice:</strong> Your password has been generated using cryptographically secure methods and contains 16 characters including uppercase, lowercase, numbers, and special characters. This provides maximum security for your account.
                                    </p>
                                </div>
                                
                                <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                    <p style="color: #92400e; margin: 0;">
                                        <strong>⚠️ Important:</strong> For security reasons, this email is the only time your password will be shown. Please save these credentials immediately in a secure password manager.
                                    </p>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="https://lookup.identitypulse.ai/login" target="_blank" style="display: inline-block; padding: 12px 30px; background: #4B7BF5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                        Login to IdentityPulse
                                    </a>
                                </div>
                                
                                <h3 style="color: #1a1a1a;">Getting Started:</h3>
                                <ul style="color: #6b7280;">
                                    <li>Access our comprehensive API documentation</li>
                                    <li>Explore identity verification endpoints</li>
                                    <li>Set up your first integration</li>
                                    <li>Contact support for any assistance</li>
                                </ul>
                                
                                <h3 style="color: #1a1a1a;">Security Best Practices:</h3>
                                <ul style="color: #6b7280;">
                                    <li><strong>Store your credentials securely:</strong> Use a reputable password manager</li>
                                    <li><strong>Never share your password:</strong> Our team will never ask for it</li>
                                    <li><strong>Enable two-factor authentication:</strong> Add an extra layer of security when available</li>
                                    <li><strong>Report suspicious activity:</strong> Contact us immediately at security@identitypulse.ai</li>
                                </ul>
                            </div>
                        </div>
                    `
                }
            };
            
            await emailClient.beginSend(welcomeEmail);
            
            // Send confirmation to admin/sales
            const adminConfirmation = {
                senderAddress: process.env.SENDER_EMAIL,
                recipients: {
                    to: [{ address: process.env.SALES_EMAIL || "admin@identitypulse.ai" }]
                },
                content: {
                    subject: `User Approved: ${userInfo.email}`,
                    html: `
                        <div style="font-family: Arial, sans-serif;">
                            <h2 style="color: #10b981;">✅ User Successfully Approved</h2>
                            <table style="border-collapse: collapse;">
                                <tr><td style="padding: 8px;"><strong>Name:</strong></td><td>${userInfo.first_name} ${userInfo.last_name}</td></tr>
                                <tr><td style="padding: 8px;"><strong>Email:</strong></td><td>${userInfo.email}</td></tr>
                                <tr><td style="padding: 8px;"><strong>Username:</strong></td><td>${username}</td></tr>
                                <tr><td style="padding: 8px;"><strong>Company:</strong></td><td>${userInfo.organization || 'N/A'}</td></tr>
                                <tr><td style="padding: 8px;"><strong>User ID:</strong></td><td>${newUser.id}</td></tr>
                                <tr><td style="padding: 8px;"><strong>Password Strength:</strong></td><td>16 characters (High Security)</td></tr>
                                <tr><td style="padding: 8px;"><strong>Action:</strong></td><td style="color: #10b981;">APPROVED</td></tr>
                                <tr><td style="padding: 8px;"><strong>Date:</strong></td><td>${new Date().toLocaleString()}</td></tr>
                            </table>
                            <p>Welcome email with secure credentials has been sent to the user.</p>
                        </div>
                    `
                }
            };
            
            await emailClient.beginSend(adminConfirmation);
            
            context.res = {
                status: 200,
                headers: { "Content-Type": "text/html" },
                body: generateHTMLResponse(true, "User approved successfully!", {
                    ...userInfo,
                    username: username,
                    userId: newUser.id
                }, 'approved')
            };
        }
        
    } catch (error) {
        context.log.error('Error in ApproveUser:', error);
        
        context.res = {
            status: 500,
            headers: { "Content-Type": "text/html" },
            body: generateHTMLResponse(false, "An error occurred during the approval process", null, action, error.message)
        };
    }
};

function generateHTMLResponse(success, message, userInfo, action, debugInfo) {
    const isApproved = action === 'approved';
    const isRejected = action === 'rejected';
    const statusColor = success ? (isApproved ? '#10b981' : '#ef4444') : '#ef4444';
    const statusIcon = success ? (isApproved ? '✓' : '✗') : '⚠';
    const statusText = success ? 
        (isApproved ? 'User Approved' : isRejected ? 'User Rejected' : 'Action Completed') : 
        'Action Failed';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IdentityPulse - ${statusText}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
            overflow: hidden;
        }
        .header {
            background: ${statusColor};
            color: white;
            padding: 30px;
            text-align: center;
        }
        .status-icon {
            width: 80px;
            height: 80px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            margin: 0 auto 20px;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 16px;
            opacity: 0.95;
        }
        .content {
            padding: 30px;
        }
        .info-group {
            margin-bottom: 20px;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 8px;
        }
        .info-group h3 {
            color: #374151;
            margin-bottom: 10px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-item:last-child {
            border-bottom: none;
        }
        .info-label {
            color: #6b7280;
            font-size: 14px;
        }
        .info-value {
            color: #111827;
            font-weight: 600;
            font-size: 14px;
        }
        .action-summary {
            background: ${success ? (isApproved ? '#d1fae5' : '#fee2e2') : '#fee2e2'};
            border: 1px solid ${success ? (isApproved ? '#6ee7b7' : '#fca5a5') : '#fca5a5'};
            color: ${success ? (isApproved ? '#065f46' : '#991b1b') : '#991b1b'};
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .next-steps {
            margin-top: 20px;
            padding: 15px;
            background: #eff6ff;
            border: 1px solid #93c5fd;
            border-radius: 8px;
        }
        .next-steps h4 {
            color: #1e40af;
            margin-bottom: 10px;
        }
        .next-steps ul {
            margin: 10px 0 0 20px;
            color: #3730a3;
        }
        .next-steps li {
            margin: 5px 0;
        }
        .error-details {
            background: #fee2e2;
            border: 1px solid #fca5a5;
            color: #991b1b;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 12px;
            font-family: monospace;
            word-break: break-all;
        }
        .footer {
            padding: 20px;
            background: #f9fafb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            font-weight: 600;
        }
        .btn:hover {
            background: #4338ca;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="status-icon">${statusIcon}</div>
            <h1>${statusText}</h1>
            <p>${message}</p>
        </div>
        
        <div class="content">
            ${userInfo ? `
                <div class="info-group">
                    <h3>User Information</h3>
                    <div class="info-item">
                        <span class="info-label">Name</span>
                        <span class="info-value">${userInfo.first_name} ${userInfo.last_name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email</span>
                        <span class="info-value">${userInfo.email}</span>
                    </div>
                    ${userInfo.organization ? `
                    <div class="info-item">
                        <span class="info-label">Organization</span>
                        <span class="info-value">${userInfo.organization}</span>
                    </div>
                    ` : ''}
                    ${userInfo.userId ? `
                    <div class="info-item">
                        <span class="info-label">User ID</span>
                        <span class="info-value">${userInfo.userId}</span>
                    </div>
                    ` : ''}
                    ${userInfo.username ? `
                    <div class="info-item">
                        <span class="info-label">Username</span>
                        <span class="info-value">${userInfo.username}</span>
                    </div>
                    ` : ''}
                </div>
            ` : ''}
            
            ${success && isApproved ? `
                <div class="action-summary">
                    <strong>✅ User Successfully Approved</strong><br>
                    The user has been created with a secure 16-character password and will receive their login credentials via email.
                </div>
                
                <div class="next-steps">
                    <h4>What happens next:</h4>
                    <ul>
                        <li>User receives welcome email with secure credentials</li>
                        <li>Password is cryptographically secure (16 characters)</li>
                        <li>User can login immediately</li>
                        <li>Sales team receives confirmation</li>
                        <li>User has full access to the platform</li>
                    </ul>
                </div>
            ` : ''}
            
            ${success && isRejected ? `
                <div class="action-summary">
                    <strong>❌ User Access Rejected</strong><br>
                    The user has been notified that their access request was not approved.
                </div>
                
                <div class="next-steps">
                    <h4>What happens next:</h4>
                    <ul>
                        <li>User receives notification email</li>
                        <li>Sales team receives confirmation</li>
                        <li>User can contact sales for more information</li>
                    </ul>
                </div>
            ` : ''}
            
            ${!success ? `
                <div class="action-summary">
                    <strong>⚠️ Action could not be completed</strong><br>
                    ${message}
                </div>
            ` : ''}
            
            ${debugInfo ? `
                <div class="error-details">
                    <strong>Debug Information:</strong><br>
                    ${debugInfo}
                </div>
            ` : ''}
            
            <div style="text-align: center;">
                <a href="https://lookup.identitypulse.ai/login" target="_blank" class="btn">Go to Login</a>
            </div>
        </div>
        
        <div class="footer">
            © 2025 IdentityPulse. All rights reserved.
        </div>
    </div>
</body>
</html>`;
}