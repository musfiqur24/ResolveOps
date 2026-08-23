import Icon from '../ui/Icon.jsx';
import { getAssigneeId } from '../../utils/dashboard.js';
import { roleLabel } from '../../utils/roles.js';

function thisMonth(value) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function buildMemberSummary(users, incidents) {
  return users.map(member => {
    const id = String(member.id || member._id);
    const assigned = incidents.filter(incident => String(getAssigneeId(incident)) === id);
    const active = assigned.filter(incident => incident.status !== 'resolved');
    const resolvedThisMonth = assigned.filter(incident => incident.status === 'resolved' && thisMonth(incident.resolvedAt));
    return { ...member, assigned: assigned.length, active: active.length, resolvedThisMonth: resolvedThisMonth.length };
  }).sort((first, second) => second.active - first.active || second.assigned - first.assigned || first.name.localeCompare(second.name));
}

function buildGroupSummary(groups, members, incidents) {
  const groupsById = new Map(groups.map(group => [String(group.id || group._id), group]));
  const buckets = new Map(groups.map(group => [String(group.id || group._id), { ...group, members: [], active: 0, resolvedThisMonth: 0 }]));
  const ungrouped = { id: 'ungrouped', name: 'No group', description: 'Members not assigned to a group', members: [], active: 0, resolvedThisMonth: 0 };

  members.forEach(member => {
    const groupId = member.group?.id || member.group?._id;
    const bucket = groupId && buckets.get(String(groupId)) ? buckets.get(String(groupId)) : ungrouped;
    bucket.members.push(member);
  });

  incidents.forEach(incident => {
    const assigneeId = String(getAssigneeId(incident));
    const member = members.find(item => String(item.id || item._id) === assigneeId);
    const groupId = member?.group?.id || member?.group?._id;
    const bucket = groupId && groupsById.has(String(groupId)) ? buckets.get(String(groupId)) : ungrouped;
    if (incident.status !== 'resolved') bucket.active += 1;
    if (incident.status === 'resolved' && thisMonth(incident.resolvedAt)) bucket.resolvedThisMonth += 1;
  });

  return [...buckets.values(), ...(ungrouped.members.length ? [ungrouped] : [])]
    .sort((first, second) => second.active - first.active || first.name.localeCompare(second.name));
}

export default function DashboardPeopleAnalytics({ isAdmin, groups, incidents, user, users }) {
  if (!isAdmin) {
    const active = incidents.filter(incident => incident.status !== 'resolved').length;
    const resolvedThisMonth = incidents.filter(incident => incident.status === 'resolved' && thisMonth(incident.resolvedAt)).length;
    return <section className="people-analytics">
      <div className="people-analytics__heading">
        <div><span className="section-eyebrow">My workload</span><h2>Assigned to you</h2></div>
      </div>
      <div className="personal-workload">
        <article><span>Active work</span><strong>{active}</strong><small>Incidents needing attention</small></article>
        <article><span>Resolved this month</span><strong>{resolvedThisMonth}</strong><small>Completed by {user?.name || 'you'}</small></article>
        <article><span>Assigned total</span><strong>{incidents.length}</strong><small>Visible incident history</small></article>
      </div>
    </section>;
  }

  const members = buildMemberSummary(users, incidents);
  const groupSummary = buildGroupSummary(groups, members, incidents);

  return <section className="people-analytics" aria-label="Group and member analytics">
    <div className="people-analytics__heading">
      <div><span className="section-eyebrow">People analytics</span><h2>Group and member workload</h2></div>
      <p>Live assignments and resolutions from the incident workspace.</p>
    </div>
    <div className="people-analytics__grid">
      <article className="people-panel">
        <div className="people-panel__head"><div><Icon name="team" size={18} /><div><h3>Group summary</h3><p>Capacity and active response work</p></div></div><span>{groupSummary.length}</span></div>
        <div className="people-list">
          {groupSummary.length === 0 ? <p className="people-empty">No groups or members yet.</p> : groupSummary.map(group => <div className="group-analytics-row" key={group.id}>
            <div><b>{group.name}</b><small>{group.members.length} {group.members.length === 1 ? 'member' : 'members'}</small></div>
            <div className="group-analytics-row__metrics"><span><b>{group.active}</b> active</span><span><b>{group.resolvedThisMonth}</b> resolved</span></div>
          </div>)}
        </div>
      </article>
      <article className="people-panel">
        <div className="people-panel__head"><div><Icon name="team" size={18} /><div><h3>Member workload</h3><p>Sorted by active assignment load</p></div></div><span>{members.length}</span></div>
        <div className="people-list">
          {members.length === 0 ? <p className="people-empty">No team members yet.</p> : members.map(member => <div className="member-analytics-row" key={member.id}>
            <div className="member-analytics-row__identity"><span>{member.name?.slice(0, 1).toUpperCase()}</span><div><b>{member.name}</b><small>{roleLabel(member.role)} · {member.group?.name || 'No group'}</small></div></div>
            <div className="member-analytics-row__metrics"><span><b>{member.active}</b><small>Active</small></span><span><b>{member.resolvedThisMonth}</b><small>Resolved</small></span></div>
          </div>)}
        </div>
      </article>
    </div>
  </section>;
}
