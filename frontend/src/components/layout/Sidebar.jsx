import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: 'grid', end: true },
  { to: '/incidents', label: 'Incidents', icon: 'table' },
  { to: '/team', label: 'On-call team', icon: 'team' }
];

export default function Sidebar({ onLogout }) {
  return <aside className="sidebar">
    <NavLink to="/" end className="sidebar-brand" aria-label="ResolveOps dashboard">
      <img className="brand-mark brand-mark--image" src="/resolveOps_logo.png" alt="" />
      <span>ResolveOps</span>
    </NavLink>

    <div className="sidebar-nav-label">Workspace</div>
    <nav className="sidebar-nav" aria-label="Primary navigation">
      {links.map(link => <NavLink
        className={({ isActive }) => 'sidebar-nav__link' + (isActive ? ' active' : '')}
        end={link.end}
        key={link.to}
        to={link.to}
      >
        <Icon name={link.icon} size={17} />
        <span>{link.label}</span>
      </NavLink>)}
    </nav>

    <div className="sidebar-bottom">
      <button className="sidebar-logout" type="button" onClick={onLogout}>
        <Icon name="logout" size={17} />
        <span>Logout</span>
      </button>
      <div className="sidebar-footer">
        <span className="sidebar-footer__dot" aria-hidden="true" />
        <div>
          <b>Operations online</b>
          <small>Role-aware incident workspace</small>
        </div>
      </div>
    </div>
  </aside>;
}
