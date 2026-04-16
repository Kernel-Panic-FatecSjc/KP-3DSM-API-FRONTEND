'use client';
import { useState, useEffect } from 'react';
import styles from '../App.module.css';
import { useRouter } from 'next/navigation';
import {
  filtrarHoras,
} from '../../services/controleHoras';

const USUARIO_ID = typeof window !== 'undefined' ? Number(localStorage.getItem('usuarioId') || '1') : 1;

const MOCK_NOME_PROJETO = 'Aerocode';
interface Card {
  id: number;
  nomeProjeto: string;
  tituloSessao: string;
  descricao: string;
  inicio: string;
  fim: string;
  dataLancamento: string;
}

// CARDS mockados 
const cardsMockados: Card[] = [
  {
    id: -1,
    nomeProjeto: 'Aerocode',
    tituloSessao: 'Configuração do ambiente Docker',
    descricao: 'DevOps',
    inicio: '07:30',
    fim: '09:30',
    dataLancamento: '2025-02-17',
  },
  {
    id: -2,
    nomeProjeto: 'Aerocode',
    tituloSessao: 'Desenvolvimento de dashboard',
    descricao: 'Frontend',
    inicio: '10:00',
    fim: '12:30',
    dataLancamento: '2025-02-17',
  },
  {
    id: -3,
    nomeProjeto: 'Aerocode',
    tituloSessao: 'Criação de endpoints REST',
    descricao: 'Backend',
    inicio: '13:30',
    fim: '16:00',
    dataLancamento: '2025-02-10',
  },
  {
    id: -4,
    nomeProjeto: 'Aerocode',
    tituloSessao: 'Documentação da API',
    descricao: 'Backend',
    inicio: '14:00',
    fim: '15:30',
    dataLancamento: '2025-02-10',
  },
];

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
        const dados = await filtrarHoras({ usuarioId: USUARIO_ID, estado: 'APROVADO' });

        const comDados: Card[] = dados.map((h) => ({
          id: Number(h.id),
          nomeProjeto: MOCK_NOME_PROJETO, 
          tituloSessao: h.tituloSessao,
          descricao: h.descricao || '',
          inicio: h.inicio.substring(0, 5),  
          fim: h.fim.substring(0, 5),
          dataLancamento: h.dataLancamento,
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

  // EXIBIR dados da API + dados mockados
  const cards = [...cardsAPI, ...cardsMockados];

  const projetos = Array.from(new Set(cards.map(c => c.nomeProjeto)));

  const cardsFiltrados = cards.filter(c => {
    const matchProjeto = filtroProjeto === '' || c.nomeProjeto === filtroProjeto;
    const matchData = filtroData === '' || c.dataLancamento === filtroData;
    return matchProjeto && matchData;
  });

  const totalGeral = cardsFiltrados.reduce((acc, c) => acc + calcularTotal(c.inicio, c.fim), 0);

  const gridColunas = isMobile ? '1fr' : '1fr 100px 100px 110px 120px';

  return (
    <div className={styles.page}>
      {/* OPÇÕES de filtro */}
      <div className={styles.filtros}>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/entrada-saida')}>Entrada/Saída</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/aguardando-aprovacao')}>Aguardando aprovação</button>
        <button className={`${styles.filtroBtn} ${styles.filtroBtnAtivo}`}>Aprovados</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/rejeitados')}>Rejeitados</button>
        <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/historico')}>Histórico</button>
      </div>

      {/* HORAS semanal e mensal */}
      <div className={styles.semanaHeader}>
        <div className={styles.semanaHeaderInfo}>
          <span className={styles.semanaData}>17 Fevereiro 2025</span>
          <div className={styles.semanaDivider} />
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
          </div>
        ))}
      </div>
    </div>
  );
}
