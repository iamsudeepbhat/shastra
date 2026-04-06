export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, shlokas } = req.body;

  if (!query || !shlokas || shlokas.length === 0) {
    return res.status(400).json({ error: 'Missing query or shlokas' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const shlokaList = shlokas.map((s, i) =>
    `[${i + 1}] Chapter ${s.chapter}, Verse ${s.verse}
Sanskrit: ${s.sanskrit}
Hindi: ${s.hindi}
English: ${s.english}
Tags: ${(s.tags || []).join(', ')}`
  ).join('\n\n');

  const prompt = `You are Shastra, a wisdom guide who helps people find guidance from the Bhagavad Gita for modern life situations.

A person has shared this situation:
"${query}"

Here are relevant shlokas from the Bhagavad Gita:
${shlokaList}

Choose the single most relevant shloka for this situation. Respond in this exact JSON format:
{
  "shlokaIndex": <number 1-${shlokas.length}>,
  "explanation": "<2-3 sentences explaining exactly how this shloka applies to their specific situation, in plain modern English>"
}

Be specific to their situation. Do not be generic. Do not repeat the shloka text in the explanation.`;

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.3
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq API error status:', response.status, err);
      return res.status(500).json({ error: 'AI service error', detail: err.slice(0, 200) });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) return res.status(500).json({ error: 'Empty response from AI' });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Invalid response format' });

    const result = JSON.parse(jsonMatch[0]);
    const chosenShloka = shlokas[result.shlokaIndex - 1];

    if (!chosenShloka) return res.status(500).json({ error: 'Invalid shloka selection' });

    return res.status(200).json({
      shloka: chosenShloka,
      explanation: result.explanation
    });

  } catch (err) {
    console.error('Wisdom API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
