import Icon from '../ui/Icon.jsx';

export default function DashboardSummaryStrip({ metrics }) {
  const items = [
    { icon: 'clock', label: 'Open incidents', tone: 'warning', value: metrics.open },
    { icon: 'trend', label: 'Investigating', tone: 'secondary', value: metrics.investigating },
    { icon: 'check', label: 'Resolved today', tone: 'success', value: metrics.resolvedToday },
    { icon: 'team', label: 'On-call coverage', tone: 'primary', value: metrics.onCall }
  ];

  return <section className="dashboard-summary-strip" aria-label="Operational pulse">
    {items.map(item => <article className={'summary-item summary-item--' + item.tone} key={item.label}>
      <span className="summary-item__icon" aria-hidden="true"><Icon name={item.icon} size={18} /></span>
      <div>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
      </div>
    </article>)}
  </section>;
}
