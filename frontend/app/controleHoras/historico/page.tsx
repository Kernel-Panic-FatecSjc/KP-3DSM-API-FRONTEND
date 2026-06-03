'use client';
import { useState, useEffect } from 'react';
import styles from '../App.module.css';
import { useRouter } from 'next/navigation';

// --- INTEGRAÇÃO COM O BACKEND ---
const AUDITORIA_URL = process.env.NEXT_PUBLIC_APONTAMENTO_API_URL ? `${process.env.NEXT_PUBLIC_APONTAMENTO_API_URL}/auditoria` : 'http://localhost:8084/auditoria';

export interface AuditoriaHoraDTO {
  id: number;
  horaId: number | null;
  alteradoPorId: number | null;
  alteradoPorNome: string | null;
  usuarioId: number | null;
  usuarioNome: string | null;
  projetoId: number | null;
  projetoNome: string | null;
  campo: string;
  valorAnterior: string | null;
  valorNovo: string | null;
  dataAlteracao: string;
}

export interface HistoricoFiltroParams {
  usuarioId?: number;
  projetoId?: number;
  campo?: string;
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

export async function filtrarHistorico(params: HistoricoFiltroParams): Promise<AuditoriaHoraDTO[]> {
  const query = new URLSearchParams();
  if (params.usuarioId !== undefined) query.append('usuarioId', String(params.usuarioId));
  if (params.projetoId !== undefined) query.append('projetoId', String(params.projetoId));
  if (params.campo) query.append('campo', params.campo);
  if (params.dataInicio) query.append('dataInicio', params.dataInicio);
  if (params.dataFim) query.append('dataFim', params.dataFim);
  query.append('page', '0');
  query.append('size', '1000');

  const res = await fetch(`${AUDITORIA_URL}?${query.toString()}`);
  const json = await handleResponse<any>(res);
  if (Array.isArray(json)) return json;
  return json.content ?? [];
}

const MOCK_NOME_PROJETO = 'Aerocode';

interface Card {
  id: number;
  projetoNome: string;
  status: string;
  dataAlteracao: string;
  alteradoPor: string;
}

function formatarData(data: string): string {
  if (!data) return '';
  const parsed = new Date(data);
  if (Number.isNaN(parsed.getTime())) return data;
  return parsed.toLocaleDateString('pt-BR');
}

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

        const storedUserId = localStorage.getItem('usuarioId');
        const usuarioId = storedUserId ? Number(storedUserId) : undefined;
        const dados = await filtrarHistorico({ usuarioId, campo: 'estado' });
        const apenasEstado = dados.filter((h) => h.campo === 'estado');

        const comDados: Card[] = apenasEstado.map((h) => ({
          id: Number(h.id),
          projetoNome: h.projetoNome || MOCK_NOME_PROJETO,
          status: h.valorNovo || '-',
          dataAlteracao: h.dataAlteracao.split('T')[0],
          alteradoPor: h.alteradoPorNome || h.usuarioNome || 'Desconhecido',
        }));
        setCardsAPI(comDados);
      } catch {
        setErro('Não foi possível carregar os registros.');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const cards = cardsAPI;
  const projetos = Array.from(new Set(cards.map(c => c.projetoNome)));

  const cardsFiltrados = cards.filter(c => {
    const matchProjeto = filtroProjeto === '' || c.projetoNome === filtroProjeto;
    const matchData = filtroData === '' || c.dataAlteracao === filtroData;
    return matchProjeto && matchData;
  });

  const totalGeral = cardsFiltrados.length;
  const mesAtual = new Date().toISOString().substring(0, 7);
  const totalMensal = cards.filter(c => c.dataAlteracao.startsWith(mesAtual)).length;

  const gridColunas = isMobile ? "1fr" : "1fr 160px 170px";

  function labelStatus(status: string) {
    if (status === 'APROVADO') return { label: 'Aprovado', bg: '#e6f7ed', color: '#1a9c5f' };
    if (status === 'REJEITADO') return { label: 'Reprovado', bg: '#FADADD', color: '#C0392B' };
    return { label: status, bg: '#E8EFF9', color: '#0A4FA8' };
  }

  return (
    <div className={styles.page}>
      <div className={styles.filtros}>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/entrada-saida')}>Entrada/Saída</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/aguardando-aprovacao')}>Aguardando aprovação</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/aprovados')}>Aprovados</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/rejeitados')}>Rejeitados</button>
        <button className={`${styles.filtroBtn} ${styles.filtroBtnAtivo}`}>Histórico</button>
      </div>

      <div className={styles.semanaHeader}>
        <div className={styles.semanaHeaderInfo}>
          <span className={styles.semanaData}>{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <div className={styles.semanaDivider} />
          <span className={styles.semanaStat}>Registros: <strong>{totalGeral}</strong></span>
          <div className={styles.semanaDivider} />
          <span className={styles.semanaStat}>Mês: <strong>{totalMensal}</strong></span>
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
        {!isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: gridColunas, padding: '0 20px 8px', gap: '10px', fontSize: '11px', fontWeight: 700, color: '#0A4FA8', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1.5px solid #E8EFF9', marginBottom: '10px' }}>
            <span style={{ textAlign: 'left' }}>Projeto</span>
            <span>Status</span>
            <span>Data</span>

          </div>
        )}

        {carregando && <p style={{ color: '#0A4FA8', padding: '16px 0', fontSize: '13px' }}>Carregando...</p>}
        {erro && <p style={{ color: '#C0392B', padding: '16px 0', fontSize: '13px' }}>{erro}</p>}

        {cardsFiltrados.map((card) => {
          const { label, bg, color } = labelStatus(card.status);
          return (
            <div key={card.id} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px 20px', display: 'grid', gridTemplateColumns: gridColunas, alignItems: 'center', gap: '10px', marginBottom: '8px', border: '1.5px solid #E8EFF9', boxShadow: '0 1px 4px rgba(1,38,67,0.05)' }}>
              <div>
                <div className={styles.cardBreadcrumb}>{card.projetoNome}</div>
                {isMobile && (
                  <div style={{ fontSize: '12px', color: '#0A4FA8', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ padding: '2px 10px', borderRadius: '12px', background: bg, color, fontWeight: 600, fontSize: '12px' }}>{label}</span>
                    <span>·</span>
                    <span>{formatarData(card.dataAlteracao)}</span>
                    <span>·</span>
                    <span>{card.alteradoPor}</span>
                  </div>
                )}
              </div>
              {!isMobile && (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ padding: '2px 10px', borderRadius: '12px', background: bg, color, fontWeight: 600, fontSize: '12px' }}>{label}</span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#0A4FA8' }}>{formatarData(card.dataAlteracao)}</div>

                </>
              )}
            </div>
          );
        })}

        {!carregando && !erro && cardsFiltrados.length === 0 && (
          <p style={{ color: '#0A4FA8', padding: '16px 0', fontSize: '13px' }}>
            Nenhum histórico de mudanças de estado encontrado para o filtro atual.
          </p>
        )}
      </div>
    </div>
  );
}