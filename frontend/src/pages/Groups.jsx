import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Icon from '../components/ui/Icon.jsx';

export default function Groups() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin';
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });

  async function load() {
    try {
      const res = await api.get('/groups');
      setGroups(res.data.groups);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to load groups.', 'error');
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/groups', form);
      setForm({ name: '', description: '' });
      showToast('Group created successfully.', 'success');
      load();
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to create group.', 'error');
    }
  }

  async function remove(group) {
    if (!window.confirm('Delete ' + group.name + '?')) return;
    try {
      const res = await api.delete('/groups/' + group.id);
      showToast(res.data.message || 'Group deleted.', 'success');
      load();
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to delete group.', 'error');
    }
  }

  return <section className="groups-page">
    <header className="page-heading">
      <span>Incident operations</span>
      <h1>Groups</h1>
      <p>Organize your response team with database-backed groups.</p>
    </header>
    <div className={'team-grid ' + (isAdmin ? '' : 'team-grid--single')}>
      <div className="panel">
        <div className="panel-heading"><div><h2>Response groups</h2><p className="muted">Groups are shared across the workspace.</p></div><span className="count-pill">{groups.length}</span></div>
        {groups.length === 0 ? <div className="empty-panel"><Icon name="team" size={22} /><b>No groups yet</b><span>Create the first group to organize new members.</span></div> : groups.map(group => <div className="group-row" key={group.id}>
          <div><b>{group.name}</b><span>{group.description || 'No description provided.'}</span></div>
          <div className="group-row__meta"><span>{group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}</span>{isAdmin && <button className="danger-mini" type="button" onClick={() => remove(group)}>Delete</button>}</div>
        </div>)}
      </div>
      {isAdmin && <form className="panel" onSubmit={submit}>
        <h2>Create group</h2>
        <p className="muted">Add a group, then select it when creating team members.</p>
        <label>Name<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Platform" required /></label>
        <label>Description<textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="What does this group own?" rows="4" /></label>
        <button className="primary">Create group</button>
      </form>}
    </div>
  </section>;
}
