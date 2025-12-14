/**
 * Health check endpoint for monitoring
 */
export default async function handler(req, res) {
    return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.1.0'
    });
}
