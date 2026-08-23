import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Icon from './ui/Icon.jsx';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  async function load() { const res = await api.get('/notifications'); setItems(res.data.notifications || []); }
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);
  const unread = items.filter(i => !i.read).length;
  async function openNotification(note) {
    setActive(active?._id === note._id ? null : note);
  }
  async function markUnreadAsRead() {
    const unreadItems = items.filter(item => !item.read);
    if (!unreadItems.length) return;

    setItems(currentItems => currentItems.map(item => ({ ...item, read: true })));
    try {
      await Promise.all(unreadItems.map(item => api.patch('/notifications/' + item._id + '/read')));
    } catch {
      load();
    }
  }
  async function toggleMenu() {
    const shouldOpen = !open;
    setOpen(shouldOpen);
    if (shouldOpen) {
      setActive(null);
      await markUnreadAsRead();
    }
  }
  return <div className="notify">
    <button
      aria-expanded={open}
      aria-label={unread ? unread + ' unread notifications' : 'Notifications'}
      className="notify-btn"
      type="button"
      onClick={toggleMenu}
    >
      <Icon name="bell" size={18} />
      {unread > 0 && <span className="notify-count">{unread}</span>}
    </button>
    {open && <div className="notify-menu">
      <h3>Notifications</h3>
      {items.length === 0 && <p className="muted">No notifications yet.</p>}
      {items.map(n => <div className={`note ${n.read ? '' : 'unread'}`} key={n._id} onClick={() => openNotification(n)}>
        <b>{n.title}</b><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString()}</small>
        {active?._id === n._id && <div className="note-detail" onClick={e => e.stopPropagation()}>
          <strong>Notification Details</strong>
          <p>{n.message}</p>
          {n.incident && <Link to={`/incidents/${n.incident._id}`} onClick={() => setOpen(false)}>Open related incident →</Link>}
        </div>}
      </div>)}
    </div>}
  </div>;
}
