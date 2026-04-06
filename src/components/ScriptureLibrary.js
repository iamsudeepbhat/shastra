import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const ScriptureLibrary = () => {
  const [scriptures, setScriptures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'scriptures'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => (a.order || 99) - (b.order || 99));
        setScriptures(data);
      } catch (err) {
        console.error('Error loading scriptures:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-page"><p>Loading scriptures...</p></div>;

  return (
    <div className="scripture-library-page">
      <div className="library-header">
        <h1>Scripture Library</h1>
        <p>Ancient texts. Timeless wisdom.</p>
      </div>
      <div className="scriptures-grid">
        {scriptures.map(scripture => (
          <Link
            to={`/scripture/${scripture.id}`}
            key={scripture.id}
            className="scripture-card"
          >
            <div className="scripture-icon">{scripture.icon || '📜'}</div>
            <h2>{scripture.name}</h2>
            <p className="scripture-desc">{scripture.description}</p>
            <div className="scripture-meta">
              <span className="scripture-language">{scripture.language || 'Sanskrit'}</span>
              {scripture.verseCount ? (
                <span className="scripture-count">{scripture.verseCount} verses</span>
              ) : (
                <span className="scripture-count coming-soon">Coming soon</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ScriptureLibrary;
