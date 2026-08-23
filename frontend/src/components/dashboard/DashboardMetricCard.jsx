import Icon from '../ui/Icon.jsx';

export default function DashboardMetricCard({ icon, label, note, tone, value }) {
  return <article className={'dashboard-metric dashboard-metric--' + tone}>
    <div>
      <span className="dashboard-metric__label">{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
    <span className="dashboard-metric__icon" aria-hidden="true">
      <Icon name={icon} size={21} />
    </span>
  </article>;
}
