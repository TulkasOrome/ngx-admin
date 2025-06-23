module.exports = async function (context, req) {
    // ALWAYS set CORS headers
    context.res = {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        }
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
        context.res.status = 204;
        return;
    }

    // Just forward to your existing functions
    const endpoint = req.params.endpoint;
    
    try {
        if (endpoint === 'SendOTP') {
            // Call your SendOTP function directly
            const sendOTP = require('../SendOTP/index.js');
            await sendOTP(context, req);
        } else if (endpoint === 'VerifyOTP') {
            // Call your VerifyOTP function directly  
            const verifyOTP = require('../VerifyOTP/index.js');
            await verifyOTP(context, req);
        } else {
            context.res.status = 404;
            context.res.body = { error: 'Endpoint not found' };
        }
    } catch (error) {
        context.log.error('Proxy error:', error);
        // Error response already has CORS headers
        context.res.status = 500;
        context.res.body = { error: 'Internal server error' };
    }
};