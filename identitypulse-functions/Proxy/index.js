module.exports = async function (context, req) {
    // Set CORS headers for all responses
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
    };

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 204,
            headers: corsHeaders
        };
        return;
    }

    const endpoint = req.params.endpoint;
    
    try {
        // Create a temporary context for the child function
        const childContext = {
            log: context.log,
            res: {}
        };

        if (endpoint === 'SendOTP') {
            const sendOTP = require('../SendOTP/index.js');
            await sendOTP(childContext, req);
        } else if (endpoint === 'VerifyOTP') {
            const verifyOTP = require('../VerifyOTP/index.js');
            await verifyOTP(childContext, req);
        } else {
            context.res = {
                status: 404,
                headers: corsHeaders,
                body: { error: 'Endpoint not found' }
            };
            return;
        }

        // Merge the child function's response with CORS headers
        context.res = {
            ...childContext.res,
            headers: {
                ...childContext.res.headers,
                ...corsHeaders
            }
        };

    } catch (error) {
        context.log.error('Proxy error:', error);
        context.res = {
            status: 500,
            headers: corsHeaders,
            body: { error: 'Internal server error', details: error.message }
        };
    }
};