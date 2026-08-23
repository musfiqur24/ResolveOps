import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

export default function DashboardOverview({ isAdmin }) {
  return <section className="dashboard-overview">
    <div className="dashboard-overview__icon" aria-hidden="true">
      <Icon name="table" size={23} />
    </div>
    <div>
      <span className="section-eyebrow">Incident workspace</span>
      <h2>Keep the dashboard focused on the signal.</h2>
      <p>{isAdmin
        ? 'Open Incidents to review the full queue, search incidents, and filter by assignee or status.'
        : 'Open Incidents to review the work currently assigned to you.'}</p>
    </div>
    <Link className="dashboard-overview__link" to="/incidents">
      <span>View incidents</span>
      <Icon name="arrow" size={17} />
    </Link>
  </section>;
}
