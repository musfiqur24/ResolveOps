import { useEffect, useState } from 'react';
import api from '../services/api';

export default function IncidentImage({ incident }) {
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!incident?.image?.filename) return undefined;
    let objectUrl = '';
    api.get('/incidents/' + incident._id + '/image', { responseType: 'blob' })
      .then(response => {
        objectUrl = URL.createObjectURL(response.data);
        setSrc(objectUrl);
      })
      .catch(() => setError('Unable to load the incident image.'));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [incident?._id, incident?.image?.filename]);

  if (!incident?.image?.filename) return null;
  return <section className="incident-image-panel">
    <div><span>Incident image</span><p>{incident.image.originalName || 'Attached image'}</p></div>
    {src ? <img src={src} alt={'Attachment for ' + incident.title} /> : <p className="muted">{error || 'Loading image...'}</p>}
  </section>;
}
