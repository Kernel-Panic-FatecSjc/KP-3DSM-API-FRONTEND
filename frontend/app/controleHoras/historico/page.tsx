'use client';
import { useState, useEffect } from 'react';
import styles from '../App.module.css';
import { useRouter } from 'next/navigation';
import {
  filtrarHoras,
  buscarUsuarioPorId,
} from '../../services/controleHoras';

// usuarioId fixo até o auth estar integrado
const USUARIO_ID = 1;

// nomeProjeto mockado até tarefa-service + projeto-service estarem integrados
const MOCK_NOME_PROJETO = 'Aerocode';

interface Card {
  id: number;
  nomeProjeto: string;
  tituloSessao: string;
  descricao: string;
  responsavel: string;
  inicio: string;
  fim: string;
  dataLancamento: string;
}

const cardsMockados: Card[] = [
  {
    id: -1,
    nomeProjeto: 'Aerocode',
    tituloSessao: 'Reunião de planejamento',
    descricao: 'Frontend',
    responsavel: 'José Ricardo',
    inicio: '08:00',
    fim: '10:00',
    dataLancamento: '2025-02-17',
  },
  {
    id: -2,
    nomeProjeto: 'Aerocode',
    tituloSessao: 'Implementação de tela de login',
    descricao: 'Frontend',
    responsavel: 'Daniele',
    inicio: '09:30',
    fim: '12:00',
    dataLancamento: '2025-02-17',
  },
  {
    id: -3,
    nomeProjeto: 'Aerocode',
    tituloSessao: 'Modelagem do banco de dados',
    descricao: 'Backend',
    responsavel: 'Frida',
    inicio: '13:00',
    fim: '15:30',
    dataLancamento: '2025-02-10',
  },
  {
    id: -4,
    nomeProjeto: 'Aerocode',
    tituloSessao: 'Revisão de pull requests',
    descricao: 'Backend',
    responsavel: 'Hanna',
    inicio: '14:00',
    fim: '16:00',
    dataLancamento: '2025-02-10',
  },
  {
    id: -5,
    nomeProjeto: 'Aerocode',
    tituloSessao: 'Testes de integração',
    descricao: 'QA',
    responsavel: 'José Ricardo',
    inicio: '16:00',
    fim: '17:30',
    dataLancamento: '2025-02-03',
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

export default function Page() {
  const router = useRouter();

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
        // historico = todos os apontamentos do usuário sem filtro de estado
        const dados = await filtrarHoras({ usuarioId: USUARIO_ID });
        const comDados: Card[] = await Promise.all(
          dados.map(async (h) => {
            let responsavel = '';
            try {
              const usuario = await buscarUsuarioPorId(h.usuarioId);
              responsavel = usuario.nome;
            } catch {
              responsavel = String(h.usuarioId);
            }
            return {
              id: Number(h.id),
              nomeProjeto: MOCK_NOME_PROJETO, // substituir quando tarefa-service + projeto-service estiverem integrados
              tituloSessao: h.tituloSessao,
              descricao: h.descricao || '',
              responsavel,
              inicio: h.inicio.substring(0, 5),
              fim: h.fim.substring(0, 5),
              dataLancamento: h.dataLancamento,
            };
          })
        );
        setCardsAPI(comDados);
      } catch {
        setErro('Não foi possível carregar os registros.');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const cards = [...cardsAPI, ...cardsMockados];
  const projetos = Array.from(new Set(cards.map(c => c.nomeProjeto)));

  const cardsFiltrados = cards.filter(c => {
    const matchProjeto = filtroProjeto === '' || c.nomeProjeto === filtroProjeto;
    const matchData = filtroData === '' || c.dataLancamento === filtroData;
    return matchProjeto && matchData;
  });

  const totalGeral = cardsFiltrados.reduce((acc, c) => acc + calcularTotal(c.inicio, c.fim), 0);

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
