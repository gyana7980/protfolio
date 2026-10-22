import { useState } from 'react';
import { adminRequest } from '../api.js';
import { navigate } from '../App.jsx';

export default function HiddenLogin({ dashboardRoute }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await adminRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem('portfolio-admin-token', result.token);
      navigate(dashboardRoute);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="gate-page">
      <div className="gate-orbit gate-orbit-one" aria-hidden="true" />
      <div className="gate-orbit gate-orbit-two" aria-hidden="true" />
      <form className="gate-form" onSubmit={handleSubmit}>
        <span className="gate-mark" aria-hidden="true">GS</span>
        <p className="admin-kicker">PRIVATE ACCESS</p>
        <h1>Welcome back.</h1>
        <p className="gate-copy">Sign in to update your portfolio.</p>
        <label>
          Username
          <input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="admin-primary gate-submit" type="submit" disabled={busy}>
          {busy ? 'Checking…' : 'Continue'} <span aria-hidden="true">↗</span>
        </button>
      </form>
    </main>
  );
}