// identitypulse-functions/VerifyOTP/index.js - FIXED URLs
const { EmailClient } = require("@azure/communication-email");
const { TableClient } = require("@azure/data-tables");

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
        
        // FIXED: Determine the correct Function App URL based on environment
        let functionUrl;
        if (process.env.FUNCTION_APP_URL && process.env.FUNCTION_APP_URL.includes('azurewebsites.net')) {
            // Production - use the deployed URL
            functionUrl = process.env.FUNCTION_APP_URL;
        } else {
            // Local development
            functionUrl = 'http://localhost:7071';
        }
        
        context.log('Using Function URL:', functionUrl);
        
        // Determine admin email (ensure it's different from user email)
        let adminEmail = process.env.SALES_EMAIL || "admin@identitypulse.ai";
        if (adminEmail === formData.email) {
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
                    // For pending approvals, still continue but note it
                    context.log('Approval already pending');
                }
            }
        } catch (error) {
            context.log.error('Error creating approval request:', error.message);
            // Continue anyway - don't fail the whole process
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
                // Generate credentials
                const username = formData.email.split('@')[0] + Math.floor(Math.random() * 1000);
                const tempPassword = 'Welcome' + Math.floor(Math.random() * 10000) + '!';
                
                // Complete registration
                const completeResponse = await fetch(`${backendUrl}/api/approval/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        approval_token: approvalToken,
                        username: username,
                        password: tempPassword
                    })
                });
                
                if (completeResponse.ok) {
                    const newUser = await completeResponse.json();
                    context.log('User created:', newUser.id);
                    
                    // Send welcome email
                    const welcomeEmail = {
                        senderAddress: process.env.SENDER_EMAIL,
                        recipients: {
                            to: [{ address: formData.email }]
                        },
                        content: {
                            subject: "Welcome to IdentityPulse - Account Ready",
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                                    <h2>Welcome ${formData.firstName}!</h2>
                                    <p>Your account has been created.</p>
                                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                                        <p><strong>Username:</strong> ${username}</p>
                                        <p><strong>Password:</strong> ${tempPassword}</p>
                                    </div>
                                    <p>Please change your password after first login.</p>
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="https://lookup.identitypulse.ai/login" target="_blank" style="display: inline-block; padding: 12px 30px; background: #4B7BF5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                            Login to IdentityPulse
                                        </a>
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
                    throw new Error('Failed to complete registration');
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
            
            // FIXED: Use correct URL for approval links
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