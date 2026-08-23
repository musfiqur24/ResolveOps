import Icon from '../ui/Icon.jsx';
import DashboardViewToggle from './DashboardViewToggle.jsx';
import { statusOptions } from '../../utils/dashboard.js';

export default function DashboardFilters({
  filters,
  isAdmin,
  onChange,
  onClear,
  resultCount,
  services,
  users,
  viewMode,
  onViewModeChange
}) {
  const update = key => event => onChange({ ...filters, [key]: event.target.value });
  const hasActiveFilters = Boolean(
    filters.query
    || filters.service
    || filters.status
    || filters.severity
    || filters.assignee
    || filters.dateRange
    || filters.sort !== 'newest'
  );

  return <section className="dashboard-filter-panel" aria-label="Filter incidents">
    <div className="dashboard-filter-panel__top">
      <div>
        <span className="section-eyebrow">Live incident log</span>
        <h2>Find the work that needs attention</h2>
      </div>
      <DashboardViewToggle value={viewMode} onChange={onViewModeChange} />
    </div>
    <div className="dashboard-filters">
      <label className="filter-search">
        <Icon name="search" size={18} />
        <span className="sr-only">Search incidents</span>
        <input
          placeholder="Search incident, service, engineer..."
          value={filters.query}
          onChange={update('query')}
        />
      </label>
      <select aria-label="Filter by service" value={filters.service} onChange={update('service')}>
        <option value="">All services</option>
        {services.map(service => <option key={service} value={service}>{service}</option>)}
      </select>
      <select aria-label="Filter by status" value={filters.status} onChange={update('status')}>
        {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <select aria-label="Filter by severity" value={filters.severity} onChange={update('severity')}>
        <option value="">All severity</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      {isAdmin && <select aria-label="Filter by assigned engineer" value={filters.assignee} onChange={update('assignee')}>
        <option value="">All engineers</option>
        <option value="unassigned">Unassigned</option>
        {users.map(user => <option key={user.id || user._id} value={user.id || user._id}>{user.name}</option>)}
      </select>}
      <select aria-label="Filter by date range" value={filters.dateRange} onChange={update('dateRange')}>
        <option value="">All time</option>
        <option value="today">Today</option>
        <option value="week">Last 7 days</option>
        <option value="month">This month</option>
        <option value="last30">Last 30 days</option>
      </select>
      <select aria-label="Sort incidents" value={filters.sort} onChange={update('sort')}>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="priority">Highest severity</option>
        <option value="mttr">Longest MTTR</option>
      </select>
    </div>
    <div className="dashboard-filter-panel__bottom">
      <span><Icon name="filter" size={15} /> {resultCount} {resultCount === 1 ? 'incident' : 'incidents'} shown</span>
      {hasActiveFilters && <button className="clear-filters" type="button" onClick={onClear}>Clear filters</button>}
    </div>
  </section>;
}
