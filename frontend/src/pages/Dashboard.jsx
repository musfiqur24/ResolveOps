import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import IncidentForm from '../components/IncidentForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const columns = [
  { key: 'open', label: 'Open', hint: 'Ready to investigate' },
  { key: 'investigating', label: 'Investigating', hint: 'Active response' },
  { key: 'resolved', label: 'Resolved', hint: 'Postmortem ready' }
];

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin';
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [incidentResult, statsResult, usersResult] = await Promise.all([
        api.get('/incidents'),
        api.get('/incidents/stats'),
        isAdmin ? api.get('/auth/users') : Promise.resolve(null)
      ]);
      setIncidents(incidentResult.data.incidents || []);
      setStats(statsResult.data);
      setUsers(usersResult?.data?.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load incidents right now.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [isAdmin]);

  const filtered = useMemo(() => incidents.filter(incident => (
    `${incident.title} ${incident.service} ${incident.severity} ${incident.assignedTo?.name || ''}`
      .toLowerCase()
      .includes(query.toLowerCase())
  )), [incidents, query]);

  async function changeStatus(id, status) {
    try {
      await api.patch(`/incidents/${id}`, { status });
      await load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to update the incident status.', 'error');
    }
  }

  function handleDrop(event, status) {
    event.preventDefault();
    const incidentId = event.dataTransfer.getData('incident-id');
    if (incidentId) changeStatus(incidentId, status);
  }

  const emptyMessage = isAdmin
    ? (query ? 'No incidents match this search.' : 'No incidents have been created yet.')
    : (query ? 'None of your assigned incidents match this search.' : 'No incidents are assigned to you right now.');

  return <section className="dashboard">
    <div className="dashboard-heading">
      <div>
        <span className={`scope-pill ${isAdmin ? 'scope-pill--admin' : ''}`}>
          {isAdmin ? 'Administrator view' : 'My assigned work'}
        </span>
        <h1>{isAdmin ? 'All incidents' : 'Your incidents'}</h1>
        <p>{isAdmin ? 'Track, assign, and coordinate the full response queue.' : 'Only incidents assigned to you appear in this workspace.'}</p>
      </div>
    </div>

    <div className="action-row">
      <input
        className="search"
        placeholder="Search incident, service, severity..."
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      {isAdmin && <button className="cyan-pill" onClick={() => setShowForm(true)}>Create incident</button>}
    </div>

    {error && <div className="error">{error}</div>}

    {stats && <div className="metrics">
      <Metric title={isAdmin ? 'Total incidents' : 'Assigned to you'} value={stats.total} />
      <Metric title="Average MTTR" value={`${stats.avgMttr}m`} />
      <Metric title="Critical" value={stats.bySeverity?.critical || 0} />
      <Metric title="On-call" value={stats.onCall?.length || 0} />
    </div>}

    {showForm && isAdmin && <IncidentForm users={users} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}

    {loading ? <div className="empty-board"><h2>Loading incidents…</h2></div> : filtered.length === 0 ? (
      <div className="empty-board">
        <span className="empty-board__icon" aria-hidden="true">⌁</span>
        <h2>{emptyMessage}</h2>
        <p>{isAdmin ? 'Create an incident to begin organizing response work.' : 'An administrator will add work here when it is assigned to you.'}</p>
      </div>
    ) : <div className="kanban">
      {columns.map(column => {
        const columnIncidents = filtered.filter(incident => incident.status === column.key);
        return <div
          className="column"
          key={column.key}
          onDragOver={event => event.preventDefault()}
          onDrop={event => handleDrop(event, column.key)}
        >
          <div className="column-head"><h2>{column.label}</h2><span>{columnIncidents.length}</span></div>
          <div className="dropzone">{column.hint}</div>
          {columnIncidents.map(incident => <IncidentCard key={incident._id} incident={incident} />)}
        </div>;
      })}
    </div>}
  </section>;
}

function Metric({ title, value }) {
  return <div className="metric"><span>{title}</span><strong>{value}</strong></div>;
}

function IncidentCard({ incident }) {
  return <Link
    draggable
    onDragStart={event => event.dataTransfer.setData('incident-id', incident._id)}
    to={`/incidents/${incident._id}`}
    className={`incident-card sev-${incident.severity}`}
  >
    <div className="card-top"><span className="badge">{incident.severity}</span><span>{incident.service}</span></div>
    <h3>{incident.title}</h3>
    <p>{incident.description}</p>
    <div className="card-footer">
      <span className="card-owner">Assigned to {incident.assignedTo?.name || 'Unassigned'}</span>
      <span>MTTR {incident.mttrMinutes ?? '—'}m</span>
    </div>
  </Link>;
}
