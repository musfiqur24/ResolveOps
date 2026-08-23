import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import IncidentForm from '../components/IncidentForm.jsx';
import DashboardFilters from '../components/dashboard/DashboardFilters.jsx';
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx';
import IncidentBoard from '../components/dashboard/IncidentBoard.jsx';
import IncidentTable from '../components/dashboard/IncidentTable.jsx';
import useDashboardData from '../hooks/useDashboardData.js';
import { filterIncidents } from '../utils/dashboard.js';

const initialFilters = {
  assignee: '',
  dateRange: '',
  query: '',
  service: '',
  severity: '',
  sort: 'newest',
  status: ''
};

export default function Incidents() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin';
  const {
    error,
    incidents,
    loading,
    reload,
    updateStatus,
    users
  } = useDashboardData(isAdmin);
  const [filters, setFilters] = useState(initialFilters);
  const [showForm, setShowForm] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const services = useMemo(() => [...new Set(
    incidents.map(incident => incident.service).filter(Boolean)
  )].sort(), [incidents]);
  const filteredIncidents = useMemo(
    () => filterIncidents(incidents, filters),
    [filters, incidents]
  );

  async function handleStatusChange(id, status) {
    setUpdatingId(id);
    try {
      await updateStatus(id, status);
      showToast('Incident status updated.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to update the incident status.', 'error');
    } finally {
      setUpdatingId('');
    }
  }

  return <section className="dashboard-page">
    <section className="incidents-header-card">
      <DashboardHeader
        description={isAdmin
          ? 'Search the full response queue and focus it by engineer, status, service, or severity.'
          : 'Search and filter the incidents assigned to you.'}
        isAdmin={isAdmin}
        title={isAdmin ? 'All incidents' : 'My incidents'}
        onCreate={() => setShowForm(true)}
      />
    </section>

    {error && <div className="error">{error}</div>}

    <DashboardFilters
      filters={filters}
      isAdmin={isAdmin}
      onChange={setFilters}
      onClear={() => setFilters(initialFilters)}
      onViewModeChange={setViewMode}
      resultCount={filteredIncidents.length}
      services={services}
      users={users}
      viewMode={viewMode}
    />

    {viewMode === 'table'
      ? <IncidentTable
        incidents={filteredIncidents}
        loading={loading}
        updatingId={updatingId}
        onStatusChange={handleStatusChange}
      />
      : <IncidentBoard
        incidents={filteredIncidents}
        loading={loading}
        onStatusChange={handleStatusChange}
      />}

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
