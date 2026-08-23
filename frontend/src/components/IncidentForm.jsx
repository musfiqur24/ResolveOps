import { useRef, useState } from 'react';
import api from '../services/api';

export default function IncidentForm({ users, onClose, onSaved, initial }) {
  const [form, setForm] = useState(initial || { title: '', service: '', description: '', severity: 'low', assignedTo: '', impact: '' });
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const imageInputRef = useRef(null);
  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  async function submit(e) {
    e.preventDefault(); setError('');
    try {
      const response = initial?._id
        ? await api.patch(`/incidents/${initial._id}`, form)
        : await api.post('/incidents', form);
      const incidentId = response.data.incident._id;
      if (imageFile) {
        const imageData = new FormData();
        imageData.append('image', imageFile);
        await api.post('/incidents/' + incidentId + '/image', imageData);
      }
      onSaved();
    } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
  }
  return <div className="modal-backdrop"><form className="modal" onSubmit={submit}>
    <div className="modal-head"><h2>{initial ? 'Update Incident' : 'Create Incident'}</h2><button type="button" onClick={onClose}>✕</button></div>
    {error && <div className="error">{error}</div>}
    <label>Title<input value={form.title} onChange={e => set('title', e.target.value)} required /></label>
    <label>Service<input value={form.service} onChange={e => set('service', e.target.value)} placeholder="payment-api, worker, db..." required /></label>
    <label>Description<textarea value={form.description} onChange={e => set('description', e.target.value)} required /></label>
    <label>Impact<textarea value={form.impact || ''} onChange={e => set('impact', e.target.value)} /></label>
    <label>Incident image <span className="field-help">Optional, one image up to 5 MB</span><input ref={imageInputRef} type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} /></label>
    {imageFile && <div className="selected-file"><span>Selected: {imageFile.name}</span><button type="button" className="clear-file" onClick={() => { setImageFile(null); if (imageInputRef.current) imageInputRef.current.value = ''; }}>Remove image</button></div>}
    <div className="grid2"><label>Severity<select value={form.severity} onChange={e => set('severity', e.target.value)}><option>low</option><option>medium</option><option>high</option><option>critical</option></select></label>
    <label>Assign Engineer<select value={form.assignedTo || ''} onChange={e => set('assignedTo', e.target.value)}><option value="">Unassigned</option>{users.map(u => <option key={u.id} value={u.id}>{u.name} {u.isOnCall ? '(on-call)' : ''}</option>)}</select></label></div>
    <button className="primary">Save Incident</button>
  </form></div>;
}
