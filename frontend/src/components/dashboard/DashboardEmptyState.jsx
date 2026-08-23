import Icon from '../ui/Icon.jsx';

export default function DashboardEmptyState({ message, title }) {
  return <div className="dashboard-empty-state">
    <span className="dashboard-empty-state__icon" aria-hidden="true"><Icon name="empty" size={23} /></span>
    <h3>{title}</h3>
    <p>{message}</p>
  </div>;
}
