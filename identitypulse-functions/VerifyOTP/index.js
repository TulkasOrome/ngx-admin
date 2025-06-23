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
                    to: [{ address: process.env.SALES_EMAIL }]
                },
                content: {
                    subject: `New IdentityPulse Access Request - ${formData.company}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>New Access Request</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formData.firstName} ${formData.lastName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formData.email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Company:</strong></td>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formData.company}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formData.phone || 'Not provided'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Country:</strong></td>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formData.country}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Use Case:</strong></td>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formData.useCase || 'Not provided'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px;"><strong>Timestamp:</strong></td>
                                    <td style="padding: 10px;">${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</td>
                                </tr>
                            </table>
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