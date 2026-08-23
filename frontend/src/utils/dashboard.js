export const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' }
];

export const statusValues = ['open', 'investigating', 'resolved'];

const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };

function dateValue(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateForFilter(incident) {
  return dateValue(incident.startedAt || incident.createdAt || incident.resolvedAt);
}

function matchesDateRange(incident, range) {
  if (!range) return true;
  const date = dateForFilter(incident);
  if (!date) return false;

  const today = startOfToday();
  if (range === 'today') return date >= today;

  if (range === 'week') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return date >= start;
  }

  if (range === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return date >= start;
  }

  if (range === 'last30') {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return date >= start;
  }

  return true;
}

export function getAssigneeId(incident) {
  return incident.assignedTo?._id || incident.assignedTo?.id || incident.assignedTo || '';
}

export function getAssigneeName(incident) {
  if (!incident.assignedTo) return 'Unassigned';
  if (typeof incident.assignedTo === 'string') return 'Assigned engineer';
  return incident.assignedTo.name || incident.assignedTo.email || 'Assigned engineer';
}

export function statusLabel(status) {
  return {
    open: 'Open',
    investigating: 'Investigating',
    resolved: 'Resolved'
  }[status] || status || 'Open';
}

export function incidentDisplayId(incident) {
  const rawId = String(incident?._id || incident?.id || '');
  return 'INC-' + (rawId.slice(-5).toUpperCase() || 'NEW');
}

export function formatDate(value) {
  const date = dateValue(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  }).format(date);
}

export function formatMttr(value) {
  const minutes = Math.round(Number(value));
  if (!Number.isFinite(minutes) || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return hours ? hours + 'h ' + remaining + 'm' : remaining + 'm';
}

export function formatActiveAge(hours) {
  if (!Number.isFinite(hours)) return '—';
  if (hours < 24) return hours + 'h';
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return days + 'd ' + remainingHours + 'h';
}

export function filterIncidents(incidents, filters) {
  const filtered = incidents.filter(incident => {
    const query = filters.query.trim().toLowerCase();
    const searchable = [
      incident.title,
      incident.service,
      incident.description,
      incident.severity,
      incident.status,
      getAssigneeName(incident),
      incidentDisplayId(incident)
    ].filter(Boolean).join(' ').toLowerCase();

    if (query && !searchable.includes(query)) return false;
    if (filters.service && incident.service !== filters.service) return false;
    if (filters.severity && incident.severity !== filters.severity) return false;
    if (filters.assignee === 'unassigned' && getAssigneeId(incident)) return false;
    if (filters.assignee && filters.assignee !== 'unassigned' && getAssigneeId(incident) !== filters.assignee) return false;
    if (filters.status === 'pending' && incident.status === 'resolved') return false;
    if (filters.status && filters.status !== 'pending' && incident.status !== filters.status) return false;
    return matchesDateRange(incident, filters.dateRange);
  });

  return filtered.sort((first, second) => {
    if (filters.sort === 'oldest') {
      return (dateValue(first.startedAt || first.createdAt)?.getTime() || 0)
        - (dateValue(second.startedAt || second.createdAt)?.getTime() || 0);
    }
    if (filters.sort === 'priority') {
      return (severityRank[second.severity] || 0) - (severityRank[first.severity] || 0);
    }
    if (filters.sort === 'mttr') {
      return (Number(second.mttrMinutes) || 0) - (Number(first.mttrMinutes) || 0);
    }
    return (dateValue(second.startedAt || second.createdAt)?.getTime() || 0)
      - (dateValue(first.startedAt || first.createdAt)?.getTime() || 0);
  });
}

export function getDashboardMetrics(incidents, stats) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const today = startOfToday();
  const resolved = incidents.filter(incident => incident.status === 'resolved');
  const active = incidents.filter(incident => incident.status !== 'resolved');
  const oldestActiveDate = active
    .map(incident => dateValue(incident.startedAt || incident.createdAt))
    .filter(Boolean)
    .sort((first, second) => first - second)[0];
  const mttrValues = resolved
    .map(incident => Number(incident.mttrMinutes))
    .filter(value => Number.isFinite(value) && value >= 0);
  const calculatedMttr = mttrValues.length
    ? Math.round(mttrValues.reduce((sum, value) => sum + value, 0) / mttrValues.length)
    : 0;

  return {
    total: incidents.length,
    pending: active.length,
    open: incidents.filter(incident => incident.status === 'open').length,
    investigating: incidents.filter(incident => incident.status === 'investigating').length,
    completedThisMonth: resolved.filter(incident => {
      const date = dateValue(incident.resolvedAt);
      return date && date >= monthStart && date < nextMonthStart;
    }).length,
    resolvedToday: resolved.filter(incident => {
      const date = dateValue(incident.resolvedAt);
      return date && date >= today;
    }).length,
    critical: incidents.filter(incident => incident.severity === 'critical').length,
    highPriorityActive: active.filter(incident => ['critical', 'high'].includes(incident.severity)).length,
    unassignedActive: active.filter(incident => !getAssigneeId(incident)).length,
    resolutionRate: incidents.length ? Math.round((resolved.length / incidents.length) * 100) : 0,
    oldestActiveHours: oldestActiveDate
      ? Math.max(0, Math.floor((now.getTime() - oldestActiveDate.getTime()) / 3600000))
      : null,
    avgMttr: calculatedMttr,
    onCall: stats?.onCall?.length || 0
  };
}
