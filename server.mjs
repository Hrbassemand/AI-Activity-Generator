import express from 'express';
import fetch from 'node-fetch'; // Ensure you've installed node-fetch using npm
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve your static files (if you have a frontend component)
app.use(express.static('docs'));

// POST endpoint to generate activity suggestions
app.post('/generateActivity', async (req, res) => {
    const { prompt, max_tokens } = req.body;

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-instruct",
            prompt: prompt,
            max_tokens: max_tokens
        })
    };

    try {
        const apiResponse = await fetch('https://api.openai.com/v1/completions', requestOptions);
        const apiData = await apiResponse.json();

        if (apiData.choices && apiData.choices.length > 0) {
            res.json({ activity: apiData.choices[0].text.trim() });  // Make sure to send an object with an "activity" key
        } else {
            throw new Error('No valid response from AI');
        }
    } catch (error) {
        console.error('Error handling /generateActivity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
