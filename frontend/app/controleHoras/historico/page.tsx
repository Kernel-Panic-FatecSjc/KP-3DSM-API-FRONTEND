'use client';
import { useState, useEffect } from 'react';
import styles from '../App.module.css';
import { useRouter } from 'next/navigation';
import { buscarProjetos, buscarUsuarios } from '../entrada-saida/page';

// --- INTEGRAÇÃO COM O BACKEND ---
const BASE_URL = process.env.NEXT_PUBLIC_APONTAMENTO_API_URL || 'http://localhost:8080';

export type EstadoHora = 'PENDENTE' | 'AGUARDANDO_APROVACAO' | 'APROVADO' | 'REJEITADO';

export interface HorasExibirDTO {
  id: number;
  tarefaId: number | null;
  projetoId: number | null;
  usuarioId: number;
  tituloSessao: string;
  tipoAtividade: string;
  descricao: string | null;
  dataLancamento: string;
  inicio: string;
  fim: string;
  justificativa: string | null;
  motivoRejeicao: string | null;
  estado: EstadoHora;
  dataCriacao: string;
}

export interface HorasFiltroParams {
  usuarioId?: number;
  estado?: EstadoHora;
  dataInicio?: string;
  dataFim?: string;
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

interface Card {
  id: number;
  nomeProjeto: string;
  projetoId: number | null;
  responsavel: string;
  tituloSessao: string;
  descricao: string;
  tipoAtividade: string;
  inicio: string;
  fim: string;
  dataLancamento: string;
  estado: EstadoHora;
}

const ESTADO_LABEL: Record<EstadoHora, string> = {
  PENDENTE: 'Pendente',
  AGUARDANDO_APROVACAO: 'Ag. Aprovação',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
};

const ESTADO_COR: Record<EstadoHora, string> = {
  PENDENTE: '#6B7280',
  AGUARDANDO_APROVACAO: '#D97706',
  APROVADO: '#16A34A',
  REJEITADO: '#DC2626',
};

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

  const [cardsAPI, setCardsAPI] = useState<Card[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroProjeto, setFiltroProjeto] = useState('');
  const [filtroData, setFiltroData] = useState('');

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        setErro(null);

        const uid = Number(localStorage.getItem('usuarioId') || '0');
        const [dados, projetos, usuarios] = await Promise.all([
          filtrarHoras({ usuarioId: uid }),
          buscarProjetos(),
          buscarUsuarios(),
        ]);

        const comDados: Card[] = dados.map((h) => {
          const projeto = projetos.find(p => p.id === h.projetoId);
          const usuario = usuarios.find(u => u.id === h.usuarioId);

          return {
            id: Number(h.id),
            nomeProjeto: projeto?.nome ?? '-',
            projetoId: h.projetoId,
            responsavel: usuario?.nome ?? String(h.usuarioId),
            tituloSessao: h.tituloSessao,
            descricao: h.descricao || '',
            tipoAtividade: h.tipoAtividade,
            inicio: h.inicio.substring(0, 5),
            fim: h.fim.substring(0, 5),
            dataLancamento: h.dataLancamento,
            estado: h.estado,
          };
        });
        setCardsAPI(comDados);
      } catch (e) {
        console.error(e);
        setErro('Não foi possível carregar os registros.');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const cards = cardsAPI;

  const projetos = cards.filter(
    (card, index, lista) => card.projetoId !== null && lista.findIndex(c => c.projetoId === card.projetoId) === index
  );

  const cardsFiltrados = cards.filter(c => {
    const matchProjeto = filtroProjeto === '' || String(c.projetoId) === filtroProjeto;
    const matchData = filtroData === '' || c.dataLancamento === filtroData;
    return matchProjeto && matchData;
  });

  const totalGeral = cardsFiltrados.reduce((acc, c) => acc + calcularTotal(c.inicio, c.fim), 0);

  const mesAtual = new Date().toISOString().substring(0, 7);
  const totalMensal = cards
    .filter(c => c.dataLancamento.startsWith(mesAtual))
    .reduce((acc, c) => acc + calcularTotal(c.inicio, c.fim), 0);

  const gridColunas = isMobile ? '1fr' : '1fr 100px 100px 110px 120px 110px';

  return (
    <div className={styles.page}>
      {/* OPÇÕES de filtro */}
      <div className={styles.filtros}>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/entrada-saida')}>Entrada/Saída</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/aguardando-aprovacao')}>Aguardando aprovação</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/aprovados')}>Aprovados</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/rejeitados')}>Rejeitados</button>
        <button className={`${styles.filtroBtn} ${styles.filtroBtnAtivo}`}>Histórico</button>
      </div>

      {/* HORAS semanal e mensal */}
      <div className={styles.semanaHeader}>
        <div className={styles.semanaHeaderInfo}>
          <span className={styles.semanaData}>{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <div className={styles.semanaDivider} />
          <span className={styles.semanaStat}>Semana: <strong>{formatarHoras(totalGeral)}</strong></span>
          <div className={styles.semanaDivider} />
          <span className={styles.semanaStat}>Mês: <strong>{formatarHoras(totalMensal)}</strong></span>
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
              <option key={p.projetoId} value={String(p.projetoId)}>{p.nomeProjeto}</option>
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
            <span>Estado</span>
          </div>
        )}

        {carregando && (
          <p style={{ color: '#0A4FA8', padding: '16px 0', fontSize: '13px' }}>Carregando...</p>
        )}

        {erro && (
          <p style={{ color: '#C0392B', padding: '16px 0', fontSize: '13px' }}>{erro}</p>
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
                <span className={styles.cardTag}>{card.responsavel}</span>
              </div>
              {/* CELULAR*/}
              {isMobile && (
                <div style={{ fontSize: '12px', color: '#0A4FA8', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span>{card.inicio} – {card.fim}</span>
                  <span>·</span>
                  <span>{formatarHoras(calcularTotal(card.inicio, card.fim))}</span>
                  <span>·</span>
                  <span>{formatarData(card.dataLancamento)}</span>
                  <span>·</span>
                  <span style={{ color: ESTADO_COR[card.estado], fontWeight: 600 }}>{ESTADO_LABEL[card.estado]}</span>
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
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: ESTADO_COR[card.estado], background: `${ESTADO_COR[card.estado]}18`, borderRadius: '6px', padding: '3px 8px' }}>
                    {ESTADO_LABEL[card.estado]}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
