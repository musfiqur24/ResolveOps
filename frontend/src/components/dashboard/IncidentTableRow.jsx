import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import SeverityBadge from './SeverityBadge.jsx';
import StatusBadge from './StatusBadge.jsx';
import {
  formatDate,
  getAssigneeName,
  incidentDisplayId,
  statusValues
} from '../../utils/dashboard.js';

export default function IncidentTableRow({ incident, onStatusChange, updating }) {
  const incidentPath = '/incidents/' + incident._id;

  return <tr>
    <td><Link className="incident-id-link" to={incidentPath}>{incidentDisplayId(incident)}</Link></td>
    <td><SeverityBadge severity={incident.severity} /></td>
    <td className="incident-table__description">
      <Link to={incidentPath}>
        <b>{incident.title}</b>
        <span>{incident.service}</span>
      </Link>
    </td>
    <td>
      <div className="status-select-wrap">
        <StatusBadge status={incident.status} />
        <select
          aria-label={'Change status for ' + incident.title}
          disabled={updating}
          value={incident.status}
          onChange={event => onStatusChange(incident._id, event.target.value)}
        >
          {statusValues.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>
    </td>
    <td><span className="assigned-person">{getAssigneeName(incident)}</span></td>
    <td><span className="incident-date">{formatDate(incident.startedAt || incident.createdAt)}</span></td>
    <td>
      <Link className="incident-open-link" to={incidentPath} aria-label={'Open ' + incident.title}>
        <Icon name="arrow" size={17} />
      </Link>
    </td>
  </tr>;
}
