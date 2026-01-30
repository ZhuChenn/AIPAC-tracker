// Simple health check endpoint to verify env vars
export default function handler(req, res) {
    const hasApiKey = !!process.env.XAI_API_KEY;
    const keyLength = process.env.XAI_API_KEY ? process.env.XAI_API_KEY.length : 0;
    
    res.status(200).json({
        status: 'ok',
        apiKeyConfigured: hasApiKey,
        apiKeyLength: keyLength,
        timestamp: new Date().toISOString()
    });
}
