import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  {
    to: '/',
    end: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    label: 'Home',
  },
  {
    to: '/kit',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    label: 'Consulta Kit',
  },
 /* {
    to: '/planilhas',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18" />
      </svg>
    ),
    label: 'Planilhas',
  },*/
  {
    to: '/clonagem',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="8" width="13" height="13" rx="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </svg>
    ),
    label: 'Clonagem',
  },
{
    to: '/caracteristicas',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
    label: 'Características',
  },
];

export default function MainLayout() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0f1117',
      fontFamily: "'DM Sans', 'Inter', sans-serif",
    }}>

      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: '#15171f',
        borderRight: '1px solid #1e2130',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>

        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #1e2130',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #3b5bdb, #1971c2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.2 }}>Hub Manager</div>
              <div style={{ fontSize: 10, color: '#4b5563', marginTop: 1 }}>AnyMarket · Bling</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 6 }}>
            Menu
          </div>
          {NAV_ITEMS.map(({ to, end, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#93c5fd' : '#6b7280',
                background: isActive ? 'rgba(59,91,219,0.12)' : 'transparent',
                textDecoration: 'none',
                marginBottom: 2,
                transition: 'all 0.15s',
              })}
            >
              <span style={{ opacity: 0.85, flexShrink: 0 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Rodapé da sidebar */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e2130' }}>
          <div style={{ fontSize: 11, color: '#374151' }}>v1.0 · SaaS</div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
        <Outlet />
      </main>
    </div>
  );
}