import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const AdminPanel = () => {
  const [formData, setFormData] = useState({
    sanskrit: '',
    hindi: '',
    english: '',
    chapter: '',
    verse: '',
    tags: []
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const availableTags = ['Corporate', 'Personal', 'Leadership', 'Inner Battle'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sanskrit || !formData.chapter || !formData.verse) {
      setMessage('Error: Please fill in Sanskrit, Chapter, and Verse fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'shlokas'), {
        sanskrit: formData.sanskrit,
        hindi: formData.hindi,
        english: formData.english,
        chapter: parseInt(formData.chapter),
        verse: parseInt(formData.verse),
        tags: formData.tags,
        createdAt: new Date()
      });

      setMessage('✓ Shloka added successfully! It will appear on the site within 5 seconds.');
      setFormData({
        sanskrit: '',
        hindi: '',
        english: '',
        chapter: '',
        verse: '',
        tags: []
      });

      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error adding shloka:', error);
      setMessage('Error: Could not add shloka. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-container">
        <h1>Shastra Admin Panel</h1>
        <p className="subtitle">Add new shlokas to the database</p>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="sanskrit">Sanskrit *</label>
            <textarea
              id="sanskrit"
              name="sanskrit"
              value={formData.sanskrit}
              onChange={handleInputChange}
              placeholder="Enter Sanskrit text"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="hindi">Hindi Meaning</label>
            <textarea
              id="hindi"
              name="hindi"
              value={formData.hindi}
              onChange={handleInputChange}
              placeholder="Enter Hindi translation"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="english">English Meaning</label>
            <textarea
              id="english"
              name="english"
              value={formData.english}
              onChange={handleInputChange}
              placeholder="Enter English translation"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="chapter">Chapter *</label>
              <select
                id="chapter"
                name="chapter"
                value={formData.chapter}
                onChange={handleInputChange}
              >
                <option value="">Select Chapter</option>
                {Array.from({ length: 18 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Chapter {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="verse">Verse *</label>
              <input
                id="verse"
                type="number"
                name="verse"
                value={formData.verse}
                onChange={handleInputChange}
                placeholder="Enter verse number"
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Context Tags</label>
            <div className="tags-selector">
              {availableTags.map(tag => (
                <label key={tag} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Shloka'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
