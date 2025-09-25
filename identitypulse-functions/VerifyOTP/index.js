// identitypulse-functions/VerifyOTP/index.js - Simple Strong Password Generation
const { EmailClient } = require("@azure/communication-email");
const { TableClient } = require("@azure/data-tables");
const crypto = require('crypto');

// Simple strong password generator - no special characters
function generateStrongPassword() {
    const length = 16;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = uppercase + lowercase + numbers;
    
    let password = '';
    
    // Ensure at least 2 of each type for complexity
    for (let i = 0; i < 2; i++) {
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
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
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `${prefix}${randomSuffix}`;
}

module.exports = async function (context, req) {
    context.log('VerifyOTP function triggered');

    // Set CORS headers immediately
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: headers
        };
        return;
    }

    // Initialize response with headers
    context.res = {
        headers: headers
    };

    try {
        const { email, otp, formData } = req.body || {};
        
        context.log('Request received for email:', email);

        if (!email || !otp) {
            context.res.status = 400;
            context.res.body = JSON.stringify({ 
                success: false, 
                error: 'Missing email or OTP' 
            });
            return;
        }

        // Retrieve OTP from Azure Table Storage
        const tableClient = TableClient.fromConnectionString(
            process.env.STORAGE_CONNECTION_STRING,
            "otpverification"
        );

        let entity;
        try {
            entity = await tableClient.getEntity("OTP", email);
        } catch (error) {
            if (error.statusCode === 404) {
                context.log('OTP not found for email:', email);
                context.res.status = 400;
                context.res.body = JSON.stringify({ 
                    success: false, 
                    error: 'Invalid or expired OTP' 
                });
                return;
            }
            throw error;
        }
        
        // Validate OTP
        const now = new Date();
        const expiresAt = new Date(entity.expiresAt);
        
        if (entity.otp !== otp) {
            context.log('Invalid OTP provided');
            context.res.status = 400;
            context.res.body = JSON.stringify({ 
                success: false, 
                error: 'Invalid OTP' 
            });
            return;
        }
        
        if (now > expiresAt) {
            context.log('OTP expired');
            context.res.status = 400;
            context.res.body = JSON.stringify({ 
                success: false, 
                error: 'OTP has expired' 
            });
            return;
        }
        
        if (entity.verified) {
            context.log('OTP already used');
            context.res.status = 400;
            context.res.body = JSON.stringify({ 
                success: false, 
                error: 'OTP already used' 
            });
            return;
        }

        // Mark OTP as verified
        entity.verified = true;
        await tableClient.updateEntity(entity);
        context.log('OTP verified successfully');

        // Check AUTO_APPROVE mode
        const isAutoApprove = process.env.AUTO_APPROVE === 'true';
        context.log('AUTO_APPROVE mode:', isAutoApprove);

        const emailClient = new EmailClient(process.env.ACS_CONNECTION_STRING);
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        
        // Determine the correct Function App URL based on environment
        let functionUrl;
        if (process.env.FUNCTION_APP_URL && process.env.FUNCTION_APP_URL.includes('azurewebsites.net')) {
            // Production - use the deployed URL
            functionUrl = process.env.FUNCTION_APP_URL;
        } else {
            // Local development
            functionUrl = 'http://localhost:7071';
        }
        
        context.log('Using Function URL:', functionUrl);
        
        // Determine admin email
        let adminEmail = process.env.SALES_EMAIL || "admin@identitypulse.ai";
        // Allow same email for testing with Gmail + variations
        if (adminEmail === formData.email && !formData.email.includes('+')) {
            context.log('Admin email same as user email, using fallback');
            adminEmail = "admin+approval@identitypulse.ai";
        }
        
        // Create approval request in backend
        const fetch = require('node-fetch');
        let approvalToken = null;
        let userExists = false;
        
        try {
            context.log('Creating approval request in backend...');
            const approvalResponse = await fetch(`${backendUrl}/api/approval/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    organization: formData.company,
                    reason: formData.useCase || 'Access requested'
                })
            });
            
            if (approvalResponse.ok) {
                const approval = await approvalResponse.json();
                approvalToken = approval.approval_token;
                context.log('Approval request created with token:', approvalToken);
            } else {
                const errorText = await approvalResponse.text();
                context.log('Approval request failed:', errorText);
                
                if (errorText.includes('already exists')) {
                    userExists = true;
                } else if (errorText.includes('already pending')) {
                    context.log('Approval already pending');
                }
            }
        } catch (error) {
            context.log.error('Error creating approval request:', error.message);
            approvalToken = 'temp-' + Date.now();
        }
        
        // If user exists, notify and return
        if (userExists) {
            context.log('User already exists, notifying...');
            
            const userExistsEmail = {
                senderAddress: process.env.SENDER_EMAIL,
                recipients: {
                    to: [{ 
                        address: formData.email,
                        displayName: `${formData.firstName} ${formData.lastName}`
                    }]
                },
                content: {
                    subject: "IdentityPulse - Account Already Exists",
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Account Already Exists</h2>
                            <p>An account with ${formData.email} already exists.</p>
                            <p>Please use the login page or contact support if you need assistance.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://lookup.identitypulse.ai/login" target="_blank" style="display: inline-block; padding: 12px 30px; background: #4B7BF5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    Go to Login
                                </a>
                            </div>
                        </div>
                    `
                }
            };
            
            try {
                await emailClient.beginSend(userExistsEmail);
            } catch (emailError) {
                context.log.error('Failed to send user exists email:', emailError.message);
            }
            
            context.res.status = 200;
            context.res.body = JSON.stringify({ 
                success: false, 
                userExists: true,
                message: 'User already exists'
            });
            return;
        }
        
        if (isAutoApprove && approvalToken) {
            // AUTO-APPROVE MODE
            context.log('Processing auto-approval...');
            
            try {
                // Generate strong credentials without special characters
                const username = generateSecureUsername(formData.email);
                const securePassword = generateStrongPassword();
                
                context.log('Generated credentials for user');
                context.log('Username:', username);
                context.log('Password length:', securePassword.length);
                
                // Complete registration
                const completeResponse = await fetch(`${backendUrl}/api/approval/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        approval_token: approvalToken,
                        username: username,
                        password: securePassword
                    })
                });
                
                if (completeResponse.ok) {
                    const newUser = await completeResponse.json();
                    context.log('User created:', newUser.id);
                    
                    // Send welcome email with secure credentials
                    const welcomeEmail = {
                        senderAddress: process.env.SENDER_EMAIL,
                        recipients: {
                            to: [{ address: formData.email }]
                        },
                        content: {
                            subject: "Welcome to IdentityPulse - Your Account is Ready",
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <div style="background: linear-gradient(135deg, #4B7BF5, #3B5EDB); padding: 20px; text-align: center;">
                                        <h1 style="color: white; margin: 0;">Welcome to IdentityPulse!</h1>
                                    </div>
                                    <div style="padding: 30px; background: #f7f9fc;">
                                        <h2 style="color: #1a1a1a;">Hi ${formData.firstName},</h2>
                                        <p style="color: #6b7280; font-size: 16px;">
                                            Your account has been approved and is ready to use.
                                        </p>
                                        
                                        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                            <h3 style="color: #4B7BF5; margin-top: 0;">Your Login Credentials</h3>
                                            <table style="width: 100%;">
                                                <tr>
                                                    <td style="padding: 8px 0;"><strong>Username:</strong></td>
                                                    <td><code style="background: #f3f4f6; padding: 4px 8px; border-radius: 3px; font-family: monospace;">${username}</code></td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;"><strong>Password:</strong></td>
                                                    <td><code style="background: #f3f4f6; padding: 4px 8px; border-radius: 3px; font-family: monospace;">${securePassword}</code></td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;"><strong>Email:</strong></td>
                                                    <td>${formData.email}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                            <p style="color: #92400e; margin: 0;">
                                                <strong>Important:</strong> Please save these credentials securely. This password will not be sent again.
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
                                    </div>
                                </div>
                            `
                        }
                    };
                    
                    await emailClient.beginSend(welcomeEmail);
                    
                    // Send admin notification
                    if (adminEmail !== formData.email) {
                        const adminNotification = {
                            senderAddress: process.env.SENDER_EMAIL,
                            recipients: {
                                to: [{ address: adminEmail }]
                            },
                            content: {
                                subject: `User Auto-Approved: ${formData.email}`,
                                html: `
                                    <div>
                                        <h3>New User Auto-Approved</h3>
                                        <p>Email: ${formData.email}</p>
                                        <p>Name: ${formData.firstName} ${formData.lastName}</p>
                                        <p>Company: ${formData.company}</p>
                                        <p>Username: ${username}</p>
                                        <p>User ID: ${newUser.id}</p>
                                    </div>
                                `
                            }
                        };
                        
                        await emailClient.beginSend(adminNotification);
                    }
                    
                    context.res.status = 200;
                    context.res.body = JSON.stringify({ 
                        success: true, 
                        autoApproved: true,
                        userId: newUser.id,
                        message: 'User automatically approved'
                    });
                } else {
                    const errorText = await completeResponse.text();
                    context.log.error('User creation failed:', completeResponse.status, errorText);
                    throw new Error('Failed to complete registration: ' + errorText);
                }
            } catch (error) {
                context.log.error('Auto-approval failed:', error.message);
                // Fall back to manual approval
                isAutoApprove = false;
            }
        }
        
        if (!isAutoApprove) {
            // MANUAL APPROVAL MODE
            context.log('Processing manual approval...');
            
            const approveUrl = `${functionUrl}/api/ApproveUser?token=${approvalToken}&action=approve`;
            const rejectUrl = `${functionUrl}/api/ApproveUser?token=${approvalToken}&action=reject`;
            
            context.log('Approval URLs:', { approve: approveUrl, reject: rejectUrl });
            
            const adminApprovalEmail = {
                senderAddress: process.env.SENDER_EMAIL,
                recipients: {
                    to: [{ address: adminEmail }]
                },
                content: {
                    subject: `Action Required: New User Approval - ${formData.company}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: #4B7BF5; padding: 20px; text-align: center;">
                                <h1 style="color: white;">New User Approval Request</h1>
                            </div>
                            <div style="padding: 20px;">
                                <h3>User Details</h3>
                                <table style="width: 100%;">
                                    <tr><td style="padding: 8px;"><strong>Name:</strong></td><td>${formData.firstName} ${formData.lastName}</td></tr>
                                    <tr><td style="padding: 8px;"><strong>Email:</strong></td><td>${formData.email}</td></tr>
                                    <tr><td style="padding: 8px;"><strong>Company:</strong></td><td>${formData.company}</td></tr>
                                    <tr><td style="padding: 8px;"><strong>Country:</strong></td><td>${formData.country || 'Not provided'}</td></tr>
                                    <tr><td style="padding: 8px;"><strong>Use Case:</strong></td><td>${formData.useCase || 'Not provided'}</td></tr>
                                </table>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${approveUrl}" style="display: inline-block; margin: 10px; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                        ✓ APPROVE USER
                                    </a>
                                    <a href="${rejectUrl}" style="display: inline-block; margin: 10px; padding: 15px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                        ✗ REJECT USER
                                    </a>
                                </div>
                                
                                <p style="color: #666; font-size: 12px; text-align: center;">
                                    Token: ${approvalToken}<br>
                                    ${functionUrl.includes('localhost') ? 'Local development mode' : 'Production mode'}
                                </p>
                            </div>
                        </div>
                    `
                }
            };
            
            try {
                await emailClient.beginSend(adminApprovalEmail);
                context.log('Admin approval email sent');
            } catch (emailError) {
                context.log.error('Failed to send approval email:', emailError.message);
            }
            
            context.res.status = 200;
            context.res.body = JSON.stringify({ 
                success: true, 
                autoApproved: false,
                approvalToken: approvalToken,
                message: 'OTP verified, approval email sent to admin'
            });
        }

    } catch (error) {
        context.log.error('Error in VerifyOTP:', error);
        context.res.status = 500;
        context.res.body = JSON.stringify({ 
            success: false,
            error: 'Internal server error', 
            details: error.message 
        });
    }
};