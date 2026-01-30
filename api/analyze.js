// Vercel Serverless Function - Grok API Proxy

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // API key from environment variable
    const apiKey = process.env.XAI_API_KEY;

    try {
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

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

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'grok-2-vision-1212',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: image,
                                    detail: 'high'
                                }
                            },
                            {
                                type: 'text',
                                text: prompt
                            }
                        ]
                    }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Grok API error:', error);
            return res.status(response.status).json({ 
                error: error.error?.message || 'API request failed' 
            });
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse JSON from response
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return res.status(200).json(JSON.parse(jsonMatch[0]));
            }
            return res.status(200).json(JSON.parse(content));
        } catch (e) {
            console.error('Failed to parse response:', content);
            return res.status(500).json({ error: 'Failed to parse AI response' });
        }

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
