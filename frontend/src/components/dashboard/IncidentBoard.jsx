import DashboardEmptyState from './DashboardEmptyState.jsx';
import IncidentBoardCard from './IncidentBoardCard.jsx';
import { statusLabel } from '../../utils/dashboard.js';

const columns = ['open', 'investigating', 'resolved'];

export default function IncidentBoard({ incidents, loading, onStatusChange }) {
  if (loading) {
    return <section className="incident-board">
      <DashboardEmptyState title="Loading incidents" message="Preparing the response board." />
    </section>;
  }

  if (incidents.length === 0) {
    return <section className="incident-board">
      <DashboardEmptyState title="No incidents found" message="Try clearing a filter to see more work." />
    </section>;
  }

  function drop(event, status) {
    event.preventDefault();
    const incidentId = event.dataTransfer.getData('incident-id');
    if (incidentId) onStatusChange(incidentId, status);
  }

  return <section className="incident-board" aria-label="Incident board">
    {columns.map(status => {
      const columnIncidents = incidents.filter(incident => incident.status === status);
      return <div
        className={'incident-board-column incident-board-column--' + status}
        key={status}
        onDragOver={event => event.preventDefault()}
        onDrop={event => drop(event, status)}
      >
        <div className="incident-board-column__head">
          <h2>{statusLabel(status)}</h2>
          <span>{columnIncidents.length}</span>
        </div>
        <p className="incident-board-column__hint">Drop an incident here to update its status.</p>
        {columnIncidents.map(incident => <IncidentBoardCard incident={incident} key={incident._id} />)}
      </div>;
    })}
  </section>;
}
