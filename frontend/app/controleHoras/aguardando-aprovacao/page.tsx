'use client';
import { useState, useEffect } from 'react';
import styles from '../App.module.css';
import { useRouter } from 'next/navigation';
import { filtrarHoras, buscarProjetos, buscarUsuarios } from '../entrada-saida/page';

// usuarioId extraído do JWT
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

interface Card {
  id: number;
  nomeProjeto: string;
  projetoId: number | null;
  tituloSessao: string;
  descricao: string;
  responsavel: string;
  inicio: string;
  fim: string;
  dataLancamento: string;
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

export default function Page() {
  const router = useRouter();

  const [cardsAPI, setCardsAPI] = useState<Card[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroProjeto, setFiltroProjeto] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [totalMes, setTotalMes] = useState(0);

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        const uid = getUserIdFromToken();

        const hoje = new Date();
        const primeiroDia = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
        const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

        const [dados, projetos, usuarios, horasDoMes] = await Promise.all([
          filtrarHoras({ usuarioId: uid, estado: 'AGUARDANDO_APROVACAO' }),
          buscarProjetos(),
          buscarUsuarios(),
          filtrarHoras({ usuarioId: uid, dataInicio: primeiroDia, dataFim: ultimoDia })
        ]);

        const totalMesMinutos = horasDoMes.reduce((acc, h) => {
          return acc + calcularTotal(h.inicio.substring(0, 5), h.fim.substring(0, 5));
        }, 0);
        setTotalMes(totalMesMinutos);

        const comDados: Card[] = dados.map((h) => {
          const projeto = projetos.find(p => p.id === h.projetoId);
          const usuario = usuarios.find(u => u.id === h.usuarioId);

          return {
            id: Number(h.id),
            nomeProjeto: projeto?.nome ?? '-',
            projetoId: h.projetoId,
            tituloSessao: h.tituloSessao,
            descricao: h.descricao || '',
            responsavel: usuario?.nome ?? String(h.usuarioId),
            inicio: h.inicio.substring(0, 5),
            fim: h.fim.substring(0, 5),
            dataLancamento: h.dataLancamento,
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
  const projetosFiltro = cards.filter(
    (card, index, lista) => card.projetoId !== null && lista.findIndex(c => c.projetoId === card.projetoId) === index
  );

  const cardsFiltrados = cards.filter(c => {
    const matchProjeto = filtroProjeto === '' || String(c.projetoId) === filtroProjeto;
    const matchData = filtroData === '' || c.dataLancamento === filtroData;
    return matchProjeto && matchData;
  });

  const totalGeral = cardsFiltrados.reduce((acc, c) => acc + calcularTotal(c.inicio, c.fim), 0);

  return (
    <div className={styles.page}>
      {/* OPÇÕES de filtro */}
      <div className={styles.filtros}>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/entrada-saida')}>Entrada/Saída</button>
        <button className={`${styles.filtroBtn} ${styles.filtroBtnAtivo}`}>Aguardando aprovação</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/aprovados')}>Aprovados</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/rejeitados')}>Rejeitados</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/historico')}>Histórico</button>
      </div>

      {/* HORAS semanal e mensal + filtros de projeto data */}
      <div className={styles.semanaHeader}>
        <div className={styles.semanaHeaderInfo}>
          <span className={styles.semanaData}>17 Fevereiro 2025</span>
          <div className={styles.semanaDivider} />
          <span className={styles.semanaStat}>Semana: <strong>{formatarHoras(totalGeral)}</strong></span>
          <div className={styles.semanaDivider} />
          <span className={styles.semanaStat}>
            Mês: <strong>{formatarHoras(totalMes)}</strong>
          </span>
        </div>
        <div className={styles.semanaHeaderFiltros}>
          <select
            className={styles.filtroSelect}
            value={filtroProjeto}
            onChange={e => setFiltroProjeto(e.target.value)}
          >
            <option value="">Todos os projetos</option>
            {projetosFiltro.map(p => (
              <option key={p.projetoId} value={String(p.projetoId)}>{p.nomeProjeto}</option>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 110px 120px', padding: '0 20px 8px', gap: '10px', fontSize: '11px', fontWeight: 700, color: '#0A4FA8', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1.5px solid #E8EFF9', marginBottom: '10px' }}>
          <span style={{ textAlign: 'left' }}>Atividade</span>
          <span>Início</span>
          <span>Fim</span>
          <span>Total</span>
          <span>Lançamento</span>
        </div>

        {carregando && (
          <p style={{ color: '#0A4FA8', padding: '16px 0', fontSize: '13px' }}>Carregando...</p>
        )}

        {erro && (
          <p style={{ color: '#C0392B', padding: '16px 0', fontSize: '13px' }}>{erro}</p>
        )}

        {/* CARDS */}
        {cardsFiltrados.map((card) => (
          <div key={card.id} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr 100px 100px 110px 120px', alignItems: 'center', gap: '10px', marginBottom: '8px', border: '1.5px solid #E8EFF9', boxShadow: '0 1px 4px rgba(1,38,67,0.05)' }}>
            <div>
              <div className={styles.cardBreadcrumb}>{card.nomeProjeto}</div>
              <div className={styles.cardTitulo}>{card.tituloSessao}</div>
              <div className={styles.cardTags}>
                <span className={styles.cardTag}>{card.descricao}</span>
                <span className={styles.cardTag}>{card.responsavel}</span>
              </div>
            </div>
            <div className={styles.cardHorario}>{card.inicio}</div>
            <div className={styles.cardHorario}>{card.fim}</div>
            <div className={styles.cardTotal}>{formatarHoras(calcularTotal(card.inicio, card.fim))}</div>
            <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#0A4FA8' }}>{formatarData(card.dataLancamento)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
