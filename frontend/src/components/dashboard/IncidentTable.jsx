import DashboardEmptyState from './DashboardEmptyState.jsx';
import IncidentTableRow from './IncidentTableRow.jsx';

export default function IncidentTable({ incidents, loading, onStatusChange, updatingId }) {
  if (loading) {
    return <section className="incident-log">
      <DashboardEmptyState title="Loading incidents" message="Pulling the current response queue." />
    </section>;
  }

  if (incidents.length === 0) {
    return <section className="incident-log">
      <DashboardEmptyState
        title="No incidents found"
        message="Try clearing a filter, or wait for work to be assigned to you."
      />
    </section>;
  }

  return <section className="incident-log">
    <div className="incident-table-scroll">
      <table className="incident-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Severity</th>
            <th>Image</th>
            <th>Incident</th>
            <th>Status</th>
            <th>Assigned</th>
            <th>Started</th>
            <th><span className="sr-only">Open</span></th>
          </tr>
        </thead>
        <tbody>
          {incidents.map(incident => <IncidentTableRow
            incident={incident}
            key={incident._id}
            updating={updatingId === incident._id}
            onStatusChange={onStatusChange}
          />)}
        </tbody>
      </table>
    </div>
  </section>;
}
