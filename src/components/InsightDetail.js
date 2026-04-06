import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const InsightDetail = () => {
  const { id } = useParams();
  const [insight, setInsight] = useState(null);
  const [shloka, setShloka] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const insightDoc = await getDoc(doc(db, 'insights', id));
        if (!insightDoc.exists()) { setLoading(false); return; }
        const insightData = { id: insightDoc.id, ...insightDoc.data() };
        setInsight(insightData);

        if (insightData.shlokaId) {
          const shlokaDoc = await getDoc(doc(db, 'shlokas', insightData.shlokaId));
          if (shlokaDoc.exists()) setShloka({ id: shlokaDoc.id, ...shlokaDoc.data() });
        }
      } catch (err) {
        console.error('Error loading insight:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="loading-page"><p>Loading...</p></div>;
  if (!insight) return <div className="loading-page"><p>Insight not found. <Link to="/insights">Back to Insights</Link></p></div>;

  return (
    <div className="insight-detail-page">
      <Link to="/insights" className="back-link">← Back to Insights</Link>

      <article className="insight-article">
        <div className="insight-tag">{insight.tag || 'Wisdom'}</div>
        <h1>{insight.title}</h1>
        <p className="insight-excerpt">{insight.excerpt}</p>

        <div className="article-body">
          {insight.body && insight.body.split('\n').map((para, i) =>
            para.trim() ? <p key={i}>{para}</p> : null
          )}
        </div>

        {shloka && (
          <div className="shloka-reference">
            <h3>Referenced Scripture</h3>
            <div className="shloka-card">
              <div className="verse-header">
                <span className="verse-num">Chapter {shloka.chapter}, Verse {shloka.verse}</span>
                {shloka.tags && (
                  <div className="shloka-tags">
                    {shloka.tags.map(tag => <span key={tag} className="tag-badge">{tag}</span>)}
                  </div>
                )}
              </div>
              <div className="sanskrit"><strong>Sanskrit:</strong><p>{shloka.sanskrit}</p></div>
              <div className="hindi"><strong>Hindi:</strong><p>{shloka.hindi}</p></div>
              <div className="english"><strong>English:</strong><p>{shloka.english}</p></div>

              {shloka.ytVideoId && (
                <div className="yt-embed">
                  <h4>Watch the explanation</h4>
                  <div className="yt-wrapper">
                    <iframe
                      src={`https://www.youtube.com/embed/${shloka.ytVideoId}`}
                      title="YouTube video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default InsightDetail;
