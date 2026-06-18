'use client';
import { useState, useEffect } from 'react';
import styles from '../App.module.css';
import { useRouter } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_APONTAMENTO_API_URL || 'http://localhost:8084';
const PROJETO_URL = process.env.NEXT_PUBLIC_PROJETO_API_URL || 'http://localhost:8082';
const TASK_URL = process.env.NEXT_PUBLIC_TASK_API_URL || 'http://localhost:8085';

export type EstadoHora = 'PENDENTE' | 'AGUARDANDO_APROVACAO' | 'APROVADO' | 'REJEITADO';

export interface HorasExibirDTO {
  id: number;
  tarefaId: number | null;
  usuarioId: number;
  tituloSessao: string;
  tipoAtividade: string;
  descricao: string | null;
  dataLancamento: string;
  dataFim: string | null;
  inicio: string;
  fim: string;
  justificativa: string | null;
  motivoRejeicao: string | null;
  estado: EstadoHora;
  dataCriacao: string;
}

export interface HorasCadastrarDTO {
  usuarioId: number;
  tarefaId?: number | null;
  tituloSessao: string;
  tipoAtividade: string;
  descricao?: string;
  dataLancamento: string;
  dataFim?: string;
  inicio: string;
  fim: string;
  justificativa?: string;
}

export interface HorasAtualizarDTO {
  id: number;
  tarefaId?: number | null;
  tituloSessao: string;
  tipoAtividade: string;
  descricao?: string;
  dataLancamento: string;
  dataFim?: string;
  inicio: string;
  fim: string;
  justificativa?: string;
}

export interface HorasFiltroParams {
  usuarioId?: number;
  estado?: EstadoHora;
  dataInicio?: string;
  dataFim?: string;
}

interface ProjetoExibirDTO {
  id: number;
  nome: string;
}

interface TarefaExibirDTO {
  id: number;
  nome: string;
  idProjeto: number;
  idResponsaveis: number[];
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const erro = await res.text();
    throw new Error(erro || `Erro ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function filtrarHoras(params: HorasFiltroParams): Promise<HorasExibirDTO[]> {
  const query = new URLSearchParams();
  if (params.usuarioId !== undefined) query.append('usuarioId', String(params.usuarioId));
  if (params.estado) query.append('estado', params.estado);
  if (params.dataInicio) query.append('dataInicio', params.dataInicio);
  if (params.dataFim) query.append('dataFim', params.dataFim);
  const res = await fetch(`${BASE_URL}/horas/filtrar?${query.toString()}`);
  return handleResponse<HorasExibirDTO[]>(res);
}

export async function criarHora(dto: HorasCadastrarDTO): Promise<HorasExibirDTO> {
  const res = await fetch(`${BASE_URL}/horas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  return handleResponse<HorasExibirDTO>(res);
}

export async function editarHora(dto: HorasAtualizarDTO): Promise<HorasExibirDTO> {
  const res = await fetch(`${BASE_URL}/horas/editar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  return handleResponse<HorasExibirDTO>(res);
}

export async function excluirHora(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/horas/${id}`, { method: 'DELETE' });
  return handleResponse<void>(res);
}

export async function enviarParaAprovacao(id: number): Promise<HorasExibirDTO> {
  const res = await fetch(`${BASE_URL}/horas/${id}/enviar`, { method: 'PATCH' });
  return handleResponse<HorasExibirDTO>(res);
}

export async function buscarProjetos(): Promise<ProjetoExibirDTO[]> {
  const res = await fetch(`${PROJETO_URL}/projeto`);
  return handleResponse<ProjetoExibirDTO[]>(res);
}

export async function buscarProjetosPorProfissional(usuarioId: number): Promise<ProjetoExibirDTO[]> {
  const res = await fetch(`${PROJETO_URL}/projeto/profissional/${usuarioId}`);
  return handleResponse<ProjetoExibirDTO[]>(res);
}

export async function buscarTarefa(tarefaId: number): Promise<TarefaExibirDTO> {
  const res = await fetch(`${TASK_URL}/tarefas/${tarefaId}`);
  return handleResponse<TarefaExibirDTO>(res);
}

export async function buscarTarefasPorFuncionario(usuarioId: number): Promise<TarefaExibirDTO[]> {
  const res = await fetch(`${TASK_URL}/tarefas/funcionario/${usuarioId}`);
  return handleResponse<TarefaExibirDTO[]>(res);
}



function getUserIdFromToken(): number {
  if (typeof window === 'undefined') return 0;
  const id = localStorage.getItem('usuarioId');
  if (id) return Number(id);
  const token = localStorage.getItem('token');
  if (!token) return 0;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Number(payload.id || payload.userId || payload.sub || 0);
  } catch {
    return 0;
  }
}

const OPCOES_TITULO: { value: string; label: string }[] = [
  { value: 'ANALISE', label: 'Análise' },
  { value: 'DESENVOLVIMENTO', label: 'Desenvolvimento' },
  { value: 'TESTES', label: 'Testes' },
  { value: 'CORRECAO_BUG', label: 'Correção de Bug' },
  { value: 'FEATURE', label: 'Feature' },
];

interface Card {
  id: number;
  nomeProjeto: string;
  projetoId: number | null;
  tarefaId: number | null;
  tarefaNome?: string;
  tituloSessao: string;
  descricao: string;
  inicio: string;
  fim: string;
  tipoAtividade: string;
  dataLancamento: string;
  dataFim: string;
  justificativa?: string;
}

function parseDateTime(data: string, hora: string): Date | null {
  if (!data || !hora) return null;
  const dateTime = new Date(`${data}T${hora}:00`);
  return Number.isNaN(dateTime.getTime()) ? null : dateTime;
}

function calcularTotal(inicio: string, fim: string, dataInicio: string, dataFim: string): number {
  const inicioDate = parseDateTime(dataInicio, inicio);
  const fimDate = parseDateTime(dataFim || dataInicio, fim);
  if (!inicioDate || !fimDate) return 0;
  const diffMinutos = Math.round((fimDate.getTime() - inicioDate.getTime()) / 60000);
  return diffMinutos > 0 ? diffMinutos : 0;
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
  const today = new Date();
  const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
}

function isRetroativo(data: string): boolean {
  return data !== '' && data < hojeISO();
}

const cardInicial = {
  projetoId: '',
  tituloSessao: '',
  descricao: '',
  inicio: '',
  fim: '',
  tipoAtividade: '',
  dataLancamento: hojeISO(),
  dataFim: hojeISO(),
  justificativa: '',
};

function ontemISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
}

const cardsMock: Card[] = [
  {
    id: -1,
    nomeProjeto: 'Automanager',
    projetoId: null,
    tarefaId: null,
    tarefaNome: undefined,
    tituloSessao: 'DESENVOLVIMENTO',
    descricao: 'Implementação do módulo de vendas',
    inicio: '08:00',
    fim: '12:00',
    tipoAtividade: 'DESENVOLVIMENTO',
    dataLancamento: hojeISO(),
    dataFim: hojeISO(),
    justificativa: '',
  },
  {
    id: -2,
    nomeProjeto: 'Automanager',
    projetoId: null,
    tarefaId: null,
    tarefaNome: undefined,
    tituloSessao: 'CORRECAO_BUG',
    descricao: 'Ajuste no obterVendasPorPeriodo',
    inicio: '13:00',
    fim: '15:30',
    tipoAtividade: 'CORRECAO_BUG',
    dataLancamento: hojeISO(),
    dataFim: hojeISO(),
    justificativa: '',
  },
  {
    id: -3,
    nomeProjeto: 'Automanager',
    projetoId: null,
    tarefaId: null,
    tarefaNome: undefined,
    tituloSessao: 'TESTES',
    descricao: 'Testes de integração dos microsserviços',
    inicio: '09:00',
    fim: '11:00',
    tipoAtividade: 'TESTES',
    dataLancamento: ontemISO(),
    dataFim: ontemISO(),
    justificativa: '',
  },
];

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

  const [usuarioId, setUsuarioId] = useState<number>(0);
  const [projetos, setProjetos] = useState<ProjetoExibirDTO[]>([]);
  const [tarefas, setTarefas] = useState<TarefaExibirDTO[]>([]);
  const [cards, setCards] = useState<Card[]>(cardsMock);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarCards = async (uid: number) => {
    try {
      setCarregando(true);
      setErro(null);
      const [dados, tarefasDoUsuario, projetosDoUsuario] = await Promise.all([
        filtrarHoras({ usuarioId: uid, estado: 'PENDENTE' }),
        buscarTarefasPorFuncionario(uid),
        buscarProjetosPorProfissional(uid),
      ]);
      setTarefas(tarefasDoUsuario);
      setProjetos(projetosDoUsuario);

      const comDados: Card[] = dados.map((h) => {
        const tarefa = h.tarefaId ? tarefasDoUsuario.find(t => t.id === h.tarefaId) : undefined;
        const projeto = tarefa ? projetosDoUsuario.find(p => p.id === tarefa.idProjeto) : undefined;
        return {
          id: Number(h.id),
          nomeProjeto: projeto?.nome || '-',
          projetoId: projeto?.id ?? null,
          tarefaId: h.tarefaId,
          tarefaNome: tarefa?.nome ?? undefined,
          tituloSessao: h.tituloSessao,
          descricao: h.descricao || '',
          inicio: h.inicio.substring(0, 5),
          fim: h.fim.substring(0, 5),
          tipoAtividade: h.tipoAtividade,
          dataLancamento: h.dataLancamento,
          dataFim: h.dataFim || h.dataLancamento,
          justificativa: h.justificativa || '',
        };
      });
      setCards([...cardsMock, ...comDados]);
    } catch (e) {
      setErro('Não foi possível carregar os registros.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const uid = getUserIdFromToken();
    setUsuarioId(uid);
    carregarCards(uid);
  }, []);

  const enviar = async (id: number) => {
    try {
      await enviarParaAprovacao(id);
      router.push('/controleHoras/aguardando-aprovacao');
    } catch (e) {
      alert('Erro ao enviar registro para aprovação.');
    }
  };

  const [modalAberto, setModalAberto] = useState(false);
  const [cardEditando, setCardEditando] = useState<Card | null>(null);
  const [form, setForm] = useState(cardInicial);
  const [salvando, setSalvando] = useState(false);

  const abrirModalNovo = () => {
    setCardEditando(null);
    setForm(cardInicial);
    setModalAberto(true);
  };

  const abrirModalEdicao = (card: Card) => {
    setCardEditando(card);
    const tarefaAtual = card.tarefaId ? tarefas.find(t => t.id === card.tarefaId) : undefined;
    const projetoAtual = card.projetoId ? projetos.find(p => p.id === card.projetoId) : tarefaAtual ? projetos.find(p => p.id === tarefaAtual.idProjeto) : undefined;
    setForm({
      projetoId: projetoAtual?.id ? String(projetoAtual.id) : card.projetoId ? String(card.projetoId) : '',
      tituloSessao: card.tituloSessao,
      descricao: card.descricao,
      inicio: card.inicio,
      fim: card.fim,
      tipoAtividade: card.tarefaId ? String(card.tarefaId) : '',
      dataLancamento: card.dataLancamento,
      dataFim: card.dataFim || card.dataLancamento,
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
    if (!form.dataLancamento) { alert('Informe a data de início.'); return; }
    if (!form.dataFim) { alert('Informe a data de fim.'); return; }
    if (form.dataFim < form.dataLancamento) { alert('A data de fim não pode ser anterior à data de início.'); return; }
    if (form.dataFim > hojeISO()) { alert('A data de fim não pode ser futura.'); return; }
    if (form.dataFim === hojeISO() && form.fim) {
      const agora = new Date();
      const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
      if (form.fim > horaAtual) { alert('O horário de fim não pode ser futuro.'); return; }
    }
    if (form.dataFim === form.dataLancamento && form.inicio && form.fim && form.fim <= form.inicio) {
      alert('O horário de fim deve ser posterior ao início quando as datas são iguais.');
      return;
    }
    if (isRetroativo(form.dataLancamento) && !form.justificativa?.trim()) return;
    if (!form.tipoAtividade) { alert('Selecione uma atividade.'); return; }
    if (!form.tituloSessao) { alert('Selecione o título da sessão.'); return; }

    try {
      setSalvando(true);
      if (cardEditando) {
        await editarHora({
          id: cardEditando.id,
          tarefaId: form.tipoAtividade ? Number(form.tipoAtividade) : null,
          tituloSessao: form.tituloSessao,
          descricao: form.descricao,
          tipoAtividade: form.tituloSessao,
          dataLancamento: form.dataLancamento,
          dataFim: form.dataFim,
          inicio: form.inicio,
          fim: form.fim,
          justificativa: form.justificativa,
        });
      } else {
        await criarHora({
          usuarioId: usuarioId,
          tarefaId: form.tipoAtividade ? Number(form.tipoAtividade) : null,
          tituloSessao: form.tituloSessao,
          descricao: form.descricao,
          tipoAtividade: form.tituloSessao,
          dataLancamento: form.dataLancamento,
          dataFim: form.dataFim,
          inicio: form.inicio,
          fim: form.fim,
          justificativa: form.justificativa,
        });
      }
      fecharModal();
      await carregarCards(usuarioId);
    } catch (e) {
      alert('Erro ao salvar registro.');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id: number) => {
    try {
      await excluirHora(id);
      await carregarCards(usuarioId);
    } catch (e) {
      alert('Erro ao excluir registro.');
    }
  };

  const [filtroProjeto, setFiltroProjeto] = useState('');
  const [filtroData, setFiltroData] = useState('');

  const cardsFiltrados = cards.filter(c => {
    const matchProjeto = filtroProjeto === '' || String(c.projetoId) === filtroProjeto;
    const matchData = filtroData === '' || c.dataLancamento === filtroData;
    return matchProjeto && matchData;
  });

  const totalGeral = cardsFiltrados.reduce(
    (acc, c) => acc + calcularTotal(c.inicio, c.fim, c.dataLancamento, c.dataFim), 0
  );

  const mesAtual = hojeISO().substring(0, 7);
  const totalMensal = cards
    .filter(c => c.dataLancamento.startsWith(mesAtual))
    .reduce((acc, c) => acc + calcularTotal(c.inicio, c.fim, c.dataLancamento, c.dataFim), 0);

  const retroativo = isRetroativo(form.dataLancamento);
  const gridColunas = isMobile ? '1fr auto' : '1fr 100px 100px 110px 120px 100px';

  return (
    <div className={styles.page}>
      <div className={styles.filtros}>
        <button className={`${styles.filtroBtn} ${styles.filtroBtnAtivo}`}>Entrada/Saída</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/aguardando-aprovacao')}>Aguardando aprovação</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/aprovados')}>Aprovados</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/rejeitados')}>Rejeitados</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/historico')}>Histórico</button>
      </div>

      <div className={styles.semanaHeader}>
        <div className={styles.semanaHeaderInfo}>
          <span className={styles.semanaData}>{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <div className={styles.semanaDivider} />
          <span className={styles.semanaStat}>Semana: <strong>{formatarHoras(totalGeral)}</strong></span>
          <div className={styles.semanaDivider} />
          <span className={styles.semanaStat}>Mês: <strong>{formatarHoras(totalMensal)}</strong></span>        </div>
        <div className={styles.semanaHeaderFiltros}>
          <select
            className={styles.filtroSelect}
            value={filtroProjeto}
            onChange={e => setFiltroProjeto(e.target.value)}
          >
            <option value="">Todos os projetos</option>
            {projetos.map(p => (
              <option key={p.id} value={String(p.id)}>{p.nome}</option>
            ))}
          </select>
          <input
            className={styles.filtroData}
            type="date"
            max={hojeISO()}
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

        {carregando && <p style={{ color: '#0A4FA8', padding: '16px 0', fontSize: '13px' }}>Carregando...</p>}
        {erro && <p style={{ color: '#C0392B', padding: '16px 0', fontSize: '13px' }}>{erro}</p>}
        {!carregando && !erro && cardsFiltrados.length === 0 && (
          <p style={{ color: '#0A4FA8', padding: '16px 0', fontSize: '13px' }}>Nenhum registro pendente.</p>
        )}

        {cardsFiltrados.map((card) => (
          <div key={card.id} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px 20px', display: 'grid', gridTemplateColumns: gridColunas, alignItems: 'center', gap: '10px', marginBottom: '8px', border: '1.5px solid #E8EFF9', boxShadow: '0 1px 4px rgba(1,38,67,0.05)' }}>
            <div>
              <div className={styles.cardBreadcrumb}>{card.nomeProjeto}</div>
              <div className={styles.cardTitulo}>{card.tituloSessao}</div>
              <div className={styles.cardTags}>
                <span className={styles.cardTag}>{card.descricao}</span>
                <span className={styles.cardTag}>{card.tipoAtividade}</span>
              </div>
              {isMobile && (
                <div style={{ fontSize: '12px', color: '#0A4FA8', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span>{card.inicio} – {card.fim}</span>
                  <span>·</span>
                  <span>{formatarHoras(calcularTotal(card.inicio, card.fim, card.dataLancamento, card.dataFim))}</span>
                  <span>·</span>
                  <span>{formatarData(card.dataLancamento)}</span>
                </div>
              )}
            </div>

            {!isMobile && (
              <>
                <div className={styles.cardHorario}>{card.inicio}</div>
                <div className={styles.cardHorario}>{card.fim}</div>
                <div className={styles.cardTotal}>{formatarHoras(calcularTotal(card.inicio, card.fim, card.dataLancamento, card.dataFim))}</div>
                <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#0A4FA8' }}>{formatarData(card.dataLancamento)}</div>
              </>
            )}

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
              <label style={labelStyle}>Projeto</label>
              <select
                style={inputStyle}
                value={form.projetoId}
                onChange={e => setForm(prev => ({ ...prev, projetoId: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {projetos.map(p => (
                  <option key={p.id} value={String(p.id)}>{p.nome}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Atividade</label>
              <select
                style={inputStyle}
                value={form.tipoAtividade}
                onChange={e => setForm(prev => ({ ...prev, tipoAtividade: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {form.tipoAtividade && !tarefas.some(t => String(t.id) === form.tipoAtividade) && (
                  <option value={form.tipoAtividade}>Selecionado: {tarefas.find(t => String(t.id) === form.tipoAtividade)?.nome || 'Tarefa atual'}</option>
                )}
                {tarefas
                  .filter(t => !form.projetoId || String(t.idProjeto) === form.projetoId)
                  .map(t => (
                    <option key={t.id} value={String(t.id)}>{t.nome}</option>
                  ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Título da sessão</label>
              <select
                style={inputStyle}
                value={form.tituloSessao}
                onChange={e => setForm(prev => ({ ...prev, tituloSessao: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {form.tituloSessao && !OPCOES_TITULO.some(o => o.value === form.tituloSessao) && (
                  <option value={form.tituloSessao}>Selecionado: {form.tituloSessao}</option>
                )}
                {OPCOES_TITULO.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Descrição</label>
              <input
                style={inputStyle}
                type="text"
                value={form.descricao}
                onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Data de início</label>
              <input
                style={inputStyle}
                type="date"
                max={hojeISO()}
                value={form.dataLancamento}
                onChange={e => {
                  const novaDataInicio = e.target.value;
                  setForm(prev => ({
                    ...prev,
                    dataLancamento: novaDataInicio,
                    dataFim: prev.dataFim && prev.dataFim >= novaDataInicio ? prev.dataFim : novaDataInicio,
                    justificativa: '',
                  }));
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Data de fim</label>
              <input
                style={inputStyle}
                type="date"
                min={form.dataLancamento}
                max={hojeISO()}
                value={form.dataFim}
                onChange={e => setForm(prev => ({ ...prev, dataFim: e.target.value }))}
              />
            </div>

            {retroativo && (
              <div style={{ marginBottom: '12px', background: '#FFF8E1', borderRadius: '8px', padding: '10px 12px' }}>
                <span style={{ fontSize: '12px', color: '#E65100', fontWeight: 600 }}>
                  Lançamento retroativo — aguardará aprovação do Gerente
                </span>
              </div>
            )}

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
              Total: <strong style={{ color: '#012643' }}>{formatarHoras(calcularTotal(form.inicio, form.fim, form.dataLancamento, form.dataFim))}</strong>
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
                  opacity: (retroativo && !form.justificativa?.trim()) || !form.tipoAtividade || !form.tituloSessao ? 0.5 : 1,
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