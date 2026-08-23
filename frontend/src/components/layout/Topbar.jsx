import Notifications from '../Notifications.jsx';
import Icon from '../ui/Icon.jsx';
import { roleLabel } from '../../utils/roles.js';

export default function Topbar({ user }) {
  const initials = (user?.name || 'User')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
  const currentRoleLabel = roleLabel(user?.role);

  return <header className="topbar">
    <div className="topbar-context">
      <span>Incident operations</span>
      <p>Reliable response, clearly organized.</p>
    </div>
    <div className="topbar-actions">
      <Notifications />
      <div className="topbar-profile" aria-label={'Signed in as ' + (user?.name || 'user') + ', ' + currentRoleLabel}>
        <span className="user-avatar" aria-hidden="true">{initials}</span>
        <span className="topbar-profile__copy">
          <b>{user?.name || 'User'}</b>
          <small>{currentRoleLabel}</small>
        </span>
        <Icon name="chevron" size={15} className="topbar-profile__chevron" />
      </div>
    </div>
  </header>;
}
