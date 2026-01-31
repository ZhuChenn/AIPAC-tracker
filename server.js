// Simple local development server
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Load .env file for local development
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    process.env[key.trim()] = valueParts.join('=').trim();
                }
            });
            console.log('Loaded .env file');
        }
    } catch (err) {
        console.error('Error loading .env:', err);
    }
}
loadEnv();

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// API keys from environment variables
const XAI_API_KEY = process.env.XAI_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Debug: Log if API key is loaded
console.log('XAI_API_KEY loaded:', XAI_API_KEY ? 'Yes (' + XAI_API_KEY.length + ' chars)' : 'No');

// Make HTTPS request
function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(data);
                resolve({ status: res.statusCode, data: buffer.toString() });
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Handle JewScan API requests (Grok)
async function handleAnalyzeRequest(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { image } = JSON.parse(body);
            
            if (!image) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No image provided' }));
                return;
            }

            console.log('Processing image analysis request...');

            const prompt = `You are a facial analysis AI. Analyze this image and respond ONLY with a JSON object (no markdown, no code blocks, just raw JSON).

First, determine if there is a clear human face in the image. If there is NO face or the image is not suitable for facial analysis, respond with:
{"error": "no_face", "message": "Please upload a clear photo of a person's face"}

If there IS a face, analyze the facial features and estimate the likelihood of Jewish/Israeli ancestry based on phenotypic markers commonly associated with Ashkenazi, Sephardic, and Mizrahi Jewish populations. Consider features like nose shape, eye characteristics, facial structure, etc.

Respond with this JSON format:
{
    "face_detected": true,
    "jewish_likelihood": <number 0-100>,
    "ashkenazi_markers": <number 0-100>,
    "sephardic_markers": <number 0-100>,
    "mizrahi_markers": <number 0-100>,
    "confidence": <number 0-100>,
    "analysis": "<brief analysis of detected features>"
}`;

            const requestBody = JSON.stringify({
                model: 'grok-2-vision-1212',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'image_url', image_url: { url: image, detail: 'high' } },
                        { type: 'text', text: prompt }
                    ]
                }],
                temperature: 0.3
            });

            const options = {
                hostname: 'api.x.ai',
                port: 443,
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAI_API_KEY}`,
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            };

            const response = await makeRequest(options, requestBody);
            
            console.log('API Response status:', response.status);

            if (response.status !== 200) {
                console.error('API Error:', response.data);
                const errorData = JSON.parse(response.data);
                res.writeHead(response.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: errorData.error?.message || 'API request failed' }));
                return;
            }

            const data = JSON.parse(response.data);
            const content = data.choices[0].message.content;

            console.log('AI Response:', content);

            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));

        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message || 'Server error' }));
        }
    });
}

// Handle Gemini image editing requests
async function handleGeminiEditRequest(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { image } = JSON.parse(body);
            
            if (!image) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No image provided' }));
                return;
            }

            console.log('Processing Gemini image edit request...');

            // Extract base64 data from data URL
            const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!base64Match) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid image format' }));
                return;
            }
            
            const mimeType = `image/${base64Match[1]}`;
            const imageData = base64Match[2];

            const requestBody = JSON.stringify({
                contents: [{
                    parts: [
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: imageData
                            }
                        },
                        {
                            text: "Edit this image: Remove the background completely and make the person/subject have a transparent background. Keep only the person, remove everything else. Convert the person to black and white/grayscale. Return only the edited image."
                        }
                    ]
                }],
                generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"]
                }
            });

            const options = {
                hostname: 'generativelanguage.googleapis.com',
                port: 443,
                path: `/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            };

            const response = await makeRequest(options, requestBody);
            
            console.log('Gemini Response status:', response.status);

            if (response.status !== 200) {
                console.error('Gemini API Error:', response.data);
                res.writeHead(response.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Gemini API request failed', details: response.data }));
                return;
            }

            const data = JSON.parse(response.data);
            console.log('Gemini response structure:', JSON.stringify(data, null, 2).substring(0, 500));
            
            // Extract the generated image from response
            let editedImageData = null;
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const parts = data.candidates[0].content.parts;
                for (const part of parts) {
                    if (part.inlineData) {
                        editedImageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        break;
                    }
                }
            }
            
            if (editedImageData) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ image: editedImageData }));
            } else {
                // If no image returned, return original
                console.log('No image in Gemini response, returning original');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ image: image, fallback: true }));
            }

        } catch (error) {
            console.error('Gemini Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message || 'Server error' }));
        }
    });
}

// Create server
const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // Handle API endpoints
    if (req.url.startsWith('/api/analyze')) {
        return handleAnalyzeRequest(req, res);
    }
    
    if (req.url.startsWith('/api/gemini-edit')) {
        return handleGeminiEditRequest(req, res);
    }

    // Serve static files with clean URL support
    let urlPath = req.url.split('?')[0];
    
    // Clean URL mapping
    if (urlPath === '/') {
        urlPath = '/index.html';
    } else if (!path.extname(urlPath)) {
        // No extension - try adding .html
        urlPath = urlPath + '.html';
    }
    
    let filePath = path.join(__dirname, urlPath);

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found: ' + urlPath);
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n  Server running at http://localhost:${PORT}`);
    console.log(`  Open this URL in your browser to test the site\n`);
});
