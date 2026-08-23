const paths = {
  grid: <>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </>,
  team: <>
    <path d="M16 20v-1.8a3.7 3.7 0 0 0-3.7-3.7H6.7A3.7 3.7 0 0 0 3 18.2V20" />
    <circle cx="9.5" cy="7.5" r="3.5" />
    <path d="M21 20v-1.7a3.7 3.7 0 0 0-2.8-3.6M16.5 4.2a3.5 3.5 0 0 1 0 6.6" />
  </>,
  bell: <>
    <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M10 22h4" />
  </>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </>,
  filter: <path d="M4 5h16M7 12h10M10 19h4" />,
  table: <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M9 10v10M15 10v10" />
  </>,
  board: <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16M15 4v16" />
  </>,
  clock: <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5l3.5 2" />
  </>,
  check: <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.3 12.1 2.4 2.4 5-5" />
  </>,
  alert: <>
    <path d="m12 3 9 16H3L12 3Z" />
    <path d="M12 9v4M12 16h.01" />
  </>,
  trend: <>
    <path d="m4 16 5-5 3 3 7-8" />
    <path d="M14 6h5v5" />
  </>,
  arrow: <>
    <path d="M5 12h13M13 6l6 6-6 6" />
  </>,
  logout: <>
    <path d="M10 17l5-5-5-5M15 12H3" />
    <path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
  </>,
  chevron: <path d="m7 10 5 5 5-5" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  empty: <>
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <path d="M8 12h8M12 8v8" />
  </>,
  more: <>
    <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
  </>
};

export default function Icon({ name, size = 18, className = '', title }) {
  return <svg
    aria-hidden={title ? undefined : true}
    aria-label={title}
    className={className}
    fill="none"
    height={size}
    role={title ? 'img' : undefined}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
    width={size}
  >
    {paths[name] || paths.grid}
  </svg>;
}
