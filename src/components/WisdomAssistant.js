import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';

const EXAMPLE_QUERIES = [
  "My manager takes credit for my work and I feel demotivated",
  "I'm anxious about a big decision and can't make up my mind",
  "My team is not performing and I don't know how to lead them",
  "I keep getting distracted and can't focus on my goals"
];

const WisdomAssistant = () => {
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const getTagsFromQuery = (q) => {
    const text = q.toLowerCase();
    const tags = new Set();
    if (/work|job|boss|manager|team|office|career|colleague|project|deadline|promot/i.test(text)) tags.add('Corporate');
    if (/lead|manag|team|responsib|decision|strateg|goal|vision|inspir/i.test(text)) tags.add('Leadership');
    if (/fear|anxious|worry|doubt|confus|sad|grief|anger|stress|overwhelm|depress|stuck/i.test(text)) tags.add('Inner Battle');
    if (/self|mind|peace|purpose|meaning|life|happy|relation|family|growth|faith/i.test(text)) tags.add('Personal');
    if (tags.size === 0) { tags.add('Personal'); tags.add('Inner Battle'); }
    return [...tags];
  };

  const fetchRelevantShlokas = async (tags) => {
    // Fetch shlokas matching any of the detected tags, sample across chapters
    const allShlokas = [];
    for (const tag of tags) {
      const q = query(
        collection(db, 'shlokas'),
        where('tags', 'array-contains', tag),
        limit(10)
      );
      const snap = await getDocs(q);
      snap.docs.forEach(d => {
        const data = { id: d.id, ...d.data() };
        if (!allShlokas.find(s => s.id === data.id)) allShlokas.push(data);
      });
    }
    // Shuffle and take top 12 for API context
    return allShlokas.sort(() => Math.random() - 0.5).slice(0, 12);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const tags = getTagsFromQuery(userQuery);
      const shlokas = await fetchRelevantShlokas(tags);

      if (shlokas.length === 0) {
        setError('No relevant shlokas found. Try rephrasing your situation.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/wisdom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, shlokas })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Something went wrong');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="wisdom-section">
      <div className="wisdom-container">
        <div className="wisdom-header">
          <h2>Ask Shastra</h2>
          <p>Describe your situation. Receive guidance from the Bhagavad Gita.</p>
        </div>

        <form onSubmit={handleSubmit} className="wisdom-form">
          <textarea
            className="wisdom-input"
            value={userQuery}
            onChange={e => setUserQuery(e.target.value)}
            placeholder="e.g. My manager takes credit for my work and I feel demotivated..."
            rows={3}
            disabled={loading}
          />
          <button type="submit" className="wisdom-btn" disabled={loading || !userQuery.trim()}>
            {loading ? 'Seeking wisdom...' : 'Find Guidance →'}
          </button>
        </form>

        {!result && !loading && (
          <div className="wisdom-examples">
            <p>Try asking:</p>
            <div className="example-chips">
              {EXAMPLE_QUERIES.map((q, i) => (
                <button key={i} className="example-chip" onClick={() => setUserQuery(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="wisdom-loading">
            <div className="wisdom-spinner" />
            <p>Searching the Gita for guidance...</p>
          </div>
        )}

        {error && <p className="wisdom-error">{error}</p>}

        {result && (
          <div className="wisdom-result">
            <div className="wisdom-shloka">
              <div className="wisdom-verse-label">
                Chapter {result.shloka.chapter}, Verse {result.shloka.verse}
                {result.shloka.tags && result.shloka.tags.map(t => (
                  <span key={t} className="tag-badge" style={{ marginLeft: 8 }}>{t}</span>
                ))}
              </div>
              <div className="sanskrit"><strong>Sanskrit:</strong><p>{result.shloka.sanskrit}</p></div>
              <div className="hindi"><strong>Hindi:</strong><p>{result.shloka.hindi}</p></div>
              <div className="english"><strong>English:</strong><p>{result.shloka.english}</p></div>
            </div>

            <div className="wisdom-explanation">
              <h4>How this applies to you</h4>
              <p>{result.explanation}</p>
            </div>

            <button className="wisdom-reset" onClick={() => { setResult(null); setUserQuery(''); }}>
              Ask another question
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default WisdomAssistant;
