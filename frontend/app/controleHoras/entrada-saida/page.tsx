'use client';
import { useState } from 'react';
import styles from '../App.module.css';
import { useRouter } from 'next/navigation';

interface Card {
  id: number;
  nomeProjeto: string;
  tituloSessao: string;
  descricao: string;
  responsavel: string;
  inicio: string;
  fim: string;
  tipoAtividade: string;
  dataLancamento: string;
  justificativa?: string;
}

function calcularTotal(inicio: string, fim: string): number {
  if (!inicio || !fim) return 0;
  const [hI, mI] = inicio.split(':').map(Number);
  const [hF, mF] = fim.split(':').map(Number);
  const totalMin = (hF * 60 + mF) - (hI * 60 + mI);
  return totalMin > 0 ? totalMin : 0;
}

function formatarHoras(minutos: number): string {
  if (minutos <= 0) return '0h 0min';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h}h ${m}min`;
}

function formatarData(data: string): string {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function hojeISO(): string {
  return new Date().toISOString().split('T')[0];
}

function isRetroativo(data: string): boolean {
  return data !== '' && data < hojeISO();
}

const cardInicial = {
  nomeProjeto: '',
  tituloSessao: '',
  descricao: '',
  responsavel: '',
  inicio: '',
  fim: '',
  tipoAtividade: '',
  dataLancamento: hojeISO(),
  justificativa: '',
};

export default function Page() {
  const router = useRouter();

  const [cards, setCards] = useState<Card[]>([
    {
      id: 1,
      nomeProjeto: 'Aerocode',
      tituloSessao: 'Planejamento da sprint',
      descricao: 'Gestão',
      responsavel: 'José Ricardo',
      inicio: '08:00',
      fim: '09:30',
      tipoAtividade: 'REUNIAO',
      dataLancamento: hojeISO(),
    },
    {
      id: 2,
      nomeProjeto: 'Aerocode',
      tituloSessao: 'Desenvolvimento de componentes',
      descricao: 'Frontend',
      responsavel: 'Daniele',
      inicio: '10:00',
      fim: '12:00',
      tipoAtividade: 'FEATURE',
      dataLancamento: hojeISO(),
    },
  ]);

  const [aguardando, setAguardando] = useState<Card[]>([]);

  const enviar = (id: number) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;
    setAguardando(prev => [...prev, card]);
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const [modalAberto, setModalAberto] = useState(false);
  const [cardEditando, setCardEditando] = useState<Card | null>(null);
  const [form, setForm] = useState(cardInicial);

  const abrirModalNovo = () => {
    setCardEditando(null);
    setForm(cardInicial);
    setModalAberto(true);
  };

  const abrirModalEdicao = (card: Card) => {
    setCardEditando(card);
    setForm({
      nomeProjeto: card.nomeProjeto,
      tituloSessao: card.tituloSessao,
      descricao: card.descricao,
      responsavel: card.responsavel,
      inicio: card.inicio,
      fim: card.fim,
      tipoAtividade: card.tipoAtividade,
      dataLancamento: card.dataLancamento,
      justificativa: card.justificativa || '',
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCardEditando(null);
    setForm(cardInicial);
  };

  const salvar = () => {
    if (isRetroativo(form.dataLancamento) && !form.justificativa?.trim()) return;
    if (!form.tipoAtividade) return;

    if (cardEditando) {
      setCards(prev =>
        prev.map(c => (c.id === cardEditando.id ? { ...cardEditando, ...form } : c))
      );
    } else {
      setCards(prev => [...prev, { id: Date.now(), ...form }]);
    }
    fecharModal();
  };

  const excluir = (id: number) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const [filtroProjeto, setFiltroProjeto] = useState('');
  const [filtroData, setFiltroData] = useState('');

  const projetos = Array.from(new Set(cards.map(c => c.nomeProjeto)));

  const cardsFiltrados = cards.filter(c => {
    const matchProjeto = filtroProjeto === '' || c.nomeProjeto === filtroProjeto;
    const matchData = filtroData === '' || c.dataLancamento === filtroData;
    return matchProjeto && matchData;
  });

  const totalGeral = cardsFiltrados.reduce((acc, c) => acc + calcularTotal(c.inicio, c.fim), 0);
  const retroativo = isRetroativo(form.dataLancamento);

  return (
    <div className={styles.page}>
      {/* OPÇÕES de filtro */}
      <div className={styles.filtros}>
        <button className={`${styles.filtroBtn} ${styles.filtroBtnAtivo}`}>Entrada/Saída</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/aguardando-aprovacao')}>Aguardando aprovação</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/aprovados')}>Aprovados</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/rejeitados')}>Rejeitados</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/historico')}>Histórico</button>
      </div>

      {/* HORAS semanal e mensal + filtros de projeto/data */}
      <div className={styles.semanaHeader}>
        <div className={styles.semanaHeaderInfo}>
          <span className={styles.semanaData}>17 Fevereiro 2025</span>
          <div className={styles.semanaDivider} />
          <span className={styles.semanaStat}>Semana: <strong>{formatarHoras(totalGeral)}</strong></span>
          <div className={styles.semanaDivider} />
          <span className={styles.semanaStat}>Mês: <strong>51h 30min</strong></span>
        </div>
        <div className={styles.semanaHeaderFiltros}>
          <select
            className={styles.filtroSelect}
            value={filtroProjeto}
            onChange={e => setFiltroProjeto(e.target.value)}
          >
            <option value="">Todos os projetos</option>
            {projetos.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input
            className={styles.filtroData}
            type="date"
            value={filtroData}
            onChange={e => setFiltroData(e.target.value)}
          />
          {(filtroProjeto !== '' || filtroData !== '') && (
            <button
              className={styles.filtroBtnLimpar}
              onClick={() => { setFiltroProjeto(''); setFiltroData(''); }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className={styles.cardWrapper}>
        {/* ATIVIDADES - inicio, fim e total */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 110px 120px 100px', padding: '0 20px 8px', gap: '10px', fontSize: '11px', fontWeight: 700, color: '#0A4FA8', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1.5px solid #E8EFF9', marginBottom: '10px' }}>
          <span style={{ textAlign: 'left' }}>Atividade</span>
          <span>Início</span>
          <span>Fim</span>
          <span>Total</span>
          <span>Lançamento</span>
          <span>Ações</span>
        </div>

        {cardsFiltrados.map((card) => (
          <div key={card.id} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr 100px 100px 110px 120px 100px', alignItems: 'center', gap: '10px', marginBottom: '8px', border: '1.5px solid #E8EFF9', boxShadow: '0 1px 4px rgba(1,38,67,0.05)' }}>
            <div>
              <div className={styles.cardBreadcrumb}>{card.nomeProjeto}</div>
              <div className={styles.cardTitulo}>{card.tituloSessao}</div>
              <div className={styles.cardTags}>
                <span className={styles.cardTag}>{card.descricao}</span>
                <span className={styles.cardTag}>{card.responsavel}</span>
                <span className={styles.cardTag}>{card.tipoAtividade}</span>
              </div>
            </div>
            <div className={styles.cardHorario}>{card.inicio}</div>
            <div className={styles.cardHorario}>{card.fim}</div>
            <div className={styles.cardTotal}>{formatarHoras(calcularTotal(card.inicio, card.fim))}</div>
            <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#0A4FA8' }}>{formatarData(card.dataLancamento)}</div>
            <div className={styles.cardAcoes}>
              <button style={btnIcone} title="Editar" onClick={() => abrirModalEdicao(card)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A4FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button style={btnIcone} title="Excluir" onClick={() => excluir(card.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
              <button style={btnIcone} title="Enviar" onClick={() => enviar(card.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A4FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        <button className={styles.btnAdicionar} onClick={abrirModalNovo}>+</button>
      </div>

      {modalAberto && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ color: '#012643', marginBottom: '16px', fontFamily: 'Roboto, sans-serif' }}>
              {cardEditando ? 'Editar registro' : 'Novo registro'}
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Data do lançamento</label>
              <input
                style={inputStyle}
                type="date"
                max={hojeISO()}
                value={form.dataLancamento}
                onChange={e => setForm(prev => ({ ...prev, dataLancamento: e.target.value, justificativa: '' }))}
              />
            </div>

            {retroativo && (
              <div style={{ marginBottom: '12px', background: '#FFF8E1', borderRadius: '8px', padding: '10px 12px' }}>
                <span style={{ fontSize: '12px', color: '#E65100', fontWeight: 600 }}>
                  Lançamento retroativo — aguardará aprovação do Gerente
                </span>
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Tipo de atividade</label>
              <select
                style={inputStyle}
                value={form.tipoAtividade}
                onChange={e => setForm(prev => ({ ...prev, tipoAtividade: e.target.value }))}
              >
                <option value="">Selecione...</option>
                <option value="ANALISE">Análise</option>
                <option value="DESENVOLVIMENTO">Desenvolvimento</option>
                <option value="TESTES">Testes</option>
                <option value="CORRECAO_BUG">Correção de Bug</option>
                <option value="FEATURE">Feature</option>
              </select>
            </div>

            {(['nomeProjeto', 'tituloSessao', 'descricao', 'responsavel'] as const).map((campo) => (
              <div key={campo} style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>{labels[campo]}</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={form[campo]}
                  onChange={e => setForm(prev => ({ ...prev, [campo]: e.target.value }))}
                />
              </div>
            ))}

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Início</label>
                <input
                  style={inputStyle}
                  type="time"
                  value={form.inicio}
                  onChange={e => setForm(prev => ({ ...prev, inicio: e.target.value }))}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Fim</label>
                <input
                  style={inputStyle}
                  type="time"
                  value={form.fim}
                  onChange={e => setForm(prev => ({ ...prev, fim: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#0A4FA8', marginBottom: '16px' }}>
              Total: <strong style={{ color: '#012643' }}>{formatarHoras(calcularTotal(form.inicio, form.fim))}</strong>
            </div>

            {retroativo && (
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Justificativa <span style={{ color: '#E65100' }}>*</span></label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
                  value={form.justificativa}
                  onChange={e => setForm(prev => ({ ...prev, justificativa: e.target.value }))}
                  placeholder="Explique o motivo do lançamento retroativo"
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={fecharModal} style={btnCancelar}>Cancelar</button>
              <button
                onClick={salvar}
                style={{
                  ...btnSalvar,
                  opacity: (retroativo && !form.justificativa?.trim()) || !form.tipoAtividade ? 0.5 : 1,
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labels: Record<string, string> = {
  nomeProjeto: 'Nome do projeto',
  tituloSessao: 'Título da sessão',
  descricao: 'Descrição',
  responsavel: 'Responsável',
};

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.35)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100,
};

const modal: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: '14px',
  padding: '24px',
  width: '100%',
  maxWidth: '420px',
  fontFamily: 'Roboto, sans-serif',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  color: '#0A4FA8',
  marginBottom: '4px',
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid #E8EFF9',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '13px',
  color: '#012643',
  outline: 'none',
  fontFamily: 'Roboto, sans-serif',
  boxSizing: 'border-box',
};

const btnSalvar: React.CSSProperties = {
  background: '#012643',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 20px',
  fontSize: '13px',
  fontWeight: 700,
  color: '#FFFFFF',
  cursor: 'pointer',
  fontFamily: 'Roboto, sans-serif',
};

const btnCancelar: React.CSSProperties = {
  background: '#E8EFF9',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 20px',
  fontSize: '13px',
  color: '#0A4FA8',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Roboto, sans-serif',
};

const btnIcone: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};