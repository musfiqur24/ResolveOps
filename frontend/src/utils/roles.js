export const roleOptions = [
  { value: 'frontend_engineer', label: 'Frontend Engineer' },
  { value: 'backend_engineer', label: 'Backend Engineer' },
  { value: 'devops_engineer', label: 'DevOps Engineer' },
  { value: 'software_architect', label: 'Software Architect' },
  { value: 'database_engineer', label: 'Database Engineer' },
  { value: 'admin', label: 'Administrator' }
];

export function roleLabel(role) {
  return roleOptions.find(option => option.value === role)?.label || 'Team member';
}
