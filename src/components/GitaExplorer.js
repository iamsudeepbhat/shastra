import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const GitaExplorer = () => {
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [shlokas, setShlokas] = useState([]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [loading, setLoading] = useState(false);

  const tags = ['All', 'Corporate', 'Personal', 'Leadership', 'Inner Battle'];

  // Load chapters on mount
  useEffect(() => {
    const loadChapters = async () => {
      try {
        // Create chapters 1-18 for Bhagavad Gita
        const chapterList = Array.from({ length: 18 }, (_, i) => ({
          id: i + 1,
          name: `Chapter ${i + 1}`,
          verses: 0
        }));
        setChapters(chapterList);
      } catch (error) {
        console.error('Error loading chapters:', error);
      }
    };
    loadChapters();
  }, []);

  // Load shlokas for selected chapter
  const loadShlokas = async (chapterNum) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'shlokas'),
        where('chapter', '==', chapterNum)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => a.verse - b.verse);
      setShlokas(data);
      setSelectedChapter(chapterNum);
      setSelectedTag('All');
    } catch (error) {
      console.error('Error loading shlokas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter shlokas by tag
  const filteredShlokas = selectedTag === 'All'
    ? shlokas
    : shlokas.filter(shloka => shloka.tags && shloka.tags.includes(selectedTag));

  return (
    <div className="gita-explorer">
      <div className="explorer-container">
        <div className="chapters-sidebar">
          <h2>Bhagavad Gita</h2>
          <div className="chapters-list">
            {chapters.map(ch => (
              <button
                key={ch.id}
                className={`chapter-btn ${selectedChapter === ch.id ? 'active' : ''}`}
                onClick={() => loadShlokas(ch.id)}
              >
                {ch.name}
              </button>
            ))}
          </div>
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

              {loading ? (
                <p className="loading">Loading shlokas...</p>
              ) : filteredShlokas.length > 0 ? (
                <div className="shlokas-list">
                  {filteredShlokas.map(shloka => (
                    <div key={shloka.id} className="shloka-card">
                      <div className="verse-header">
                        <span className="verse-num">Verse {shloka.verse}</span>
                        {shloka.tags && (
                          <div className="shloka-tags">
                            {shloka.tags.map(tag => (
                              <span key={tag} className="tag-badge">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="sanskrit">
                        <strong>Sanskrit:</strong>
                        <p>{shloka.sanskrit || 'Sanskrit text'}</p>
                      </div>

                      <div className="hindi">
                        <strong>Hindi Meaning:</strong>
                        <p>{shloka.hindi || 'Hindi meaning'}</p>
                      </div>

                      <div className="english">
                        <strong>English Meaning:</strong>
                        <p>{shloka.english || 'English meaning'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-shlokas">No shlokas found for this filter.</p>
              )}
            </>
          ) : (
            <div className="welcome-message">
              <h2>Welcome to Shastra</h2>
              <p>Select a chapter to explore the Bhagavad Gita</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitaExplorer;
