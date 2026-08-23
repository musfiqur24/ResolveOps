import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { roleLabel, roleOptions } from '../utils/roles.js';

export default function Team() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin';
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: 'hello123', role: 'frontend_engineer', group: '', isOnCall: false });
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);

  async function load() {
    const [usersResponse, groupsResponse] = await Promise.all([api.get('/auth/users'), api.get('/groups')]);
    setUsers(usersResponse.data.users);
    setGroups(groupsResponse.data.groups);
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post('/auth/users', form);
      showToast('User added successfully.', 'success');
      setForm({ ...form, name: '', email: '', group: '' });
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Only admin can add users.', 'error');
    }
  }

  async function deleteUser() {
    if (!pendingDeleteUser) return;
    try {
      const res = await api.delete(`/auth/users/${pendingDeleteUser.id}`);
      showToast(res.data.message || 'User removed.', 'success');
      setPendingDeleteUser(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete this user.', 'error');
    }
  }

  async function toggleOnCall(member) {
    try {
      await api.patch('/auth/users/' + member.id, { isOnCall: !member.isOnCall });
      showToast(member.name + (member.isOnCall ? ' moved to backup.' : ' is now on call.'), 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to update on-call status.', 'error');
    }
  }

  return <section>
    <div className={`team-grid ${isAdmin ? '' : 'team-grid--single'}`}>
      <div className="panel">
        <h2>On-Call Roster</h2>
        {users.map(u => <div className="user-row" key={u.id}>
          <div><b>{u.name}</b><span>{u.email} · {u.group?.name || 'No group'} · {roleLabel(u.role)}</span></div>
          <div className="roster-actions">
            {isAdmin ? <button className={'roster-toggle ' + (u.isOnCall ? 'oncall' : 'offcall')} type="button" onClick={() => toggleOnCall(u)} title="Change on-call status">{u.isOnCall ? 'ON CALL' : 'BACKUP'}</button> : <span className={u.isOnCall ? 'oncall' : 'offcall'}>{u.isOnCall ? 'ON CALL' : 'BACKUP'}</span>}
            {isAdmin && user?.id !== u.id && <button className="danger-mini" onClick={() => setPendingDeleteUser(u)}>Delete</button>}
          </div>
        </div>)}
      </div>
      {isAdmin && <form className="panel" onSubmit={submit}><h2>Add team member</h2><p className="muted">Create a role-based account and assign it to a group.</p>
        <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
        <label>Email<input type="email" pattern="[^\\s@]+@[^\\s@]+\\.com" title="Enter an email ending in .com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
        <label>Password<input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></label>
        <div className="grid2"><label>Role<select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>{roleOptions.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label><label>Group<select value={form.group} onChange={e => setForm({ ...form, group: e.target.value })}><option value="">No group</option>{groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label></div>
        <label className="check"><input type="checkbox" checked={form.isOnCall} onChange={e => setForm({ ...form, isOnCall: e.target.checked })} /> On-call now</label>
        <button className="primary">Add User</button>
      </form>}
    </div>

    {pendingDeleteUser && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-user-title">
      <div className="confirm-modal">
        <h3 id="delete-user-title">Delete user?</h3>
        <p>Remove <b>{pendingDeleteUser.name}</b> from the roster? Assigned incidents will become unassigned.</p>
        <div className="modal-actions">
          <button className="ghost" type="button" onClick={() => setPendingDeleteUser(null)}>Cancel</button>
          <button className="danger-btn" type="button" onClick={deleteUser}>Delete User</button>
        </div>
      </div>
    </div>}
  </section>;
}
