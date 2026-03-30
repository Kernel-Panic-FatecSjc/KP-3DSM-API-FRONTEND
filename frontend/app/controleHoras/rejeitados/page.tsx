'use client';

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

const cards: Card[] = [
    {
        id: 1,
        nomeProjeto: 'Aerocode',
        tituloSessao: 'Reunião de planejamento',
        descricao: 'Frontend',
        responsavel: 'José Ricardo',
        inicio: '08:00',
        fim: '10:00',
    },
    {
        id: 2,
        nomeProjeto: 'Aerocode',
        tituloSessao: 'Implementação de tela de login',
        descricao: 'Frontend',
        responsavel: 'Daniele',
        inicio: '09:30',
        fim: '12:00',
    },
];

export default function Page() {
    const router = useRouter();

    const totalGeral = cards
        .reduce((acc, c) => acc + calcularTotal(c.inicio, c.fim), 0);

    return (
        <div className={styles.page}>
            {/* OPÇÕES de filtro */}
            <div className={styles.filtros}>
                <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/entrada-saida')}>Entrada/Saída</button>
                <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/aguardando-aprovacao')}>Aguardando aprovação</button>
                <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/aprovados')}>Aprovados</button>
                <button className={`${styles.filtroBtn} ${styles.filtroBtnAtivo}`}>Rejeitados</button>
                <button className={styles.filtroBtn} onClick={() => router.push('/controleHoras/historico')}>Histórico</button>
            </div>

            {/* HORAS semanal e mensal */}
            <div className={styles.semanaHeader}>
                <span className={styles.semanaData}>17 Fevereiro 2025</span>
                <div className={styles.semanaDivider} />
                <span className={styles.semanaStat}>Semana: <strong>{formatarHoras(totalGeral)}</strong></span>
                <div className={styles.semanaDivider} />
                <span className={styles.semanaStat}>Mês: <strong>51h 30min</strong></span>
            </div>


            <div className={styles.cardWrapper}>
                {/* ATIVIDADES - inicio, fim e total */}
                <div className={styles.tabelaHeader}>
                    <span className={styles.colAtividade}>Atividade</span>
                    <span>Início</span>
                    <span>Fim</span>
                    <span>Total</span>
                </div>
                {/* CARDS */}
                {cards.length === 0 && (
                    <p style={{ color: '#0A4FA8', padding: '16px 0', fontSize: '13px' }}>
                        Nenhum registro rejeitado.
                    </p>
                )}
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className={styles.card}
                    >
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
                    </div>
                ))}
            </div>
        </div>
    );
}