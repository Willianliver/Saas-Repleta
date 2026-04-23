import { useNavigate } from 'react-router-dom';

const MODULES = [
  {
    to: '/kit',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'Consulta Kit',
    description: 'Busque produtos por SKU ou ID do hub. Visualize composição de kits, preços e componentes.',
    accent: '#3b5bdb',
    accentBg: 'rgba(59,91,219,0.1)',
  },
  {
    to: '/clonagem',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="8" width="13" height="13" rx="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </svg>
    ),
    title: 'Clonagem',
    description: 'Duplique produtos simples ou com variações. Novos SKUs e EANs definidos manualmente.',
    accent: '#d97706',
    accentBg: 'rgba(217,119,6,0.1)',
  },
  {
    to: '/caracteristicas',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
    title: 'Características',
    description: 'Copie características entre produtos unitariamente ou em lote, com filtro por palavras-chave.',
    accent: '#7c3aed',
    accentBg: 'rgba(124,58,237,0.1)',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: '#f1f5f9', margin: 0, lineHeight: 1.3 }}>
          Painel de operações
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6, marginBottom: 0 }}>
          Gerencie produtos, planilhas e clonagens integradas ao AnyMarket e Bling.
        </p>
      </div>

      {/* Cards dos módulos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40 }}>
        {MODULES.map(({ to, icon, title, description, accent, accentBg }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            style={{
              background: '#15171f',
              border: '1px solid #1e2130',
              borderRadius: 14,
              padding: '20px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'border-color 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = accent;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#1e2130';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: accentBg,
              color: accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              {icon}
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#f1f5f9', marginBottom: 6 }}>
              {title}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
              {description}
            </div>
          </button>
        ))}
      </div>

      {/* Info de integrações */}
      <div style={{
        background: '#15171f',
        border: '1px solid #1e2130',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#22c55e',
          flexShrink: 0,
          boxShadow: '0 0 6px #22c55e',
        }} />
        <div style={{ fontSize: 13, color: '#9ca3af' }}>
          Conectado a <strong style={{ color: '#d1d5db' }}>AnyMarket</strong> · <strong style={{ color: '#d1d5db' }}>Bling ERP</strong> · <strong style={{ color: '#d1d5db' }}>Mercado Livre</strong>
        </div>
      </div>
    </div>
  );
}