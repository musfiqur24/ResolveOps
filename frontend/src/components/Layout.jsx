import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Notifications from './Notifications.jsx';

export default function Layout() {
  const { user, logout } = useAuth();

  return <div className="shell">
    <header className="app-header">
      <div className="app-header__inner">
        <NavLink to="/" end className="app-brand" aria-label="ResolveOps dashboard">
          <span className="brand-mark" aria-hidden="true">R</span>
          ResolveOps
        </NavLink>
        <nav className="app-nav" aria-label="Primary navigation">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/team">On-Call Team</NavLink>
          <button type="button" onClick={logout}>Logout</button>
        </nav>
      </div>
    </header>
    <main className="content">
      <div className="welcome-card">
        <span>Incident Management</span>
        <h2>Respond with clarity.</h2>
        <p>Detect fast, coordinate response, and resolve with confidence.</p>
      </div>
      <div className="topbar"><div>Signed in as <b>{user?.name}</b></div><Notifications /></div>
      <Outlet />
    </main>
  </div>;
}
