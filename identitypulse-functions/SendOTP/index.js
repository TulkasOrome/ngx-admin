const { EmailClient } = require("@azure/communication-email");
const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
    context.log('SendOTP function triggered');

    // ALWAYS set CORS headers
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle OPTIONS
    if (req.method === "OPTIONS") {
        context.res = {
            status: 200,
            headers: headers
        };
        return;
    }

    // Set default response with headers
    context.res = {
        headers: headers
    };

    try {
        const { email, firstName, lastName, company } = req.body || {};

        if (!email || !firstName || !lastName || !company) {
            context.res.status = 400;
            context.res.body = { error: 'Missing required fields' };
            return;
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Store OTP
        const tableClient = TableClient.fromConnectionString(
            process.env.STORAGE_CONNECTION_STRING,
            "otpverification"
        );
        
        await tableClient.createTable();
        
        await tableClient.upsertEntity({
            partitionKey: "OTP",
            rowKey: email,
            otp: otp,
            firstName: firstName,
            lastName: lastName,
            company: company,
            expiresAt: expiresAt.toISOString(),
            verified: false
        });

        // Send email
        const emailClient = new EmailClient(process.env.ACS_CONNECTION_STRING);
        
        const poller = await emailClient.beginSend({
            senderAddress: process.env.SENDER_EMAIL,
            recipients: {
                to: [{ address: email, displayName: `${firstName} ${lastName}` }]
            },
            content: {
                subject: "IdentityPulse - Verify Your Email",
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #D6001C, #ad0017); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">IdentityPulse</h1>
                    </div>
                    <div style="padding: 30px; background: #f7f9fc;">
                        <h2 style="color: #2a2e40;">Verify Your Email Address</h2>
                        <p style="color: #8f9bb3; font-size: 16px;">Hi ${firstName},</p>
                        <p style="color: #8f9bb3; font-size: 16px;">Thank you for requesting access to IdentityPulse. Please use the verification code below to complete your registration:</p>
                        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                            <h1 style="color: #D6001C; letter-spacing: 8px; margin: 0;">${otp}</h1>
                        </div>
                        <p style="color: #8f9bb3; font-size: 14px;">This code will expire in 10 minutes.</p>
                        <p style="color: #8f9bb3; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                        <hr style="border: 1px solid #e4e9f2; margin: 30px 0;">
                        <p style="color: #8f9bb3; font-size: 12px; text-align: center;">© 2025 IdentityPulse by MarketSoft. All rights reserved.</p>
                    </div>
                </div>`
            }
        });
        
        await poller.pollUntilDone();

        context.res.status = 200;
        context.res.body = { success: true, message: 'OTP sent successfully' };

    } catch (error) {
        context.log.error('Error in SendOTP:', error);
        context.res.status = 500;
        context.res.body = { error: 'Failed to send OTP', details: error.message };
    }
};