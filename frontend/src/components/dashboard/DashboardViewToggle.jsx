import Icon from '../ui/Icon.jsx';

export default function DashboardViewToggle({ value, onChange }) {
  return <div className="view-toggle" aria-label="Dashboard view">
    <button
      aria-pressed={value === 'table'}
      className={value === 'table' ? 'active' : ''}
      type="button"
      onClick={() => onChange('table')}
    >
      <Icon name="table" size={15} />
      <span>Table</span>
    </button>
    <button
      aria-pressed={value === 'board'}
      className={value === 'board' ? 'active' : ''}
      type="button"
      onClick={() => onChange('board')}
    >
      <Icon name="board" size={15} />
      <span>Board</span>
    </button>
  </div>;
}
