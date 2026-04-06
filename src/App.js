import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import GitaExplorer from './components/GitaExplorer';
import AdminPanel from './components/AdminPanel';
import Insights from './components/Insights';
import InsightDetail from './components/InsightDetail';
import Subscribe from './components/Subscribe';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-content">
            <Link to="/" className="logo">
              <h1>॥ SHASTRA ॥</h1>
              <p className="tagline">Ancient texts. Modern life.</p>
            </Link>
            <nav className="nav">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/explorer" className="nav-link">Scripture Library</Link>
              <Link to="/insights" className="nav-link">Insights</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explorer" element={<GitaExplorer />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:id" element={<InsightDetail />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>॥ यथा शास्त्रं तथा कर्म ॥</p>
          <p>Act as the scripture commands.</p>
        </footer>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <h2>Welcome to Shastra</h2>
        <p>Explore ancient wisdom for modern life challenges</p>
        <p className="description">
          Shastra brings you the timeless teachings of the Bhagavad Gita,
          helping you find guidance on corporate strategy, personal growth,
          leadership, and inner peace.
        </p>
        <a href="/explorer" className="cta-button">Explore Scripture Library</a>
      </section>

      <section className="features">
        <Link to="/explorer" className="feature-card">
          <h3>📚 Scripture Library</h3>
          <p>Browse the Bhagavad Gita by chapter and verse</p>
        </Link>
        <Link to="/insights" className="feature-card">
          <h3>💡 Insights</h3>
          <p>Ancient wisdom applied to modern life situations</p>
        </Link>
        <Link to="/explorer" className="feature-card">
          <h3>🌍 Multilingual</h3>
          <p>Read Sanskrit, Hindi, and English translations side by side</p>
        </Link>
      </section>

      <Subscribe />
    </div>
  );
}


export default App;
