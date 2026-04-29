'use client';
import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

const USUARIO_ID = typeof window !== 'undefined' ? Number(localStorage.getItem('usuarioId') || '1') : 1;

type Status = 'To Do' | 'Doing' | 'Done';

type BloqueioAtivo = {
    id: number;
    categoriaImpedimento: string;
    descricaoImpedimento: string;
    dataInicio: string;
};

type Tarefa = {
    id: number;
    nome: string;
    descricao: string;
    projetoId: number;
    nomeProjeto: string;
    status: Status;
    bloqueada: boolean;
    bloqueioAtivo: BloqueioAtivo | null;
};

type Projeto = {
    id: number;
    nome: string;
};

const CATEGORIAS = [
    'Erro de Analista',
    'Aguardando Cliente',
    'Problema Técnico',
    'Dúvida de Negócio',
    'Outro',
];

// DADOS mockados — remover após integração com backend
const MOCK_PROJETOS: Projeto[] = [
    { id: 1, nome: 'Projeto X' },
    { id: 2, nome: 'Projeto Y' },
];

const MOCK_TAREFAS: Tarefa[] = [
    {
        id: 1,
        nome: 'Tarefa A',
        descricao: 'Descrição breve da tarefa A',
        projetoId: 1,
        nomeProjeto: 'Projeto X',
        status: 'Doing',
        bloqueada: false,
        bloqueioAtivo: null,
    },
    {
        id: 2,
        nome: 'Tarefa B',
        descricao: 'Descrição breve da tarefa B',
        projetoId: 2,
        nomeProjeto: 'Projeto Y',
        status: 'Doing',
        bloqueada: true,
        bloqueioAtivo: {
            id: 10,
            categoriaImpedimento: 'Aguardando Cliente',
            descricaoImpedimento: '',
            dataInicio: '2026-04-01T10:00:00',
        },
    },
    {
        id: 3,
        nome: 'Tarefa C',
        descricao: 'Descrição breve da tarefa C',
        projetoId: 1,
        nomeProjeto: 'Projeto X',
        status: 'To Do',
        bloqueada: false,
        bloqueioAtivo: null,
    },
];

function formatarDataHora(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function Page() {
    /*
     * TODO: Integração — Listar tarefas do Profissional
     * Substituir useState(MOCK_TAREFAS) por chamada real no useEffect:
     *
     * GET /tarefas?responsavelId={USUARIO_ID}
     * Headers: Authorization: Bearer {token}
     * Response 200: Tarefa[]
     * {
     *   "id": number,
     *   "nome": string,
     *   "descricao": string,
     *   "projetoId": number,
     *   "nomeProjeto": string,
     *   "status": "To Do" | "Doing" | "Done",
     *   "bloqueada": boolean,
     *   "bloqueioAtivo": {
     *     "id": number,
     *     "categoriaImpedimento": string,
     *     "descricaoImpedimento": string,
     *     "dataInicio": "2026-04-01T10:00:00"
     *   } | null
     * }
     * Obs: retornar APENAS tarefas onde responsavel_id = USUARIO_ID autenticado
     */
    const [tarefas, setTarefas] = useState<Tarefa[]>(MOCK_TAREFAS);

    const [projetos] = useState<Projeto[]>(MOCK_PROJETOS);

    const [filtroProjeto, setFiltroProjeto] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');

    // MODAL bloqueio
    const [modalBloqueio, setModalBloqueio] = useState(false);
    const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
    const [categoriaSelected, setCategoriaSelected] = useState('');
    const [textoOutro, setTextoOutro] = useState('');
    const [salvando, setSalvando] = useState(false);

    const tarefasFiltradas = tarefas.filter((t) => {
        const matchProjeto = filtroProjeto === '' || String(t.projetoId) === filtroProjeto;
        const matchStatus = filtroStatus === '' || t.status === filtroStatus;
        return matchProjeto && matchStatus;
    });

    const abrirModalBloqueio = (tarefa: Tarefa) => {
        setTarefaSelecionada(tarefa);
        setCategoriaSelected('');
        setTextoOutro('');
        setModalBloqueio(true);
    };

    const fecharModalBloqueio = () => {
        setModalBloqueio(false);
        setTarefaSelecionada(null);
        setCategoriaSelected('');
        setTextoOutro('');
    };

    const confirmarBloqueio = async () => {
        if (!tarefaSelecionada) return;
        if (!categoriaSelected) return;
        if (categoriaSelected === 'Outro' && !textoOutro.trim()) return;

        setSalvando(true);
        try {
            /*
             * TODO: Integração — Bloquear Tarefa
             * POST /tarefas/{id}/bloquear
             * Headers: Authorization: Bearer {token}
             * Body:
             * {
             *   "categoriaImpedimento": "Erro de Analista" | "Aguardando Cliente" | "Problema Técnico" | "Dúvida de Negócio" | "Outro",
             *   "descricaoImpedimento": string  // obrigatório se for Outro
             * }
             * Response 200:
             * {
             *   "id": number,       
             *   "tarefaId": number,
             *   "categoriaImpedimento": string,
             *   "descricaoImpedimento": string,
             *   "dataInicio": string   
             * }
             * Obs: backend registra dataInicio automaticamente e notifica o Gestor responsável
             */
            const agora = new Date().toISOString(); // remover após integração
            setTarefas((prev) =>
                prev.map((t) =>
                    t.id === tarefaSelecionada.id
                        ? {
                            ...t,
                            bloqueada: true,
                            status: t.status,
                            bloqueioAtivo: {
                                id: Date.now(), // remover após integração
                                categoriaImpedimento: categoriaSelected,
                                descricaoImpedimento: textoOutro,
                                dataInicio: agora, // remover após integração 
                            },
                        }
                        : t
                )
            );
            fecharModalBloqueio();
        } catch {
            alert('Erro ao bloquear tarefa.');
        } finally {
            setSalvando(false);
        }
    };

    const desbloquear = async (tarefa: Tarefa) => {
        try {
            /*
             * TODO: Integração — Desbloquear Tarefa
             * PATCH /tarefas/{id}/desbloquear
             * Headers: Authorization: Bearer {token}
             * Body: (vazio)
             * Response 200:
             * {
             *   "tarefaId": number,
             *   "bloqueioId": number,
             *   "dataFim": string,       // registrado automaticamente
             *   "tempoBloqueio": number  // minutos
             * }
             * Obs: backend calcula e registra data_fim e tempo_bloqueio em bloqueio_tarefa
             */
            setTarefas((prev) =>
                prev.map((t) =>
                    t.id === tarefa.id
                        ? { ...t, bloqueada: false, bloqueioAtivo: null }
                        : t
                )
            );
        } catch {
            alert('Erro ao desbloquear tarefa.');
        }
    };

    const podeCofirmarBloqueio =
        categoriaSelected !== '' &&
        (categoriaSelected !== 'Outro' || textoOutro.trim() !== '');

    return (
        <div className={styles.container}>
            <h2 className={styles.titulo}>Minhas Tarefas</h2>

            {/* FILTROS */}
            <div className={styles.menuContainer}>
                <div className={styles.filtros}>
                    <select
                        value={filtroProjeto}
                        onChange={(e) => setFiltroProjeto(e.target.value)}
                    >
                        <option value="">Projeto ▾</option>
                        {projetos.map((p) => (
                            <option key={p.id} value={String(p.id)}>
                                {p.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.filtros}>
                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                    >
                        <option value="">Status ▾</option>
                        <option value="To Do">To Do</option>
                        <option value="Doing">Doing</option>
                        <option value="Done">Done</option>
                    </select>
                </div>

                {(filtroProjeto !== '' || filtroStatus !== '') && (
                    <button
                        className={styles.btnLimpar}
                        onClick={() => { setFiltroProjeto(''); setFiltroStatus(''); }}
                    >
                        Limpar
                    </button>
                )}
            </div>

            <div className={styles.tabelaContainer}>
                <table className={styles.tabela}>
                    <thead>
                        <tr>
                            <th>Nome da Tarefa</th>
                            <th>Descrição</th>
                            <th>Projeto</th>
                            <th>Status</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tarefasFiltradas.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ color: '#71717a', fontSize: '14px' }}>
                                    Nenhuma tarefa encontrada.
                                </td>
                            </tr>
                        )}
                        {tarefasFiltradas.map((tarefa) => (
                            <tr
                                key={tarefa.id}
                                className={tarefa.bloqueada ? styles.linhaBloqueada : ''}
                            >
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {tarefa.bloqueada && (
                                            <span className={styles.badgeBloqueada}>⚠ BLOQUEADA</span>
                                        )}
                                        <span>{tarefa.nome}</span>
                                        {tarefa.bloqueada && tarefa.bloqueioAtivo && (
                                            <span className={styles.infoBloqueio}>
                                                Categoria: {tarefa.bloqueioAtivo.categoriaImpedimento} | Desde: {formatarDataHora(tarefa.bloqueioAtivo.dataInicio)}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>{tarefa.descricao}</td>
                                <td>{tarefa.nomeProjeto}</td>
                                <td>
                                    <span
                                        className={`${styles.statusBadge} ${tarefa.status === 'To Do'
                                            ? styles.statusToDo
                                            : tarefa.status === 'Doing'
                                                ? styles.statusDoing
                                                : styles.statusDone
                                            }`}
                                    >
                                        {tarefa.status}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.acoes}>
                                        {tarefa.bloqueada ? (
                                            <button
                                                className={styles.btnDesbloquear}
                                                onClick={() => desbloquear(tarefa)}
                                            >
                                                Desbloquear Tarefa
                                            </button>
                                        ) : (
                                            <button
                                                className={styles.btnBloquear}
                                                onClick={() => abrirModalBloqueio(tarefa)}
                                            >
                                                Bloquear Tarefa
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalBloqueio && tarefaSelecionada && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalConteudo}>
                        <button className={styles.botaoFecharModal} onClick={fecharModalBloqueio}>
                            ×
                        </button>

                        <p className={styles.modalTitulo}>Categorizar Bloqueio</p>
                        <p className={styles.modalSubtitulo}>
                            Selecione a categoria do impedimento *
                        </p>

                        <div className={styles.listaCategorias}>
                            {CATEGORIAS.map((cat) => (
                                <label key={cat} className={styles.opcaoCategoria}>
                                    <input
                                        type="radio"
                                        name="categoria"
                                        value={cat}
                                        checked={categoriaSelected === cat}
                                        onChange={() => {
                                            setCategoriaSelected(cat);
                                            if (cat !== 'Outro') setTextoOutro('');
                                        }}
                                    />
                                    {cat}
                                </label>
                            ))}
                        </div>

                        {categoriaSelected === 'Outro' && (
                            <textarea
                                className={styles.campoOutro}
                                placeholder="Descreva o impedimento (obrigatório se Outro) *"
                                value={textoOutro}
                                onChange={(e) => setTextoOutro(e.target.value)}
                            />
                        )}

                        <div className={styles.botoes}>
                            <button className={styles.cancelar} onClick={fecharModalBloqueio}>
                                Cancelar
                            </button>
                            <button
                                className={styles.confirmar}
                                onClick={confirmarBloqueio}
                                disabled={!podeCofirmarBloqueio || salvando}
                            >
                                {salvando ? 'Confirmando...' : 'Confirmar Bloqueio'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
