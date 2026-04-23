import { useState } from 'react';
import { api } from '../services/api';

const fmt = (val) =>
  Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function Badge({ children, variant = 'info' }) {
  const styles = {
    info:    { background: 'rgba(59,91,219,0.15)', color: '#93c5fd' },
    success: { background: 'rgba(34,197,94,0.12)', color: '#4ade80' },
    warning: { background: 'rgba(234,179,8,0.12)', color: '#fbbf24' },
    neutral: { background: 'rgba(107,114,128,0.2)', color: '#9ca3af' },
  };
  return (
    <span style={{
      ...styles[variant],
      fontSize: 11, fontWeight: 500,
      padding: '2px 8px', borderRadius: 4,
      marginLeft: 8, display: 'inline-block',
    }}>
      {children}
    </span>
  );
}

function MetaItem({ label, value }) {
  return (
    <span style={{ fontSize: 13, color: '#6b7280' }}>
      {label}: <strong style={{ color: '#d1d5db', fontWeight: 500 }}>{value}</strong>
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: '#0f1117', borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#f1f5f9' }}>{value}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: '#4b5563',
      textTransform: 'uppercase', letterSpacing: '0.06em',
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

export default function Kit() {
  const [sku, setSku] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const buscar = async () => {
    const skuTrimmed = sku.trim();
    if (!skuTrimmed) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await api.get(`/kit/${encodeURIComponent(skuTrimmed)}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Erro desconhecido.');
        return;
      }

      setData(json);
    } catch (e) {
      setError(`Erro de conexão: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720 }}>

      {/* Header da página */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Consulta Kit</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Busque por SKU ou partnerId para visualizar a composição do kit.
        </p>
      </div>

      {/* Input de busca */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscar()}
          placeholder="SKU / partnerId (ex: 130502)"
          style={{
            flex: 1, padding: '9px 14px', fontSize: 14,
            background: '#15171f',
            border: '1px solid #1e2130',
            borderRadius: 8, outline: 'none',
            color: '#f1f5f9',
          }}
          onFocus={e => e.target.style.borderColor = '#3b5bdb'}
          onBlur={e => e.target.style.borderColor = '#1e2130'}
        />
        <button
          onClick={buscar}
          disabled={loading}
          style={{
            padding: '9px 18px', fontSize: 14, fontWeight: 500,
            background: loading ? '#1e2130' : '#3b5bdb',
            color: loading ? '#4b5563' : '#fff',
            border: 'none', borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Consultando...' : 'Consultar kit'}
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 8, padding: '12px 16px',
          color: '#f87171', fontSize: 14, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Resultado */}
      {data && (
        <div>
          <SectionLabel>Produto</SectionLabel>
          <div style={{
            background: '#15171f', border: '1px solid #1e2130',
            borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 12,
          }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.4 }}>
              {data.title}
              <Badge variant="info">{data.type}</Badge>
              {data.isProductActive && <Badge variant="success">ativo</Badge>}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <MetaItem label="ID" value={data.id} />
              {data.sku?.partnerId && <MetaItem label="Código do produto" value={data.sku.partnerId} />}
              {data.sku?.ean && <MetaItem label="EAN" value={data.sku.ean} />}
              {data.brand && <MetaItem label="Marca" value={data.brand} />}
              {data.category && <MetaItem label="Categoria" value={data.category} />}
            </div>
          </div>

          {data.sku && (
            <>
              <SectionLabel>SKU principal</SectionLabel>
              <div style={{
                background: '#15171f', border: '1px solid #1e2130',
                borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 16,
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 8,
              }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <MetaItem label="Código SKU" value={data.sku.id} />
                  <MetaItem label="Preço" value={fmt(data.sku.price)} />
                  <MetaItem label="Estoque local" value={data.sku.stockLocalId} />
                </div>
                <Badge variant={data.sku.active ? 'success' : 'neutral'}>
                  {data.sku.active ? 'ativo' : 'inativo'}
                </Badge>
              </div>
            </>
          )}

          {data.type === 'KIT' && data.kitComponents?.length > 0 && (
            <>
              <hr style={{ border: 'none', borderTop: '1px solid #1e2130', margin: '4px 0 16px' }} />
              <SectionLabel>
                Composição do kit — {data.kitComponents.length}{' '}
                {data.kitComponents.length === 1 ? 'componente' : 'componentes'}
              </SectionLabel>

              {data.kitComponents.map((comp) => (
                <div
                  key={comp.idSku}
                  style={{
                    background: '#15171f', border: '1px solid #1e2130',
                    borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#f1f5f9', marginBottom: 10 }}>
                    {comp.name}
                    {comp.isMainComponent && <Badge variant="warning">principal</Badge>}
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                    gap: 8,
                  }}>
                    <StatCard label="SKU (idNoCliente)" value={comp.idInClient} />
                    <StatCard label="ID SKU" value={comp.idSku} />
                    <StatCard label="quantidade" value={comp.quantity} />
                    <StatCard label="% sem kit" value={`${comp.percentage}%`} />
                    <StatCard label="Preço unitário" value={fmt(comp.price)} />
                    <StatCard label="Subtotal" value={fmt(comp.subtotal)} />
                  </div>
                </div>
              ))}

              <div style={{
                background: '#15171f', border: '1px solid #1e2130',
                borderRadius: 8, padding: '12px 16px', marginTop: 4,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Custo total de composição</span>
                <span style={{ fontSize: 16, fontWeight: 500, color: '#f1f5f9' }}>
                  {fmt(data.totalKitCost)}
                </span>
              </div>
            </>
          )}

          {data.type !== 'KIT' && (
            <div style={{
              background: 'rgba(59,91,219,0.08)',
              border: '1px solid rgba(59,91,219,0.2)',
              borderRadius: 8, padding: '12px 16px',
              color: '#93c5fd', fontSize: 14,
            }}>
              Este produto não é do tipo KIT — não possui composição.
            </div>
          )}
        </div>
      )}
    </div>
  );
}