import { useState } from 'react';
import PropTypes from 'prop-types';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { api } from '../api/client.js';
import './LoginView.css';

export default function LoginView({ onLogin, error, setError }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    username: 'demo',
    displayName: '',
    password: 'shelflife',
  });
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data =
        mode === 'login'
          ? await api.login({ username: form.username, password: form.password })
          : await api.register(form);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      {/* Left: branding + photos */}
      <section className="login-hero">
        <div className="login-brand">
          <span className="login-logo" aria-hidden="true">
            S
          </span>
          <div>
            <span className="login-brand-name">ShelfLife</span>
            <p className="login-brand-tagline">Fresh tracking, less waste</p>
          </div>
        </div>

        <h1 className="login-heading">
          Know what&rsquo;s in your kitchen.
          <br />
          Cook before it&rsquo;s too late.
        </h1>
        <p className="login-description">
          Track pantry dates, match recipes to what you already own, keep a smart shopping list, and
          log every meal you rescued from the bin.
        </p>

        <div className="login-photo-strip" aria-hidden="true">
          <div className="login-photo login-photo--1">
            <img src="/images/market-produce.jpg" alt="" />
          </div>
          <div className="login-photo login-photo--2">
            <img src="/images/dinner-plate.jpg" alt="" />
          </div>
          <div className="login-photo login-photo--3">
            <img src="/images/kitchen-table.jpg" alt="" />
          </div>
        </div>

        <div className="login-features">
          <div className="login-feature">
            <span className="login-feature-icon">&#x1F96C;</span>
            <strong>Pantry tracking</strong>
            <p>Dates, categories, and storage zones. Find what needs attention first.</p>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">&#x1F373;</span>
            <strong>Recipe matching</strong>
            <p>Recipes ranked by what you already have. Fewer store trips.</p>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">&#x1F6D2;</span>
            <strong>Shopping gaps</strong>
            <p>Only the ingredients missing from your pantry go on the list.</p>
          </div>
        </div>
      </section>

      {/* Right: auth card */}
      <section className="login-card">
        <div className="login-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === 'login' ? 'login-tab active' : 'login-tab'}
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'login-tab active' : 'login-tab'}
            onClick={() => setMode('register')}
          >
            Create account
          </button>
        </div>

        <ErrorBanner message={error} />

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={updateField}
              placeholder="your-name"
              autoComplete="username"
            />
          </div>
          {mode === 'register' ? (
            <div className="form-field">
              <label htmlFor="displayName">Display name</label>
              <input
                id="displayName"
                name="displayName"
                value={form.displayName}
                onChange={updateField}
                placeholder="Chef Alex"
              />
            </div>
          ) : null}
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          <button type="submit" className="primary-button login-submit" disabled={submitting}>
            {submitting
              ? 'Please wait...'
              : mode === 'login'
                ? 'Open ShelfLife'
                : 'Create your account'}
          </button>
        </form>

        <p className="demo-note">
          Demo account: <strong>demo</strong> / <strong>shelflife</strong>
        </p>
      </section>
    </main>
  );
}

LoginView.propTypes = {
  onLogin: PropTypes.func.isRequired,
  error: PropTypes.string,
  setError: PropTypes.func.isRequired,
};
