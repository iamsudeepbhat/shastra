import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const ScriptureDetail = () => {
  const { id } = useParams();
  const [scripture, setScripture] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [shlokas, setShlokas] = useState([]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [loading, setLoading] = useState(true);
  const [shlokasLoading, setShlokasLoading] = useState(false);

  const tags = ['All', 'Corporate', 'Personal', 'Leadership', 'Inner Battle'];

  useEffect(() => {
    const load = async () => {
      try {
        const scriptureDoc = await getDoc(doc(db, 'scriptures', id));
        if (!scriptureDoc.exists()) { setLoading(false); return; }
        const scriptureData = { id: scriptureDoc.id, ...scriptureDoc.data() };
        setScripture(scriptureData);

        // Build chapter list based on scripture's chapterCount
        const count = scriptureData.chapterCount || 0;
        if (count > 0) {
          setChapters(Array.from({ length: count }, (_, i) => i + 1));
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const loadShlokas = async (chapterNum) => {
    setShlokasLoading(true);
    try {
      const q = query(
        collection(db, 'shlokas'),
        where('scriptureId', '==', id),
        where('chapter', '==', chapterNum)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.verse - b.verse);
      setShlokas(data);
      setSelectedChapter(chapterNum);
      setSelectedTag('All');
    } catch (err) {
      console.error('Error loading shlokas:', err);
    } finally {
      setShlokasLoading(false);
    }
  };

  const filteredShlokas = selectedTag === 'All'
    ? shlokas
    : shlokas.filter(s => s.tags && s.tags.includes(selectedTag));

  if (loading) return <div className="loading-page"><p>Loading...</p></div>;
  if (!scripture) return <div className="loading-page"><p>Scripture not found. <Link to="/explorer">Back</Link></p></div>;

  return (
    <div className="gita-explorer">
      <div className="explorer-container">
        <div className="chapters-sidebar">
          <Link to="/explorer" className="back-link" style={{ display: 'block', marginBottom: '16px', fontSize: '0.9rem' }}>← All Scriptures</Link>
          <h2>{scripture.name}</h2>
          {chapters.length > 0 ? (
            <div className="chapters-list">
              {chapters.map(ch => (
                <button
                  key={ch}
                  className={`chapter-btn ${selectedChapter === ch ? 'active' : ''}`}
                  onClick={() => loadShlokas(ch)}
                >
                  Chapter {ch}
                </button>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '16px' }}>Content coming soon.</p>
          )}
        </div>

        <div className="shlokas-main">
          {selectedChapter ? (
            <>
              <div className="chapter-header">
                <h2>Chapter {selectedChapter}</h2>
                <div className="tag-filters">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              {shlokasLoading ? (
                <p className="loading">Loading shlokas...</p>
              ) : filteredShlokas.length > 0 ? (
                <div className="shlokas-list">
                  {filteredShlokas.map(shloka => (
                    <div key={shloka.id} className="shloka-card">
                      <div className="verse-header">
                        <span className="verse-num">Verse {shloka.verse}</span>
                        {shloka.tags && (
                          <div className="shloka-tags">
                            {shloka.tags.map(tag => <span key={tag} className="tag-badge">{tag}</span>)}
                          </div>
                        )}
                      </div>
                      <div className="sanskrit"><strong>Sanskrit:</strong><p>{shloka.sanskrit}</p></div>
                      <div className="hindi"><strong>Hindi Meaning:</strong><p>{shloka.hindi}</p></div>
                      <div className="english"><strong>English Meaning:</strong><p>{shloka.english}</p></div>
                      {shloka.ytVideoId && (
                        <div className="yt-embed" style={{ marginTop: '16px' }}>
                          <div className="yt-wrapper">
                            <iframe
                              src={`https://www.youtube.com/embed/${shloka.ytVideoId}`}
                              title="YouTube"
                              frameBorder="0"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-shlokas">No shlokas found for this filter.</p>
              )}
            </>
          ) : (
            <div className="welcome-message">
              <h2>{scripture.name}</h2>
              <p>{scripture.description}</p>
              {chapters.length > 0
                ? <p style={{ marginTop: '12px', color: '#888' }}>Select a chapter to begin</p>
                : <p style={{ marginTop: '12px', color: '#888' }}>Content coming soon.</p>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptureDetail;
