import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './layout/Sidebar.jsx';
import Topbar from './layout/Topbar.jsx';

export default function Layout() {
  const { user, logout } = useAuth();

  return <div className="app-shell">
    <Sidebar onLogout={logout} />
    <div className="app-main">
      <Topbar user={user} />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  </div>;
}
