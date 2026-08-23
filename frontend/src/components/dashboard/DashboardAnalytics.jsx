import Icon from '../ui/Icon.jsx';
import { formatActiveAge } from '../../utils/dashboard.js';

export default function DashboardAnalytics({ metrics }) {
  const insights = [
    {
      icon: 'check',
      label: 'Resolution rate',
      note: 'Resolved from the visible incident history',
      tone: 'success',
      value: metrics.resolutionRate + '%'
    },
    {
      icon: 'team',
      label: 'Unassigned queue',
      note: 'Active incidents without an owner',
      tone: 'warning',
      value: metrics.unassignedActive
    },
    {
      icon: 'alert',
      label: 'High-priority active',
      note: 'High or critical work still in progress',
      tone: 'critical',
      value: metrics.highPriorityActive
    },
    {
      icon: 'clock',
      label: 'Oldest active incident',
      note: 'Time since the earliest active incident started',
      tone: 'secondary',
      value: formatActiveAge(metrics.oldestActiveHours)
    }
  ];

  return <section className="dashboard-analytics" aria-label="Operational analytics">
    <div className="dashboard-analytics__heading">
      <span className="section-eyebrow">Operational analytics</span>
    </div>
    <div className="dashboard-analytics__grid">
      {insights.map(insight => <article className={'analytics-item analytics-item--' + insight.tone} key={insight.label}>
        <span className="analytics-item__icon" aria-hidden="true"><Icon name={insight.icon} size={18} /></span>
        <div>
          <span>{insight.label}</span>
          <strong>{insight.value}</strong>
          <small>{insight.note}</small>
        </div>
      </article>)}
    </div>
  </section>;
}
