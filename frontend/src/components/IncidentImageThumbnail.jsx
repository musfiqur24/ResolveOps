import { useEffect, useState } from 'react';
import api from '../services/api';
import Icon from './ui/Icon.jsx';

export default function IncidentImageThumbnail({ incident }) {
  const [src, setSrc] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!incident?.image?.filename) return undefined;
    let objectUrl = '';
    api.get('/incidents/' + incident._id + '/image', { responseType: 'blob' })
      .then(response => {
        objectUrl = URL.createObjectURL(response.data);
        setSrc(objectUrl);
      })
      .catch(() => setSrc(''));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [incident?._id, incident?.image?.filename]);

  if (!incident?.image?.filename || !src) return <span className="incident-thumbnail--empty">—</span>;
  return <>
    <button className="incident-thumbnail" type="button" onClick={() => setOpen(true)} aria-label={'View image for ' + incident.title}>
      <img src={src} alt="" />
    </button>
    {open && <div className="image-preview-backdrop" role="dialog" aria-modal="true" aria-label={'Image for ' + incident.title} onClick={() => setOpen(false)}>
      <div className="image-preview-modal" onClick={event => event.stopPropagation()}>
        <div><b>{incident.title}</b><button type="button" onClick={() => setOpen(false)} aria-label="Close image preview"><Icon name="close" size={18} /></button></div>
        <img src={src} alt={'Attachment for ' + incident.title} />
      </div>
    </div>}
  </>;
}
