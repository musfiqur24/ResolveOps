import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Notifications from './Notifications.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const initials = (user?.name || 'User')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
  const roleLabel = user?.role === 'admin' ? 'Administrator' : 'Engineer';

  return <div className="shell">
    <header className="app-header">
      <div className="app-header__inner">
        <NavLink to="/" end className="app-brand" aria-label="ResolveOps dashboard">
          <span className="brand-mark" aria-hidden="true">R</span>
          ResolveOps
        </NavLink>
        <div className="header-actions">
          <nav className="app-nav" aria-label="Primary navigation">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/team">On-Call Team</NavLink>
            <button type="button" onClick={logout}>Logout</button>
          </nav>
          <Notifications />
          <div className="user-profile" aria-label={`Signed in as ${user?.name || 'user'}, ${roleLabel}`}>
            <span className="user-avatar" aria-hidden="true">{initials}</span>
            <span className="user-profile__copy">
              <b>{user?.name || 'User'}</b>
              <small>{roleLabel}</small>
            </span>
          </div>
        </div>
      </div>
    </header>
    <main className="content">
      <div className="welcome-card">
        <span>Incident Management</span>
        <h2>Respond with clarity.</h2>
        <p>{user?.role === 'admin' ? 'Monitor every incident and coordinate the response.' : 'Focus on the incidents assigned to you.'}</p>
      </div>
      <Outlet />
    </main>
  </div>;
}
