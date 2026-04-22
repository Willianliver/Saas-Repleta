import { useState, useRef } from 'react';

// ─── helpers ────────────────────────────────────────────────────────────────

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

function Field({ label, hint, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 500,
        color: '#d1d5db', marginBottom: 4,
      }}>
        {label}
        {required && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
        {hint && <span style={{ fontWeight: 400, color: '#4b5563', marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, monospace = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', boxSizing: 'border-box',
        padding: '9px 14px', fontSize: 14,
        background: '#0f1117',
        border: `1px solid ${focused ? '#3b5bdb' : '#1e2130'}`,
        borderRadius: 8, outline: 'none',
        color: '#f1f5f9',
        fontFamily: monospace ? 'monospace' : 'inherit',
        transition: 'border-color 0.15s',
      }}
    />
  );
}

function ResultCard({ label, value, accent = '#3b5bdb' }) {
  return (
    <div style={{
      background: '#0f1117',
      border: `1px solid ${accent}44`,
      borderRadius: 8, padding: '10px 14px',
      display: 'flex', flexDirection: 'column', gap: 3,
    }}>
      <div style={{ fontSize: 11, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#f1f5f9', fontFamily: 'monospace', wordBreak: 'break-all' }}>
        {value ?? '—'}
      </div>
    </div>
  );
}

// ─── aba unitária ────────────────────────────────────────────────────────────
// Rota: POST /anymarket/kit/unitario
// Body: { idProdHub, novoSku, novoEan, skuComposicao } — todos obrigatórios
// Resposta ok:    { mensagem, dados: { ... } }
// Resposta erro:  { erro, detalhe? }

function ClonagemUnitaria() {
  const [form, setForm] = useState({
    idProdHub: '',
    novoSku: '',
    novoEan: '',
    skuComposicao: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

  const set = (field) => (val) => setForm(f => ({ ...f, [field]: val }));

  // Todos os 4 campos são obrigatórios no backend
  const podeClonar =
    form.idProdHub.trim() &&
    form.novoSku.trim() &&
    form.novoEan.trim() &&
    form.skuComposicao.trim();

  const clonar = async () => {
    if (!podeClonar) return;
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const res = await fetch('/anymarket/kit-anymarket/unitario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idProdHub:     form.idProdHub.trim(),
          novoSku:       form.novoSku.trim(),
          novoEan:       form.novoEan.trim(),
          skuComposicao: form.skuComposicao.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // backend retorna { erro, detalhe? }
        setError(json.erro || json.error || 'Erro desconhecido.');
        return;
      }

      // json = { mensagem, dados: { ... } }
      setResultado(json);
    } catch (e) {
      setError(`Erro de conexão: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setForm({ idProdHub: '', novoSku: '', novoEan: '', skuComposicao: '' });
    setResultado(null);
    setError(null);
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 0, marginBottom: 24 }}>
        Duplica um produto existente no hub com novo SKU, EAN e composição. Campos internos são removidos automaticamente.
      </p>

      <div style={{
        background: '#15171f', border: '1px solid #1e2130',
        borderRadius: 14, padding: '24px',
      }}>
        <SectionLabel>Produto de origem</SectionLabel>
        <Field label="ID do produto" hint="(id_prod_hub)" required>
          <Input
            value={form.idProdHub}
            onChange={set('idProdHub')}
            placeholder="ex: 7075393220"
            monospace
          />
        </Field>

        <div style={{ borderTop: '1px solid #1e2130', margin: '20px 0' }} />

        <SectionLabel>Dados do clone</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Novo SKU" required>
            <Input
              value={form.novoSku}
              onChange={set('novoSku')}
              placeholder="ex: 130502-KIT"
              monospace
            />
          </Field>
          <Field label="Novo EAN" required>
            <Input
              value={form.novoEan}
              onChange={set('novoEan')}
              placeholder="ex: 7891904502999"
              monospace
            />
          </Field>
        </div>

        <Field label="SKU da composição" required>
          <Input
            value={form.skuComposicao}
            onChange={set('skuComposicao')}
            placeholder="ex: 130001GEN"
            monospace
          />
        </Field>

        {/* Aviso campos obrigatórios */}
        <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 16 }}>
          <span style={{ color: '#f87171' }}>*</span> Todos os campos são obrigatórios
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={clonar}
            disabled={!podeClonar || loading}
            style={{
              padding: '9px 20px', fontSize: 14, fontWeight: 500,
              background: !podeClonar || loading ? '#1e2130' : '#3b5bdb',
              color: !podeClonar || loading ? '#4b5563' : '#fff',
              border: 'none', borderRadius: 8,
              cursor: !podeClonar || loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Clonando...' : 'Clonar produto'}
          </button>
          {(resultado || error) && (
            <button
              onClick={limpar}
              style={{
                padding: '9px 16px', fontSize: 14,
                background: 'transparent', color: '#6b7280',
                border: '1px solid #1e2130', borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div style={{
          marginTop: 16,
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 8, padding: '12px 16px',
          color: '#f87171', fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Sucesso — exibe mensagem + campos de dados retornados pelo backend */}
      {resultado && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#22c55e', boxShadow: '0 0 6px #22c55e',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 500 }}>
              {resultado.mensagem || 'KIT criado com sucesso.'}
            </span>
          </div>

          {resultado.dados && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 8,
            }}>
              {/* Exibe todos os campos retornados em dados */}
              {Object.entries(resultado.dados).map(([key, val]) => (
                <ResultCard
                  key={key}
                  label={key}
                  value={String(val)}
                  accent="#22c55e"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── aba por planilha ────────────────────────────────────────────────────────
// Rota: POST /anymarket/kit/planilha
// Form-data campo: "planilha" (arquivo .xlsx)
// Colunas esperadas: id_prod_hub | novo_sku | novo_ean | sku_composicao
// Resposta: { mensagem, resultados: [{ linha, novo_sku, sucesso, dados?, erro?, detalhe? }] }

function StatusPill({ sucesso }) {
  const cfg = sucesso
    ? { color: '#4ade80', bg: 'rgba(34,197,94,0.1)',  label: 'Sucesso' }
    : { color: '#f87171', bg: 'rgba(239,68,68,0.08)', label: 'Erro'    };
  return (
    <span style={{
      fontSize: 11, fontWeight: 500,
      color: cfg.color, background: cfg.bg,
      padding: '2px 8px', borderRadius: 4,
      display: 'inline-block',
    }}>
      {cfg.label}
    </span>
  );
}

function ClonagemPlanilha() {
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'xlsx') {
      setError('Formato inválido. Envie um arquivo .xlsx');
      return;
    }
    setArquivo(file);
    setResultados([]);
    setError(null);
    setProgresso(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const processar = async () => {
    if (!arquivo) return;
    setLoading(true);
    setError(null);
    setResultados([]);

    const formData = new FormData();
    // campo deve ser "planilha" — conforme busboy no backend
    formData.append('planilha', arquivo);

    try {
      const res = await fetch('/anymarket/kit-anymarket/planilha', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        // backend retorna { erro, detalhe? }
        setError(json.erro || json.error || 'Erro ao processar planilha.');
        return;
      }

      // json = { mensagem, resultados: [{ linha, novo_sku, sucesso, dados?, erro?, detalhe? }] }
      const rows = json.resultados || [];
      setResultados(rows);
      setProgresso({
        total:   rows.length,
        sucesso: rows.filter(r => r.sucesso).length,
        erro:    rows.filter(r => !r.sucesso).length,
      });
    } catch (e) {
      setError(`Erro de conexão: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setArquivo(null);
    setResultados([]);
    setError(null);
    setProgresso(null);
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 0, marginBottom: 16 }}>
        Envie uma planilha <strong style={{ color: '#d1d5db' }}>.xlsx</strong> com as colunas obrigatórias:
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {['id_prod_hub', 'novo_sku', 'novo_ean', 'sku_composicao'].map(col => (
          <code key={col} style={{
            background: '#0f1117', color: '#93c5fd',
            padding: '3px 8px', borderRadius: 4, fontSize: 12,
            border: '1px solid #1e2130',
          }}>{col}</code>
        ))}
      </div>

      {/* Drop zone */}
      {!arquivo ? (
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            background: drag ? 'rgba(59,91,219,0.08)' : '#15171f',
            border: `2px dashed ${drag ? '#3b5bdb' : '#1e2130'}`,
            borderRadius: 14, padding: '48px 32px',
            textAlign: 'center', cursor: 'pointer',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px', display: 'block' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div style={{ fontSize: 14, color: '#6b7280' }}>
            Arraste o arquivo aqui ou{' '}
            <span style={{ color: '#93c5fd' }}>clique para selecionar</span>
          </div>
          <div style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>Apenas .xlsx</div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div style={{
          background: '#15171f', border: '1px solid #1e2130',
          borderRadius: 12, padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(13,148,136,0.12)', color: '#2dd4bf',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M3 15h18M9 3v18" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>{arquivo.name}</div>
              <div style={{ fontSize: 11, color: '#4b5563' }}>{(arquivo.size / 1024).toFixed(1)} KB</div>
            </div>
          </div>
          {!progresso && (
            <button
              onClick={limpar}
              style={{
                background: 'transparent', border: 'none',
                color: '#4b5563', cursor: 'pointer', fontSize: 13, padding: '4px 8px',
              }}
            >
              Remover
            </button>
          )}
        </div>
      )}

      {/* Erro */}
      {error && (
        <div style={{
          marginTop: 12,
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 8, padding: '12px 16px',
          color: '#f87171', fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Botão processar */}
      {arquivo && !progresso && (
        <button
          onClick={processar}
          disabled={loading}
          style={{
            marginTop: 16,
            padding: '9px 20px', fontSize: 14, fontWeight: 500,
            background: loading ? '#1e2130' : '#3b5bdb',
            color: loading ? '#4b5563' : '#fff',
            border: 'none', borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Processando...' : 'Processar planilha'}
        </button>
      )}

      {/* Aviso de demora */}
      {loading && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#4b5563' }}>
          Processando linha a linha com intervalo entre requisições — aguarde...
        </div>
      )}

      {/* Resumo + tabela */}
      {progresso && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            <div style={{ background: '#0f1117', border: '1px solid #1e2130', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 2 }}>TOTAL</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#f1f5f9' }}>{progresso.total}</div>
            </div>
            <div style={{ background: '#0f1117', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 2 }}>SUCESSO</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#4ade80' }}>{progresso.sucesso}</div>
            </div>
            <div style={{ background: '#0f1117', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 2 }}>ERROS</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#f87171' }}>{progresso.erro}</div>
            </div>
          </div>

          {resultados.length > 0 && (
            <div style={{
              background: '#15171f', border: '1px solid #1e2130',
              borderRadius: 12, overflowX: 'auto',
            }}>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '52px 1fr 1fr 1fr 80px',
                padding: '10px 16px',
                borderBottom: '1px solid #1e2130',
                fontSize: 11, fontWeight: 600, color: '#4b5563',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                minWidth: 480,
              }}>
                <div>Linha</div>
                <div>Novo SKU</div>
                <div>SKU gerado</div>
                <div>Mensagem de erro</div>
                <div>Status</div>
              </div>

              {resultados.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '52px 1fr 1fr 1fr 80px',
                    padding: '10px 16px',
                    borderBottom: i < resultados.length - 1 ? '1px solid #1e2130' : 'none',
                    fontSize: 13,
                    background: !r.sucesso ? 'rgba(239,68,68,0.03)' : 'transparent',
                    alignItems: 'center',
                    minWidth: 480,
                  }}
                >
                  <div style={{ color: '#4b5563' }}>{r.linha}</div>

                  {/* novo_sku — campo snake_case do backend */}
                  <div style={{ color: '#d1d5db', fontFamily: 'monospace', fontSize: 12 }}>
                    {r.novo_sku || '—'}
                  </div>

                  {/* sku gerado vem dentro de dados se existir */}
                  <div style={{ color: '#4ade80', fontFamily: 'monospace', fontSize: 12 }}>
                    {r.dados?.sku || r.dados?.partnerId || (r.sucesso ? r.novo_sku : '—')}
                  </div>

                  {/* erro ou detalhe */}
                  <div style={{ color: '#f87171', fontSize: 12 }}>
                    {r.erro || r.detalhe || '—'}
                  </div>

                  <div><StatusPill sucesso={r.sucesso} /></div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={limpar}
            style={{
              marginTop: 16,
              padding: '8px 16px', fontSize: 13,
              background: 'transparent', color: '#6b7280',
              border: '1px solid #1e2130', borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Nova clonagem
          </button>
        </div>
      )}
    </div>
  );
}

// ─── componente principal ────────────────────────────────────────────────────

const ABAS = [
  { id: 'unitaria', label: 'Unitária'     },
  { id: 'planilha', label: 'Por planilha' },
];

export default function Clonagem() {
  const [aba, setAba] = useState('unitaria');

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Clonagem</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Duplique produtos com novos SKUs e EANs. Estrutura original preservada.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4,
        background: '#0f1117',
        border: '1px solid #1e2130',
        borderRadius: 10, padding: 4,
        marginBottom: 24,
        width: 'fit-content',
      }}>
        {ABAS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            style={{
              padding: '7px 18px', fontSize: 13, fontWeight: 500,
              background: aba === id ? '#15171f' : 'transparent',
              color: aba === id ? '#f1f5f9' : '#4b5563',
              border: aba === id ? '1px solid #1e2130' : '1px solid transparent',
              borderRadius: 7, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {aba === 'unitaria' ? <ClonagemUnitaria /> : <ClonagemPlanilha />}
    </div>
  );
}