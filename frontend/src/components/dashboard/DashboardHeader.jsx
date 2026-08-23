import Icon from '../ui/Icon.jsx';

export default function DashboardHeader({
  description,
  isAdmin,
  onCreate,
  title = 'Dashboard'
}) {
  const defaultDescription = isAdmin
    ? 'Monitor every incident, keep ownership clear, and guide response.'
    : 'Stay focused on the incidents assigned to you.';

  return <header className="dashboard-page-header">
    <div>
      <span className="page-eyebrow">Incident operations</span>
      <h1>{title}</h1>
      <p>{description || defaultDescription}</p>
    </div>
    <div className="dashboard-page-header__actions">
      <span className={'scope-chip ' + (isAdmin ? 'scope-chip--admin' : '')}>
        {isAdmin ? 'All incidents' : 'My assigned work'}
      </span>
      {isAdmin && <button className="primary-action" type="button" onClick={onCreate}>
        <Icon name="plus" size={17} />
        <span>Declare new incident</span>
      </button>}
    </div>
  </header>;
}
