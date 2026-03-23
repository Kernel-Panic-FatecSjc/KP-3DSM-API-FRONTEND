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

const cardInicial = {
  nomeProjeto: '',
  tituloSessao: '',
  descricao: '',
  responsavel: '',
  inicio: '',
  fim: '',
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
    },
    {
      id: 2,
      nomeProjeto: 'Aerocode',
      tituloSessao: 'Desenvolvimento de componentes',
      descricao: 'Frontend',
      responsavel: 'Daniele',
      inicio: '10:00',
      fim: '12:00',
    },
  ]);

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
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCardEditando(null);
    setForm(cardInicial);
  };

  const salvar = () => {
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

  const totalGeral = cards.reduce((acc, c) => acc + calcularTotal(c.inicio, c.fim), 0);

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
        <span className={styles.semanaData}>17 Fevereiro 2025</span>
        <div className={styles.semanaDivider} />
        <span className={styles.semanaStat}>Semana: <strong>{formatarHoras(totalGeral)}</strong></span>
        <div className={styles.semanaDivider} />
        <span className={styles.semanaStat}>Mês: <strong>51h 30min</strong></span>
      </div>

      <div className={styles.cardWrapper}>
        <div className={styles.tabelaHeader}>
          <span className={styles.colAtividade}>Atividade</span>
          <span>Início</span>
          <span>Fim</span>
          <span>Total</span>
        </div>

        {cards.map((card) => (
          <div key={card.id} className={styles.card}>
            <div>
              <div className={styles.cardBreadcrumb}>{card.nomeProjeto}</div>
              <div className={styles.cardTitulo}>{card.tituloSessao}</div>
              <div className={styles.cardTags}>
                <span className={styles.cardTag}>{card.descricao}</span>
                <span className={styles.cardTag}>{card.responsavel}</span>
              </div>
              <div className={styles.cardAcoes}>
                <button className={styles.btnEditar} onClick={() => abrirModalEdicao(card)}>Editar</button>
                <button className={styles.btnExcluir} onClick={() => excluir(card.id)}>Excluir</button>
              </div>
            </div>
            <div className={styles.cardHorario}>{card.inicio}</div>
            <div className={styles.cardHorario}>{card.fim}</div>
            <div className={styles.cardTotal}>{formatarHoras(calcularTotal(card.inicio, card.fim))}</div>
          </div>
        ))}

        {/* BOTÃO CORRIGIDO */}
        <button className={styles.btnAdicionar} onClick={abrirModalNovo}>+</button>
      </div>

      {modalAberto && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ color: '#012643', marginBottom: '16px', fontFamily: 'Roboto, sans-serif' }}>
              {cardEditando ? 'Editar registro' : 'Novo registro'}
            </h3>

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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={fecharModal} style={btnCancelar}>Cancelar</button>
              <button onClick={salvar} style={btnSalvar}>Salvar</button>
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
  fontFamily: 'Roboto", sans-serif',
};