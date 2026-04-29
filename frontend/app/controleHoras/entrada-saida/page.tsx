'use client';
import { useState, useEffect } from 'react';
import styles from '../App.module.css';
import { useRouter } from 'next/navigation';

// --- INTEGRAÇÃO COM O BACKEND (SERVICE) ---
const BASE_URL = process.env.NEXT_PUBLIC_APONTAMENTO_API_URL || 'http://localhost:8080';
const USUARIO_URL = process.env.NEXT_PUBLIC_USUARIO_API_URL || 'http://localhost:8080';

export type TipoAtividade = 'ANALISE' | 'DESENVOLVIMENTO' | 'TESTES' | 'CORRECAO_BUG' | 'FEATURE';
export type EstadoHora = 'PENDENTE' | 'AGUARDANDO_APROVACAO' | 'APROVADO' | 'REJEITADO';

export interface HorasExibirDTO {
    id: number;
    tarefaId: number | null;
    usuarioId: number;
    tituloSessao: string;
    tipoAtividade: TipoAtividade;
    descricao: string | null;
    dataLancamento: string; // "YYYY-MM-DD"
    inicio: string;         // "HH:mm:ss"
    fim: string;            // "HH:mm:ss"
    justificativa: string | null;
    motivoRejeicao: string | null;
    estado: EstadoHora;
    dataCriacao: string;
}

export interface HorasCadastrarDTO {
    usuarioId: number;
    tarefaId?: number | null;
    tituloSessao: string;
    tipoAtividade: TipoAtividade;
    descricao?: string;
    dataLancamento: string; // "YYYY-MM-DD"
    inicio: string;         // "HH:mm"
    fim: string;            // "HH:mm"
    justificativa?: string;
}

export interface HorasAtualizarDTO {
    id: number;
    tarefaId?: number | null;
    tituloSessao: string;
    tipoAtividade: TipoAtividade;
    descricao?: string;
    dataLancamento: string;
    inicio: string;
    fim: string;
    justificativa?: string;
}

export interface HorasRejeitarDTO {
    id: number;
    motivoRejeicao: string;
}

export interface HorasFiltroParams {
    usuarioId?: number;
    estado?: EstadoHora;
    dataInicio?: string;
    dataFim?: string;
}

export interface UsuarioExibirDTO {
    id: number;
    nome: string;
    cargo: string;
    email: string;
    salario: string;
    gerenteId: number | null;
    dataCriacao: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const erro = await res.text();
        throw new Error(erro || `Erro ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

// BUSCAR apontamentos filtro (todas as abas)
export async function filtrarHoras(params: HorasFiltroParams): Promise<HorasExibirDTO[]> {
    const query = new URLSearchParams();
    if (params.usuarioId !== undefined) query.append('usuarioId', String(params.usuarioId));
    if (params.estado) query.append('estado', params.estado);
    if (params.dataInicio) query.append('dataInicio', params.dataInicio);
    if (params.dataFim) query.append('dataFim', params.dataFim);

    const res = await fetch(`${BASE_URL}/horas/filtrar?${query.toString()}`);
    return handleResponse<HorasExibirDTO[]>(res);
}

// BUSCAR apontamento id
export async function buscarHoraPorId(id: number): Promise<HorasExibirDTO> {
    const res = await fetch(`${BASE_URL}/horas/${id}`);
    return handleResponse<HorasExibirDTO>(res);
}

// CRIAR apontamento
export async function criarHora(dto: HorasCadastrarDTO): Promise<HorasExibirDTO> {
    const res = await fetch(`${BASE_URL}/horas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
    });
    return handleResponse<HorasExibirDTO>(res);
}

// EDITAR apontamento 
export async function editarHora(dto: HorasAtualizarDTO): Promise<HorasExibirDTO> {
    const res = await fetch(`${BASE_URL}/horas/editar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
    });
    return handleResponse<HorasExibirDTO>(res);
}

// EXCLUIR apontamento 
export async function excluirHora(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/horas/${id}`, {
        method: 'DELETE',
    });
    return handleResponse<void>(res);
}

// APROVAR apontamento
export async function aprovarHora(id: number): Promise<HorasExibirDTO> {
    const res = await fetch(`${BASE_URL}/horas/${id}/aprovar`, {
        method: 'PATCH',
    });
    return handleResponse<HorasExibirDTO>(res);
}

// REJEITAR apontamento
export async function rejeitarHora(dto: HorasRejeitarDTO): Promise<HorasExibirDTO> {
    const res = await fetch(`${BASE_URL}/horas/rejeitar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
    });
    return handleResponse<HorasExibirDTO>(res);
}

// ENVIAR apontamento para aprovação
export async function enviarParaAprovacao(id: number): Promise<HorasExibirDTO> {
    const res = await fetch(`${BASE_URL}/horas/${id}/enviar`, {
        method: 'PATCH',
    });
    return handleResponse<HorasExibirDTO>(res);
}

// // BUSCAR usuario por id
// export async function buscarUsuarioPorId(id: number): Promise<UsuarioExibirDTO> {
//      const res = await fetch(`${USUARIO_URL}/usuario/${id}`);
//      return handleResponse<UsuarioExibirDTO>(res);
// }

// // BUSCAR todos os usuarios
// export async function buscarTodosUsuarios(): Promise<UsuarioExibirDTO[]> {
//      const res = await fetch(`${USUARIO_URL}/usuario/todos`);
//      return handleResponse<UsuarioExibirDTO[]>(res);
// }

// --- LÓGICA DA PÁGINA ---

const USUARIO_ID = typeof window !== 'undefined' ? Number(localStorage.getItem('usuarioId') || '1') : 1;

const MOCK_NOME_PROJETO = 'Aerocode';

interface Card {
  id: number;
  nomeProjeto: string;
  tituloSessao: string;
  descricao: string;
  inicio: string;
  fim: string;
  tipoAtividade: string;
  dataLancamento: string;
  justificativa?: string;
}

function calcularTotal(inicio: string, fim: string): number {
  if (!inicio || !fim) return 0;
  const [hI, mI] = inicio.substring(0, 5).split(':').map(Number);
  const [hF, mF] = fim.substring(0, 5).split(':').map(Number);
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

// LANÇAMENTOS retroativos exigem justificativa 
function isRetroativo(data: string): boolean {
  return data !== '' && data < hojeISO();
}

// MODAL
const cardInicial = {
  nomeProjeto: '',
  tituloSessao: '',
  descricao: '',
  inicio: '',
  fim: '',
  tipoAtividade: '',
  dataLancamento: hojeISO(), // PADRÃO: hoje
  justificativa: '',
};

// TELA de celular (largura <= 480px)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 480);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function Page() {
  const router = useRouter();
  const isMobile = useIsMobile();

  const [cards, setCards] = useState<Card[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarCards = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await filtrarHoras({ usuarioId: USUARIO_ID, estado: 'PENDENTE' });

      const comDados: Card[] = dados.map((h) => ({
        id: Number(h.id),
        nomeProjeto: MOCK_NOME_PROJETO, 
        tituloSessao: h.tituloSessao,
        descricao: h.descricao || '',
        inicio: h.inicio.substring(0, 5),   
        fim: h.fim.substring(0, 5),
        tipoAtividade: h.tipoAtividade,
        dataLancamento: h.dataLancamento,
        justificativa: h.justificativa || '',
      }));
      setCards(comDados);
    } catch (e) {
      setErro('Não foi possível carregar os registros.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarCards();
  }, []);

  // ENVIA registro para aprovação
  const enviar = async (id: number) => {
    try {
      await enviarParaAprovacao(id);
      await carregarCards(); 
    } catch (e) {
      alert('Erro ao enviar registro para aprovação.');
    }
  };

  // MODAL de criação/edição
  const [modalAberto, setModalAberto] = useState(false);
  const [cardEditando, setCardEditando] = useState<Card | null>(null); // NULL = novo registro
  const [form, setForm] = useState(cardInicial);
  const [salvando, setSalvando] = useState(false);

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

  const salvar = async () => {
    if (isRetroativo(form.dataLancamento) && !form.justificativa?.trim()) return;
    if (!form.tipoAtividade) return;

    try {
      setSalvando(true);

      if (cardEditando) {
        await editarHora({
          id: cardEditando.id,
          tituloSessao: form.tituloSessao,
          descricao: form.descricao,
          tipoAtividade: form.tipoAtividade as TipoAtividade,
          dataLancamento: form.dataLancamento,
          inicio: form.inicio,
          fim: form.fim,
          justificativa: form.justificativa,
        });
      } else {
        await criarHora({
          usuarioId: USUARIO_ID,
          tituloSessao: form.tituloSessao,
          descricao: form.descricao,
          tipoAtividade: form.tipoAtividade as TipoAtividade,
          dataLancamento: form.dataLancamento,
          inicio: form.inicio,
          fim: form.fim,
          justificativa: form.justificativa,
        });
      }
      fecharModal();
      await carregarCards(); 
    } catch (e) {
      alert('Erro ao salvar registro.');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id: number) => {
    try {
      await excluirHora(id);
      await carregarCards();
    } catch (e) {
      alert('Erro ao excluir registro.');
    }
  };

  // FILTROS 
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

  const gridColunas = isMobile
    ? '1fr auto'
    : '1fr 100px 100px 110px 120px 100px';

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

      {/* HORAS semanal e mensal */}
      <div className={styles.semanaHeader}>
        <div className={styles.semanaHeaderInfo}>
          <span className={styles.semanaData}>17 Fevereiro 2025</span>
          <div className={styles.semanaDivider} />
          {/* Total calculado dinamicamente com base nos cards filtrados */}
          <span className={styles.semanaStat}>Semana: <strong>{formatarHoras(totalGeral)}</strong></span>
          <div className={styles.semanaDivider} />
          {/* TODO: total mensal ainda é mockado */}
          <span className={styles.semanaStat}>Mês: <strong>51h 30min</strong></span>
        </div>
        <div className={styles.semanaHeaderFiltros}>
          {/* FILTRO por projeto */}
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
          {/* FILTRO por data de lançamento */}
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
        {!isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: gridColunas, padding: '0 20px 8px', gap: '10px', fontSize: '11px', fontWeight: 700, color: '#0A4FA8', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1.5px solid #E8EFF9', marginBottom: '10px' }}>
            <span style={{ textAlign: 'left' }}>Atividade</span>
            <span>Início</span>
            <span>Fim</span>
            <span>Total</span>
            <span>Lançamento</span>
            <span>Ações</span>
          </div>
        )}

        {carregando && (
          <p style={{ color: '#0A4FA8', padding: '16px 0', fontSize: '13px' }}>Carregando...</p>
        )}

        {erro && (
          <p style={{ color: '#C0392B', padding: '16px 0', fontSize: '13px' }}>{erro}</p>
        )}

        {!carregando && !erro && cardsFiltrados.length === 0 && (
          <p style={{ color: '#0A4FA8', padding: '16px 0', fontSize: '13px' }}>Nenhum registro pendente.</p>
        )}

        {/* CARDS */}
        {cardsFiltrados.map((card) => (
          <div key={card.id} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px 20px', display: 'grid', gridTemplateColumns: gridColunas, alignItems: 'center', gap: '10px', marginBottom: '8px', border: '1.5px solid #E8EFF9', boxShadow: '0 1px 4px rgba(1,38,67,0.05)' }}>
            <div>
              <div className={styles.cardBreadcrumb}>{card.nomeProjeto}</div>
              <div className={styles.cardTitulo}>{card.tituloSessao}</div>
              <div className={styles.cardTags}>
                <span className={styles.cardTag}>{card.descricao}</span>
                <span className={styles.cardTag}>{card.tipoAtividade}</span>
              </div>
              {/* CELULAR */}
              {isMobile && (
                <div style={{ fontSize: '12px', color: '#0A4FA8', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span>{card.inicio} – {card.fim}</span>
                  <span>·</span>
                  <span>{formatarHoras(calcularTotal(card.inicio, card.fim))}</span>
                  <span>·</span>
                  <span>{formatarData(card.dataLancamento)}</span>
                </div>
              )}
            </div>

            {/* DESKTOP */}
            {!isMobile && (
              <>
                <div className={styles.cardHorario}>{card.inicio}</div>
                <div className={styles.cardHorario}>{card.fim}</div>
                <div className={styles.cardTotal}>{formatarHoras(calcularTotal(card.inicio, card.fim))}</div>
                <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#0A4FA8' }}>{formatarData(card.dataLancamento)}</div>
              </>
            )}

            {/* AÇÕES do card: editar, excluir e enviar para aprovação */}
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

            {/* DATA — não permite datas futuras */}
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

            {/* AVISO de data retroativa */}
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

            {/* CAMPOS de texto */}
            {(['nomeProjeto', 'tituloSessao', 'descricao'] as const).map((campo) => (
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

            {/* CAMPOS de horário */}
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
                disabled={salvando}
                style={{
                  ...btnSalvar,
                  opacity: (retroativo && !form.justificativa?.trim()) || !form.tipoAtividade ? 0.5 : 1,
                }}
              >
                {salvando ? 'Salvando...' : 'Salvar'}
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