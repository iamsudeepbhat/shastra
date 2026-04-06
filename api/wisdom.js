export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, shlokas } = req.body;

  if (!query || !shlokas || shlokas.length === 0) {
    return res.status(400).json({ error: 'Missing query or shlokas' });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', err);
      return res.status(500).json({ error: 'Claude API error' });
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Invalid response format' });

    const result = JSON.parse(jsonMatch[0]);
    const chosenShloka = shlokas[result.shlokaIndex - 1];

    return res.status(200).json({
      shloka: chosenShloka,
      explanation: result.explanation
    });

  } catch (err) {
    console.error('Wisdom API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
