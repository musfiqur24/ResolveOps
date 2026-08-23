import DashboardMetricCard from './DashboardMetricCard.jsx';
import { formatMttr } from '../../utils/dashboard.js';

export default function DashboardMetrics({ metrics }) {
  const cards = [
    {
      icon: 'clock',
      label: 'Pending incidents',
      note: metrics.pending ? 'Needs attention' : 'Queue is clear',
      tone: 'warning',
      value: metrics.pending
    },
    {
      icon: 'check',
      label: 'Completed this month',
      note: metrics.completedThisMonth ? 'Resolved this calendar month' : 'No monthly resolutions yet',
      tone: 'success',
      value: metrics.completedThisMonth
    },
    {
      icon: 'trend',
      label: 'Average MTTR',
      note: 'Across visible resolved incidents',
      tone: 'secondary',
      value: formatMttr(metrics.avgMttr)
    },
    {
      icon: 'alert',
      label: 'Critical incidents',
      note: metrics.critical ? 'Escalate immediately' : 'No critical incidents',
      tone: 'critical',
      value: metrics.critical
    }
  ];

  return <section className="dashboard-metrics" aria-label="Incident summary">
    {cards.map(card => <DashboardMetricCard key={card.label} {...card} />)}
  </section>;
}
