import { useState } from 'react';

const fmt = (val) =>
  Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function Badge({ children, variant = 'info' }) {
  const styles = {
    info:    { background: '#e8f0fe', color: '#1a56db' },
    success: { background: '#def7ec', color: '#03543f' },
    warning: { background: '#fdf6b2', color: '#723b13' },
    neutral: { background: '#f3f4f6', color: '#374151' },
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
      {label}: <strong style={{ color: '#111827', fontWeight: 500 }}>{value}</strong>
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{
      background: '#f9fafb', borderRadius: 8,
      padding: '8px 10px',
    }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{value}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 500, color: '#9ca3af',
      textTransform: 'uppercase', letterSpacing: '0.06em',
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

export default function KitComposition() {
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
      const res = await fetch(`/api/kit/${encodeURIComponent(skuTrimmed)}`);
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
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 720, margin: '0 auto', padding: '1.5rem' }}>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscar()}
          placeholder="SKU / partnerId (ex: 130502)"
          style={{
            flex: 1, padding: '8px 12px', fontSize: 14,
            border: '1px solid #d1d5db', borderRadius: 8, outline: 'none',
          }}
        />
        <button
          onClick={buscar}
          disabled={loading}
          style={{
            padding: '8px 16px', fontSize: 14, fontWeight: 500,
            background: loading ? '#e5e7eb' : '#1d4ed8',
            color: loading ? '#9ca3af' : '#fff',
            border: 'none', borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Consultando...' : 'Consultar kit'}
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5',
          borderRadius: 8, padding: '12px 16px',
          color: '#991b1b', fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {data && (
        <div>
          <SectionLabel>Produto</SectionLabel>
          <div style={{
            background: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 12,
          }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 8, lineHeight: 1.4 }}>
              {data.title}
              <Badge variant="info">{data.type}</Badge>
              {data.isProductActive && <Badge variant="success">ativo</Badge>}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <MetaItem label="ID" value={data.id} />
              {data.sku?.partnerId && <MetaItem label="SKU" value={data.sku.partnerId} />}
              {data.sku?.ean && <MetaItem label="EAN" value={data.sku.ean} />}
              {data.brand && <MetaItem label="Marca" value={data.brand} />}
              {data.category && <MetaItem label="Categoria" value={data.category} />}
            </div>
          </div>

          {data.sku && (
            <>
              <SectionLabel>SKU principal</SectionLabel>
              <div style={{
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 16,
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 8,
              }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <MetaItem label="ID SKU" value={data.sku.id} />
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
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '4px 0 16px' }} />
              <SectionLabel>
                Composição do kit — {data.kitComponents.length}{' '}
                {data.kitComponents.length === 1 ? 'componente' : 'componentes'}
              </SectionLabel>

              {data.kitComponents.map((comp) => (
                <div
                  key={comp.idSku}
                  style={{
                    background: '#fff', border: '1px solid #e5e7eb',
                    borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 10 }}>
                    {comp.name}
                    {comp.isMainComponent && <Badge variant="warning">principal</Badge>}
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                    gap: 8,
                  }}>
                    <StatCard label="SKU (idInClient)" value={comp.idInClient} />
                    <StatCard label="ID SKU" value={comp.idSku} />
                    <StatCard label="Quantidade" value={comp.quantity} />
                    <StatCard label="% no kit" value={`${comp.percentage}%`} />
                    <StatCard label="Preço unit." value={fmt(comp.price)} />
                    <StatCard label="Subtotal" value={fmt(comp.subtotal)} />
                  </div>
                </div>
              ))}

              <div style={{
                background: '#f9fafb', border: '1px solid #e5e7eb',
                borderRadius: 8, padding: '12px 16px', marginTop: 4,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Custo total de composição</span>
                <span style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>
                  {fmt(data.totalKitCost)}
                </span>
              </div>
            </>
          )}

          {data.type !== 'KIT' && (
            <div style={{
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 8, padding: '12px 16px',
              color: '#1e40af', fontSize: 14,
            }}>
              Este produto não é do tipo KIT — não possui composição.
            </div>
          )}
        </div>
      )}
    </div>
  );
}