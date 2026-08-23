import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import api from '../services/api';
import IncidentForm from '../components/IncidentForm.jsx';
import IncidentImage from '../components/IncidentImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [incident, setIncident] = useState(null);
  const [users, setUsers] = useState([]);
  const [comment, setComment] = useState('');
  const [mentionState, setMentionState] = useState({ open: false, query: '', start: -1, end: -1, activeIndex: 0 });
  const commentInputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [post, setPost] = useState({ rootCause: '', resolution: '', actionItemsText: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = user?.role === 'admin';

  async function load() {
    setError('');
    try {
      const [i, u] = await Promise.all([api.get(`/incidents/${id}`), api.get('/auth/users')]);
      setIncident(i.data.incident); setUsers(u.data.users);
      setPost({ rootCause: i.data.incident.rootCause || '', resolution: i.data.incident.resolution || '', actionItemsText: (i.data.incident.actionItems || []).map(a => a.text).join('\n') });
    } catch (err) {
      setError(err.response?.data?.message || 'This incident is unavailable.');
    }
  }
  useEffect(() => { load(); }, [id]);

  const mentionMatches = useMemo(() => {
    if (!mentionState.open) return [];
    const q = mentionState.query.toLowerCase();
    return users
      .filter(u => (u.name + ' ' + u.email + ' ' + (u.group?.name || '') + ' ' + (u.role || '')).toLowerCase().includes(q))
      .slice(0, 8);
  }, [mentionState, users]);

  if (error) return <section className="empty-board detail-empty">
    <h2>{error}</h2>
    <p>This incident may not be assigned to you, or it may no longer exist.</p>
    <Link to="/" className="ghost">Return to dashboard</Link>
  </section>;
  if (!incident) return <div className="loading">Loading incident...</div>;

  function detectMention(value, cursorPosition) {
    const left = value.slice(0, cursorPosition);
    const match = left.match(/(^|\s)@([\w.-]*)$/);
    if (!match) {
      setMentionState(prev => ({ ...prev, open: false, query: '', start: -1, end: -1, activeIndex: 0 }));
      return;
    }
    const query = match[2] || '';
    const start = cursorPosition - query.length - 1;
    setMentionState({ open: true, query, start, end: cursorPosition, activeIndex: 0 });
  }

  function handleCommentChange(e) {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || value.length;
    setComment(value);
    detectMention(value, cursorPosition);
  }

  function handleCommentClick(e) {
    detectMention(e.target.value, e.target.selectionStart || e.target.value.length);
  }

  function selectMention(selectedUser) {
    const mentionText = `@${selectedUser.email} `;
    const before = comment.slice(0, mentionState.start);
    const after = comment.slice(mentionState.end);
    const next = `${before}${mentionText}${after}`;
    const nextCursor = before.length + mentionText.length;
    setComment(next);
    setMentionState(prev => ({ ...prev, open: false, query: '', start: -1, end: -1, activeIndex: 0 }));
    window.requestAnimationFrame(() => {
      commentInputRef.current?.focus();
      commentInputRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleCommentKeyDown(e) {
    if (!mentionState.open || !mentionMatches.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionState(prev => ({ ...prev, activeIndex: (prev.activeIndex + 1) % mentionMatches.length }));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionState(prev => ({ ...prev, activeIndex: (prev.activeIndex - 1 + mentionMatches.length) % mentionMatches.length }));
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      selectMention(mentionMatches[mentionState.activeIndex] || mentionMatches[0]);
    }
    if (e.key === 'Escape') {
      setMentionState(prev => ({ ...prev, open: false, activeIndex: 0 }));
    }
  }

  async function updateField(field, value) {
    try {
      await api.patch(`/incidents/${id}`, { [field]: value });
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to update this incident.', 'error');
    }
  }
  function confirmStatusChange(nextStatus) {
    if (nextStatus === incident.status) return;
    if (!window.confirm('Change this incident status to ' + nextStatus + '?')) return;
    updateField('status', nextStatus);
  }
  async function addComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    await api.post(`/incidents/${id}/comments`, { message: comment });
    setComment('');
    setMentionState(prev => ({ ...prev, open: false, query: '', start: -1, end: -1, activeIndex: 0 }));
    showToast('Timeline comment added. Mentioned users will be notified.', 'success');
    load();
  }
  async function deleteIncident() {
    try {
      await api.delete(`/incidents/${id}`);
      showToast('Incident deleted successfully.', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete this incident.', 'error');
    } finally {
      setDeleteConfirmOpen(false);
    }
  }

  async function savePostmortem() {
    try {
      const actionItems = post.actionItemsText.split('\n').filter(Boolean).map(text => ({ text, owner: incident.assignedTo?.name || 'TBD' }));
      await api.patch(`/incidents/${id}`, { rootCause: post.rootCause, resolution: post.resolution, actionItems });
      await api.post(`/incidents/${id}/comments`, { message: 'Postmortem updated.' });
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to save the postmortem.', 'error');
    }
  }
  function exportPDF() {
    const doc = new jsPDF();
    const lines = [
      `Postmortem: ${incident.title}`,
      `Service: ${incident.service}`,
      `Severity: ${incident.severity}`,
      `Status: ${incident.status}`,
      `Owner: ${incident.assignedTo?.name || 'Unassigned'}`,
      `MTTR: ${incident.mttrMinutes ?? 'N/A'} minutes`,
      '', 'Impact:', incident.impact || 'N/A', '', 'Root Cause:', post.rootCause || 'N/A', '', 'Resolution:', post.resolution || 'N/A', '', 'Action Items:', post.actionItemsText || 'N/A'
    ];
    doc.setFontSize(16); doc.text('ResolveOps - Incident Report', 14, 18);
    doc.setFontSize(10); doc.text(lines, 14, 32, { maxWidth: 180 });
    doc.save(`postmortem-${incident._id}.pdf`);
  }

  return <section className="detail">
    <Link to="/incidents" className="back">← Incidents</Link>
    <div className="detail-hero">
      <div><span className={`badge sev-${incident.severity}`}>{incident.severity}</span><h2>{incident.title}</h2><p>{incident.description}</p></div>
      <div className="detail-actions">
        {isAdmin && <button className="cyan-pill" onClick={() => setEditing(true)}>Edit incident</button>}
        {isAdmin && <button className="danger-btn" onClick={() => setDeleteConfirmOpen(true)}>Delete incident</button>}
      </div>
    </div>
    <IncidentImage incident={incident} />
    {editing && isAdmin && <IncidentForm users={users} initial={incident} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); navigate('/incidents/' + id, { replace: true }); load(); }} />}
    {deleteConfirmOpen && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-incident-title">
      <div className="confirm-modal">
        <h3 id="delete-incident-title">Delete incident?</h3>
        <p>This will permanently delete <b>{incident.title}</b>. This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="ghost" type="button" onClick={() => setDeleteConfirmOpen(false)}>Cancel</button>
          <button className="danger-btn" type="button" onClick={deleteIncident}>Delete Incident</button>
        </div>
      </div>
    </div>}

    <div className="detail-grid">
      <div className="panel">
        <h3>Incident Controls</h3>
        <label>Status<select value={incident.status} onChange={e => confirmStatusChange(e.target.value)}><option>open</option><option>investigating</option><option>resolved</option></select></label>
        {isAdmin ? <label>Assigned member<select value={incident.assignedTo?.id || incident.assignedTo?._id || ''} onChange={e => updateField('assignedTo', e.target.value)}><option value="">Unassigned</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label> : <div className="assignment-summary"><span>Assigned member</span><b>{incident.assignedTo?.name || 'Unassigned'}</b></div>}
        <div className="mini-stats"><div><span>Service</span><b>{incident.service}</b></div><div><span>MTTR</span><b>{incident.mttrMinutes ?? '—'}m</b></div></div>
      </div>
      <div className="panel">
        <h3>Postmortem</h3>
        {isAdmin ? <>
          <label>Root Cause<textarea value={post.rootCause} onChange={e => setPost({ ...post, rootCause: e.target.value })} /></label>
          <label>Resolution<textarea value={post.resolution} onChange={e => setPost({ ...post, resolution: e.target.value })} /></label>
          <label>Action Items<textarea value={post.actionItemsText} onChange={e => setPost({ ...post, actionItemsText: e.target.value })} placeholder="One item per line" /></label>
          <div className="action-row"><button className="primary" onClick={savePostmortem}>Save Postmortem</button><button className="ghost" onClick={exportPDF}>Export PDF</button></div>
        </> : <div className="read-only-postmortem">
          <div><span>Root cause</span><p>{incident.rootCause || 'Not recorded yet.'}</p></div>
          <div><span>Resolution</span><p>{incident.resolution || 'Not recorded yet.'}</p></div>
          <div><span>Action items</span>{incident.actionItems?.length ? <ul className="action-items-list">{incident.actionItems.map((item, index) => <li key={item._id || index}>{item.text}</li>)}</ul> : <p>No action items recorded yet.</p>}</div>
          <button className="ghost" onClick={exportPDF}>Export PDF</button>
        </div>}
      </div>
    </div>
    <div className="panel timeline-panel">
      <h3>Timeline Comments</h3>
      <form className="comment-form" onSubmit={addComment}>
        <div className="mention-input-wrap">
          <input
            ref={commentInputRef}
            value={comment}
            onChange={handleCommentChange}
            onClick={handleCommentClick}
            onKeyDown={handleCommentKeyDown}
            placeholder="Add investigation update... type @ to mention any user"
            autoComplete="off"
          />
          {mentionState.open && (
            <div className="mention-popover">
              <div className="mention-popover-title">Select a teammate</div>
              {mentionMatches.length ? mentionMatches.map((u, index) => (
                <button
                  type="button"
                  key={u.id}
                  className={`mention-option ${index === mentionState.activeIndex ? 'active' : ''}`}
                  onMouseDown={(event) => { event.preventDefault(); selectMention(u); }}
                  onMouseEnter={() => setMentionState(prev => ({ ...prev, activeIndex: index }))}
                >
                  <span className="mention-avatar">{u.name.slice(0, 1).toUpperCase()}</span>
                  <span><b>{u.name}</b><small>{u.email} · {u.group?.name || 'No group'} · {u.role?.replaceAll('_', ' ') || 'Team member'}</small></span>
                </button>
              )) : <div className="mention-empty">No user found.</div>}
            </div>
          )}
        </div>
        <button className="cyan-pill">Send</button>
      </form>
      <div className="mention-helper">
        <span>Tip:</span>
        <span>Type <b>@</b> in the comment box to search and select any user.</span>
      </div>
      <div className="timeline">{[...(incident.timeline || [])].reverse().map(item => <div className="timeline-item" key={item._id}><span>{item.type}</span><p>{item.message}</p><small>{item.author?.name || 'System'} · {new Date(item.createdAt).toLocaleString()}</small></div>)}</div>
    </div>
  </section>;
}
