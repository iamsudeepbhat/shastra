import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'insights'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInsights(data);
      } catch (err) {
        console.error('Error loading insights:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-page"><p>Loading insights...</p></div>;

  return (
    <div className="insights-page">
      <div className="insights-header">
        <h1>Insights</h1>
        <p>Ancient wisdom applied to modern challenges</p>
      </div>

      {insights.length === 0 ? (
        <div className="empty-state">
          <p>No insights yet. Check back soon.</p>
        </div>
      ) : (
        <div className="insights-grid">
          {insights.map(insight => (
            <Link to={`/insights/${insight.id}`} key={insight.id} className="insight-card">
              <div className="insight-tag">{insight.tag || 'Wisdom'}</div>
              <h2>{insight.title}</h2>
              <p className="insight-excerpt">{insight.excerpt}</p>
              <div className="insight-meta">
                <span className="insight-scripture">{insight.scripture || 'Bhagavad Gita'}</span>
                <span className="read-more">Read →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Insights;
