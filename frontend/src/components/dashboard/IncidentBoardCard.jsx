import { Link } from 'react-router-dom';
import SeverityBadge from './SeverityBadge.jsx';
import { getAssigneeName } from '../../utils/dashboard.js';

export default function IncidentBoardCard({ incident }) {
  return <Link
    className="incident-board-card"
    draggable
    to={'/incidents/' + incident._id}
    onDragStart={event => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('incident-id', incident._id);
    }}
  >
    <div className="incident-board-card__top">
      <SeverityBadge severity={incident.severity} />
      <span>{incident.service}</span>
    </div>
    <h3>{incident.title}</h3>
    <p>{incident.description}</p>
    <small>{getAssigneeName(incident)}</small>
  </Link>;
}
