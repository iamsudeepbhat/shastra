import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const Subscribe = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'subscribers'), {
        email,
        subscribedAt: new Date()
      });
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error('Subscribe error:', err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="subscribe-section">
      <div className="subscribe-content">
        <h2>Weekly Wisdom</h2>
        <p>Get one shloka with modern context delivered every week</p>
        <form onSubmit={handleSubmit} className="subscribe-form">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setStatus(''); }}
            placeholder="your@email.com"
            className="subscribe-input"
            disabled={loading}
          />
          <button type="submit" className="subscribe-btn" disabled={loading}>
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {status === 'success' && (
          <p className="subscribe-success">You're in. Weekly wisdom coming your way.</p>
        )}
        {status === 'error' && (
          <p className="subscribe-error">Please enter a valid email address.</p>
        )}
      </div>
    </section>
  );
};

export default Subscribe;
