export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is missing in request body' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            throw new Error("API key is not configured on the server");
        }

        // Using gemini-1.5-flash as it is fast and reliable for text/logic operations
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.1, // Low temperature for deterministic logic
                    maxOutputTokens: 5
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Error fetching from Gemini API");
        }

        const data = await response.json();
        
        // Extract the text response and clean it to ensure only digits are returned
        const textResult = data.candidates[0].content.parts[0].text.trim();
        const index = parseInt(textResult.replace(/[^0-9]/g, ''));

        if (isNaN(index) || index < 0 || index > 8) {
            throw new Error(`AI returned invalid format: ${textResult}`);
        }

        return res.status(200).json({ index });

    } catch (error) {
        console.error("Gemini API Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
