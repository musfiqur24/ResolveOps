import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('admin@resolveops.local');
  const [password, setPassword] = useState('hello123');
  const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;
  async function submit(e) {
    e.preventDefault(); setError('');
    try { await login(email, password); } catch (err) { setError(err.response?.data?.message || 'Login failed'); }
  }
  return <div className="login-page">
    <form className="login-card" onSubmit={submit}>
      <div className="brand-logo login-logo"><span className="brand-mark" aria-hidden="true">R</span>ResolveOps</div>
      <p className="brand-subtitle">Incident management</p>
      <h1>Respond with clarity.</h1>
      <p>Incident response, on-call coordination, and postmortems in one place.</p>
      {error && <div className="error">{error}</div>}
      <label>Email<input value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button className="primary">Enter ResolveOps</button>
      <small>Seed login: admin@resolveops.local / hello123</small>
    </form>
  </div>;
}
