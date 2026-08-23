import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import IncidentForm from '../components/IncidentForm.jsx';
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx';
import DashboardAnalytics from '../components/dashboard/DashboardAnalytics.jsx';
import DashboardMetrics from '../components/dashboard/DashboardMetrics.jsx';
import DashboardOverview from '../components/dashboard/DashboardOverview.jsx';
import DashboardSummaryStrip from '../components/dashboard/DashboardSummaryStrip.jsx';
import useDashboardData from '../hooks/useDashboardData.js';
import { getDashboardMetrics } from '../utils/dashboard.js';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { error, incidents, reload, stats, users } = useDashboardData(isAdmin);
  const [showForm, setShowForm] = useState(false);
  const metrics = useMemo(
    () => getDashboardMetrics(incidents, stats),
    [incidents, stats]
  );

  return <section className="dashboard-page">
    <section className="dashboard-hero-card">
      <DashboardHeader
        isAdmin={isAdmin}
        onCreate={() => setShowForm(true)}
      />
      <DashboardMetrics metrics={metrics} />
    </section>
    {error && <div className="error">{error}</div>}
    <section className="dashboard-workspace-card">
      <DashboardOverview isAdmin={isAdmin} />
      <DashboardSummaryStrip metrics={metrics} />
      <DashboardAnalytics metrics={metrics} />
    </section>

    {showForm && isAdmin && <IncidentForm
      users={users}
      onClose={() => setShowForm(false)}
      onSaved={() => {
        setShowForm(false);
        void reload();
      }}
    />}
  </section>;
}
