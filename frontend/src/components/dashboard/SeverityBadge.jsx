export default function SeverityBadge({ severity }) {
  return <span className={'severity-badge severity-badge--' + severity}>{severity || 'low'}</span>;
}
