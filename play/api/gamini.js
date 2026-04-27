export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: req.body.prompt }] }] })
        });
        const data = await response.json();
        res.status(200).json({ text: data.candidates[0].content.parts[0].text.trim() });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
}
