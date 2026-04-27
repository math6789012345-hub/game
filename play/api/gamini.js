// api/gemini.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { board, ai, human } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is not set in Vercel' });

    const prompt = `You are an expert Tic-Tac-Toe AI. 
    Current Board (0-8 indices): ${JSON.stringify(board)}. 
    Your symbol: '${ai}'. Opponent symbol: '${human}'. 
    Analyze the board and return ONLY the number (0-8) of your best move. 
    Prioritize winning, then blocking the opponent from winning. 
    Output only the digit.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        // Safety check for Gemini response structure
        if (data.error) throw new Error(data.error.message);
        
        const rawText = data.candidates[0].content.parts[0].text.trim();
        const move = parseInt(rawText.replace(/[^0-9]/g, ''));

        res.status(200).json({ index: move });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
