import { useState } from 'react';

// ─── helpers ─────────────────────────────────────────────────────────────────

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
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#d1d5db', marginBottom: 4 }}>
        {label}
        {required && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
        {hint && <span style={{ fontWeight: 400, color: '#4b5563', marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, monospace = false }) {
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
        borderRadius: 8, outline: 'none', color: '#f1f5f9',
        fontFamily: monospace ? 'monospace' : 'inherit',
        transition: 'border-color 0.15s',
      }}
    />
  );
}

function Erro({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      marginTop: 16,
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: 8, padding: '12px 16px', color: '#f87171', fontSize: 14,
    }}>
      {msg}
    </div>
  );
}

// Campo de palavras-chave com chips
function PalavrasChaveInput({ value, onChange }) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);

  const adicionar = () => {
    const v = input.trim();
    if (!v || value.includes(v)) { setInput(''); return; }
    onChange([...value, v]);
    setInput('');
  };

  const remover = (i) => onChange(value.filter((_, idx) => idx !== i));

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); adicionar(); }
    if (e.key === 'Backspace' && !input && value.length) remover(value.length - 1);
  };

  return (
    <div
      style={{
        minHeight: 42, boxSizing: 'border-box',
        padding: '6px 10px',
        background: '#0f1117',
        border: `1px solid ${focused ? '#3b5bdb' : '#1e2130'}`,
        borderRadius: 8, display: 'flex', flexWrap: 'wrap', gap: 6,
        cursor: 'text', transition: 'border-color 0.15s',
      }}
      onClick={() => document.getElementById('pkw-input')?.focus()}
    >
      {value.map((kw, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(59,91,219,0.15)', color: '#93c5fd',
          fontSize: 12, padding: '2px 8px', borderRadius: 4,
        }}>
          {kw}
          <button
            onClick={e => { e.stopPropagation(); remover(i); }}
            style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 13 }}
          >×</button>
        </span>
      ))}
      <input
        id="pkw-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); adicionar(); }}
        placeholder={value.length === 0 ? 'Digite e pressione Enter (vazio = copiar tudo)' : ''}
        style={{
          flex: 1, minWidth: 140, background: 'transparent',
          border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 13,
          padding: '2px 4px',
        }}
      />
    </div>
  );
}

// ─── log de resultado ─────────────────────────────────────────────────────────

function LogBox({ log }) {
  if (!log?.length) return null;
  return (
    <div style={{
      background: '#0f1117', border: '1px solid #1e2130',
      borderRadius: 8, padding: '12px 14px', marginTop: 10,
      maxHeight: 180, overflowY: 'auto',
    }}>
      <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Log</div>
      {log.map((linha, i) => (
        <div key={i} style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.7, fontFamily: 'monospace' }}>{linha}</div>
      ))}
    </div>
  );
}

// ─── aba unitária ─────────────────────────────────────────────────────────────
// POST /anymarket/caracteristicas/copiar
// Body: { idOrigem, idDestino, palavrasChave?, conta? }
// Resposta ok:   { mensagem, log }
// Resposta erro: { erro, detalhe? }

function CopiaUnitaria() {
  const [form, setForm] = useState({ idOrigem: '', idDestino: '', conta: 'origem' });
  const [palavrasChave, setPalavrasChave] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]= useState(null);
  const [resultado, setResultado] = useState(null);

  const set = f => v => setForm(p => ({ ...p, [f]: v }));
  const podeCopiar = form.idOrigem.trim() && form.idDestino.trim();

  const copiar = async () => {
    if (!podeCopiar) return;
    setLoading(true); setError(null); setResultado(null);

    try {
      const res = await fetch('/anymarket/caracteristicas/copiar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idOrigem:     form.idOrigem.trim(),
          idDestino:    form.idDestino.trim(),
          palavrasChave,
          conta:        form.conta || 'origem',
        }),
      });

      const json = await res.json();
      if (!res.ok) { setError(json.erro || json.error || 'Erro desconhecido.'); return; }
      setResultado(json); // { mensagem, log }
    } catch (e) {
      setError(`Erro de conexão: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setForm({ idOrigem: '', idDestino: '', conta: 'origem' });
    setPalavrasChave([]);
    setResultado(null); setError(null);
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 0, marginBottom: 24 }}>
        Copia características de um produto de origem para um de destino. Sem filtro de palavras-chave, copia tudo.
      </p>

      <div style={{ background: '#15171f', border: '1px solid #1e2130', borderRadius: 14, padding: 24 }}>
        <SectionLabel>Produtos</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="ID de origem" required>
            <TextInput value={form.idOrigem} onChange={set('idOrigem')} placeholder="ex: 7075393220" monospace />
          </Field>
          <Field label="ID de destino" required>
            <TextInput value={form.idDestino} onChange={set('idDestino')} placeholder="ex: 7075393221" monospace />
          </Field>
        </div>

        <div style={{ borderTop: '1px solid #1e2130', margin: '20px 0' }} />

        <SectionLabel>Filtros</SectionLabel>
        <Field label="Palavras-chave" hint="(opcional — filtra por nome de característica)">
          <PalavrasChaveInput value={palavrasChave} onChange={setPalavrasChave} />
        </Field>

        <Field label="Conta" hint="(opcional)">
          <select
            value={form.conta}
            onChange={e => set('conta')(e.target.value)}
            style={{
              width: '100%', padding: '9px 14px', fontSize: 14,
              background: '#0f1117', border: '1px solid #1e2130',
              borderRadius: 8, color: '#f1f5f9', outline: 'none',
            }}
          >
            <option value="origem">origem</option>
            <option value="destino">destino</option>
          </select>
        </Field>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={copiar}
            disabled={!podeCopiar || loading}
            style={{
              padding: '9px 20px', fontSize: 14, fontWeight: 500,
              background: !podeCopiar || loading ? '#1e2130' : '#3b5bdb',
              color: !podeCopiar || loading ? '#4b5563' : '#fff',
              border: 'none', borderRadius: 8,
              cursor: !podeCopiar || loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Copiando...' : 'Copiar características'}
          </button>
          {(resultado || error) && (
            <button onClick={limpar} style={{
              padding: '9px 16px', fontSize: 14, background: 'transparent',
              color: '#6b7280', border: '1px solid #1e2130', borderRadius: 8, cursor: 'pointer',
            }}>
              Limpar
            </button>
          )}
        </div>
      </div>

      <Erro msg={error} />

      {resultado && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 500 }}>{resultado.mensagem}</span>
          </div>
          <LogBox log={resultado.log} />
        </div>
      )}
    </div>
  );
}

// ─── aba em lote ─────────────────────────────────────────────────────────────
// POST /anymarket/caracteristicas/copiar/lote
// Body: { pares: [{idOrigem, idDestino}], palavrasChave?, conta? }
// Resposta: { mensagem, resultados: [{ linha, idOrigem, idDestino, sucesso, log?, erro?, detalhe? }] }

function StatusPill({ sucesso }) {
  const cfg = sucesso
    ? { color: '#4ade80', bg: 'rgba(34,197,94,0.1)',  label: 'Sucesso' }
    : { color: '#f87171', bg: 'rgba(239,68,68,0.08)', label: 'Erro'    };
  return (
    <span style={{ fontSize: 11, fontWeight: 500, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 4 }}>
      {cfg.label}
    </span>
  );
}

function CopiaLote() {
  const [pares, setPares] = useState([{ idOrigem: '', idDestino: '' }]);
  const [palavrasChave, setPalavrasChave] = useState([]);
  const [conta, setConta] = useState('origem');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

  const setPar = (i, field, val) =>
    setPares(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));

  const addPar = () => setPares(p => [...p, { idOrigem: '', idDestino: '' }]);
  const removePar = (i) => setPares(p => p.filter((_, idx) => idx !== i));

  const podeCopiar = pares.every(p => p.idOrigem.trim() && p.idDestino.trim()) && pares.length > 0;

  const copiar = async () => {
    if (!podeCopiar) return;
    setLoading(true); setError(null); setResultado(null);

    try {
      const res = await fetch('/anymarket/caracteristicas/copiar/lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pares: pares.map(p => ({ idOrigem: p.idOrigem.trim(), idDestino: p.idDestino.trim() })),
          palavrasChave,
          conta: conta || 'origem',
        }),
      });

      const json = await res.json();
      if (!res.ok) { setError(json.erro || json.error || 'Erro desconhecido.'); return; }
      setResultado(json); // { mensagem, resultados }
    } catch (e) {
      setError(`Erro de conexão: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setPares([{ idOrigem: '', idDestino: '' }]);
    setPalavrasChave([]); setConta('origem');
    setResultado(null); setError(null);
  };

  const progresso = resultado ? {
    total:   resultado.resultados.length,
    sucesso: resultado.resultados.filter(r => r.sucesso).length,
    erro:    resultado.resultados.filter(r => !r.sucesso).length,
  } : null;

  return (
    <div>
      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 0, marginBottom: 24 }}>
        Copia características de múltiplos pares de produtos. O mesmo filtro de palavras-chave se aplica a todos.
      </p>

      {/* Pares */}
      <div style={{ background: '#15171f', border: '1px solid #1e2130', borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <SectionLabel>Pares de produtos</SectionLabel>

        {pares.map((par, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr auto',
            gap: 8, marginBottom: 8, alignItems: 'flex-end',
          }}>
            <Field label={i === 0 ? 'ID de origem' : undefined} required={i === 0}>
              <TextInput
                value={par.idOrigem}
                onChange={v => setPar(i, 'idOrigem', v)}
                placeholder="ID origem"
                monospace
              />
            </Field>
            <Field label={i === 0 ? 'ID de destino' : undefined} required={i === 0}>
              <TextInput
                value={par.idDestino}
                onChange={v => setPar(i, 'idDestino', v)}
                placeholder="ID destino"
                monospace
              />
            </Field>
            <div style={{ paddingBottom: 0 }}>
              <button
                onClick={() => removePar(i)}
                disabled={pares.length === 1}
                style={{
                  height: 38, width: 38,
                  background: 'transparent',
                  border: '1px solid #1e2130', borderRadius: 8,
                  color: pares.length === 1 ? '#1e2130' : '#6b7280',
                  cursor: pares.length === 1 ? 'not-allowed' : 'pointer',
                  fontSize: 18, lineHeight: 1,
                }}
              >×</button>
            </div>
          </div>
        ))}

        <button
          onClick={addPar}
          style={{
            marginTop: 4, padding: '7px 14px', fontSize: 13,
            background: 'transparent', color: '#93c5fd',
            border: '1px dashed #1e2130', borderRadius: 8, cursor: 'pointer',
          }}
        >
          + Adicionar par
        </button>

        <div style={{ borderTop: '1px solid #1e2130', margin: '20px 0' }} />

        <SectionLabel>Filtros (aplicados a todos os pares)</SectionLabel>
        <Field label="Palavras-chave" hint="(opcional)">
          <PalavrasChaveInput value={palavrasChave} onChange={setPalavrasChave} />
        </Field>

        <Field label="Conta" hint="(opcional)">
          <select
            value={conta}
            onChange={e => setConta(e.target.value)}
            style={{
              width: '100%', padding: '9px 14px', fontSize: 14,
              background: '#0f1117', border: '1px solid #1e2130',
              borderRadius: 8, color: '#f1f5f9', outline: 'none',
            }}
          >
            <option value="origem">origem</option>
            <option value="destino">destino</option>
          </select>
        </Field>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={copiar}
            disabled={!podeCopiar || loading}
            style={{
              padding: '9px 20px', fontSize: 14, fontWeight: 500,
              background: !podeCopiar || loading ? '#1e2130' : '#3b5bdb',
              color: !podeCopiar || loading ? '#4b5563' : '#fff',
              border: 'none', borderRadius: 8,
              cursor: !podeCopiar || loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Processando...' : `Copiar ${pares.length} par${pares.length > 1 ? 'es' : ''}`}
          </button>
          {(resultado || error) && (
            <button onClick={limpar} style={{
              padding: '9px 16px', fontSize: 14, background: 'transparent',
              color: '#6b7280', border: '1px solid #1e2130', borderRadius: 8, cursor: 'pointer',
            }}>
              Limpar
            </button>
          )}
        </div>
      </div>

      <Erro msg={error} />

      {/* Resultados do lote */}
      {progresso && (
        <div style={{ marginTop: 4 }}>
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

          <div style={{ background: '#15171f', border: '1px solid #1e2130', borderRadius: 12, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '44px 1fr 1fr 1fr 80px',
              padding: '10px 16px', borderBottom: '1px solid #1e2130',
              fontSize: 11, fontWeight: 600, color: '#4b5563',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <div>#</div>
              <div>ID origem</div>
              <div>ID destino</div>
              <div>Erro</div>
              <div>Status</div>
            </div>

            {resultado.resultados.map((r, i) => (
              <div key={i}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '44px 1fr 1fr 1fr 80px',
                  padding: '10px 16px',
                  borderBottom: '1px solid #1e2130',
                  fontSize: 13,
                  background: !r.sucesso ? 'rgba(239,68,68,0.03)' : 'transparent',
                  alignItems: 'center',
                }}>
                  <div style={{ color: '#4b5563' }}>{r.linha}</div>
                  <div style={{ color: '#d1d5db', fontFamily: 'monospace', fontSize: 12 }}>{r.idOrigem}</div>
                  <div style={{ color: '#d1d5db', fontFamily: 'monospace', fontSize: 12 }}>{r.idDestino}</div>
                  <div style={{ color: '#f87171', fontSize: 12 }}>{r.erro || r.detalhe || '—'}</div>
                  <div><StatusPill sucesso={r.sucesso} /></div>
                </div>
                {/* Log expandido por linha se sucesso */}
                {r.sucesso && r.log?.length > 0 && (
                  <div style={{
                    background: '#0a0b10', padding: '8px 16px 10px 60px',
                    borderBottom: '1px solid #1e2130',
                  }}>
                    {r.log.map((l, j) => (
                      <div key={j} style={{ fontSize: 11, color: '#4b5563', fontFamily: 'monospace', lineHeight: 1.7 }}>{l}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── componente principal ─────────────────────────────────────────────────────

const ABAS = [
  { id: 'unitaria', label: 'Unitária' },
  { id: 'lote',     label: 'Em lote'  },
];

export default function Caracteristicas() {
  const [aba, setAba] = useState('unitaria');

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Características</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Copie características entre produtos. Filtre por palavras-chave ou copie tudo.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4,
        background: '#0f1117', border: '1px solid #1e2130',
        borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content',
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
              borderRadius: 7, cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {aba === 'unitaria' ? <CopiaUnitaria /> : <CopiaLote />}
    </div>
  );
}