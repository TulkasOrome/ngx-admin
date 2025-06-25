const { EmailClient } = require("@azure/communication-email");
const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
    context.log('VerifyOTP function triggered');

    // Enable CORS
    context.res = {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };

    if (req.method === 'OPTIONS') {
        context.res.status = 200;
        return;
    }

    try {
        const { email, otp, formData } = req.body;

        if (!email || !otp) {
            context.res.status = 400;
            context.res.body = { error: 'Missing email or OTP' };
            return;
        }

        // Retrieve OTP from Azure Table Storage
        const tableClient = TableClient.fromConnectionString(
            process.env.STORAGE_CONNECTION_STRING,
            "otpverification"
        );

        try {
            const entity = await tableClient.getEntity("OTP", email);
            
            // Check if OTP is valid and not expired
            const now = new Date();
            const expiresAt = new Date(entity.expiresAt);
            
            if (entity.otp !== otp) {
                context.res.status = 400;
                context.res.body = { error: 'Invalid OTP' };
                return;
            }
            
            if (now > expiresAt) {
                context.res.status = 400;
                context.res.body = { error: 'OTP has expired' };
                return;
            }
            
            if (entity.verified) {
                context.res.status = 400;
                context.res.body = { error: 'OTP already used' };
                return;
            }

            // Mark OTP as verified
            entity.verified = true;
            await tableClient.updateEntity(entity);

            // Send notification email to sales team
            const emailClient = new EmailClient(process.env.ACS_CONNECTION_STRING);
            
            const salesEmailMessage = {
                senderAddress: process.env.SENDER_EMAIL,
                recipients: {
                    to: [{ address: "sales@identitypulse.ai" }]
                },
                content: {
                    subject: `New IdentityPulse Access Request - ${formData.company}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #4B7BF5, #3B5EDB); padding: 20px; text-align: center;">
                                <h1 style="color: white; margin: 0;">IdentityPulse</h1>
                            </div>
                            <div style="padding: 30px; background: #f7f9fc;">
                                <h2 style="color: #1a1a1a; margin-bottom: 20px;">New Access Request</h2>
                                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <tr>
                                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;"><strong>Name:</strong></td>
                                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">${formData.firstName} ${formData.lastName}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;"><strong>Email:</strong></td>
                                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">${formData.email}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;"><strong>Company:</strong></td>
                                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">${formData.company}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;"><strong>Phone:</strong></td>
                                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">${formData.phone || 'Not provided'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;"><strong>Country:</strong></td>
                                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">${formData.country}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;"><strong>Use Case:</strong></td>
                                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">${formData.useCase || 'Not provided'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px; background: #f9fafb;"><strong>Timestamp:</strong></td>
                                        <td style="padding: 15px;">${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</td>
                                    </tr>
                                </table>
                                <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
                                <p style="color: #6b7280; font-size: 12px; text-align: center;">© 2025 IdentityPulse. All rights reserved.</p>
                            </div>
                        </div>
                    `
                }
            };

            const poller = await emailClient.beginSend(salesEmailMessage);
            await poller.pollUntilDone();

            // Store the full request in a separate table for record keeping
            const requestsTableClient = TableClient.fromConnectionString(
                process.env.STORAGE_CONNECTION_STRING,
                "accessrequests"
            );
            
            await requestsTableClient.createTable();
            
            const requestEntity = {
                partitionKey: "REQUEST",
                rowKey: `${Date.now()}_${email}`,
                ...formData,
                verifiedAt: new Date().toISOString(),
                status: "pending"
            };
            
            await requestsTableClient.createEntity(requestEntity);

            context.res.status = 200;
            context.res.body = { success: true, message: 'Email verified successfully' };

        } catch (error) {
            if (error.statusCode === 404) {
                context.res.status = 400;
                context.res.body = { error: 'Invalid or expired OTP' };
                return;
            }
            throw error;
        }

    } catch (error) {
        context.log.error('Error in VerifyOTP:', error);
        context.res.status = 500;
        context.res.body = { error: 'Failed to verify OTP' };
    }
};