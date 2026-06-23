'use client';
import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

const API_URL = 'http://localhost:8085';
const PROJETO_URL = 'http://localhost:8082';

type Tarefa = {
    id: number;
    nome: string;
    descricao: string;
    idProjeto: number;
    status: string; // TO_DO | DOING | DONE | BLOCKED
    bloqueada: boolean;
    idResponsaveis?: number[];
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

export default function Page() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [loading, setLoading] = useState(true);

    const [filtroProjeto, setFiltroProjeto] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');

    const [modalBloquear, setModalBloquear] = useState(false);
    const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
    const [categoria, setCategoria] = useState('');
    const [descricaoImpedimento, setDescricaoImpedimento] = useState('');
    const [salvando, setSalvando] = useState(false);

    const carregarTarefas = async (userId: number) => {
        try {
            const res = await fetch(`${API_URL}/tarefas/funcionario/${userId}`);
            const data = await res.json();
            setTarefas(data);
        } catch {
            alert('Erro ao buscar tarefas');
        } finally {
            setLoading(false);
        }
    };

    const carregarProjetos = async () => {
        try {
            const res = await fetch(`${PROJETO_URL}/projeto`);
            const data = await res.json();
            setProjetos((data ?? []).map((p: any) => ({ id: p.id, nome: p.nome ?? `Projeto ${p.id}` })));
        } catch {
            setProjetos([]);
        }
    };

    const [uid, setUid] = useState(0);

    useEffect(() => {
        const usuarioId = Number(localStorage.getItem('usuarioId') || '0');
        setUid(usuarioId);
    }, []);

    useEffect(() => {
        if (uid === 0) return;
        carregarTarefas(uid);
        carregarProjetos();
    }, [uid]);

    const nomeDoProjeto = (id: number) =>
        projetos.find((p) => p.id === id)?.nome ?? `Projeto ${id}`;

    const projetosDropdown = (() => {
        const map = new Map<number, string>();
        tarefas.forEach((t) => {
            if (t.idProjeto != null) map.set(t.idProjeto, `Projeto ${t.idProjeto}`);
        });
        projetos.forEach((p) => map.set(p.id, p.nome));
        return [...map.entries()]
            .map(([id, nome]) => ({ id, nome }))
            .sort((a, b) => a.nome.localeCompare(b.nome));
    })();

    const tarefasFiltradas = tarefas.filter((t) => {
        const matchProjeto = filtroProjeto === '' || String(t.idProjeto) === filtroProjeto;
        const matchStatus = filtroStatus === '' || t.status === filtroStatus;
        return matchProjeto && matchStatus;
    });

    const abrirModalBloquear = (tarefa: Tarefa) => {
        setTarefaSelecionada(tarefa);
        setCategoria('');
        setDescricaoImpedimento('');
        setModalBloquear(true);
    };

    const bloquear = async () => {
        if (!tarefaSelecionada) return;
        if (!categoria) { alert('Selecione uma categoria'); return; }
        if (categoria === 'Outro' && !descricaoImpedimento.trim()) { alert('Informe a descrição'); return; }
        try {
            setSalvando(true);
            const res = await fetch(`${API_URL}/tarefas/${tarefaSelecionada.id}/bloquear`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuarioId: uid,
                    categoria,
                    descricao: descricaoImpedimento
                })
            });
            if (!res.ok) { const msg = await res.text(); throw new Error(msg); }
            setModalBloquear(false);
            await carregarTarefas(uid);
        } catch (err: any) {
            alert(err.message || 'Erro ao bloquear');
        } finally {
            setSalvando(false);
        }
    };

    const desbloquear = async (tarefa: Tarefa) => {
        try {
            const res = await fetch(`${API_URL}/tarefas/${tarefa.id}/desbloquear`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId: uid })
            });
            if (!res.ok) { const msg = await res.text(); throw new Error(msg); }
            await carregarTarefas(uid);
        } catch (err: any) {
            alert(err.message || 'Erro ao desbloquear');
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.titulo}>Minhas Tarefas</h2>

            <div className={styles.menuContainer}>
                <div className={styles.filtros}>
                    <select value={filtroProjeto} onChange={(e) => setFiltroProjeto(e.target.value)}>
                        <option value="">Projeto ▾</option>
                        {projetosDropdown.map((p) => (
                            <option key={String(p.id)} value={String(p.id)}>{p.nome}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filtros}>
                    <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                        <option value="">Status ▾</option>
                        <option value="TO_DO">To Do</option>
                        <option value="DOING">Doing</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>
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
                        {loading && (
                            <tr><td colSpan={5}>Carregando...</td></tr>
                        )}
                        {!loading && tarefasFiltradas.length === 0 && (
                            <tr><td colSpan={5}>Nenhuma tarefa encontrada</td></tr>
                        )}
                        {tarefasFiltradas.map((tarefa) => {
                            const estaBloqueada = tarefa.bloqueada || tarefa.status === 'BLOCKED';
                            return (
                            <tr key={tarefa.id} className={estaBloqueada ? styles.linhaBloqueada : ''}>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {estaBloqueada && (
                                            <span className={styles.badgeBloqueada}>BLOQUEADA</span>
                                        )}
                                        {tarefa.nome}
                                    </div>
                                </td>
                                <td>{tarefa.descricao}</td>
                                <td>{nomeDoProjeto(tarefa.idProjeto)}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${tarefa.status === 'TO_DO' ? styles.statusToDo
                                            : tarefa.status === 'DOING' ? styles.statusDoing
                                                : styles.statusDone
                                        }`}>
                                        {tarefa.status === 'TO_DO' ? 'To Do' : tarefa.status === 'DOING' ? 'Doing' : tarefa.status === 'DONE' ? 'Done' : tarefa.status}
                                    </span>
                                </td>
                                <td>
                                    {estaBloqueada ? (
                                        <button className={styles.btnDesbloquear} onClick={() => desbloquear(tarefa)}>
                                            Desbloquear
                                        </button>
                                    ) : (
                                        <button className={styles.btnBloquear} onClick={() => abrirModalBloquear(tarefa)}>
                                            Bloquear
                                        </button>
                                    )}
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {modalBloquear && tarefaSelecionada && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalConteudo}>
                        <button className={styles.botaoFecharModal} onClick={() => setModalBloquear(false)}>×</button>
                        <h3 className={styles.modalTitulo}>Bloquear Tarefa</h3>
                        <p className={styles.modalSubtitulo}>{tarefaSelecionada.nome}</p>

                        <div className={styles.listaCategorias}>
                            {CATEGORIAS.map((cat) => (
                                <label key={cat} className={styles.opcaoCategoria}>
                                    <input
                                        type="radio"
                                        name="categoria"
                                        value={cat}
                                        checked={categoria === cat}
                                        onChange={() => setCategoria(cat)}
                                    />
                                    {cat}
                                </label>
                            ))}
                        </div>

                        {categoria === 'Outro' && (
                            <textarea
                                className={styles.campoOutro}
                                placeholder="Descreva o impedimento (obrigatório)"
                                value={descricaoImpedimento}
                                onChange={(e) => setDescricaoImpedimento(e.target.value)}
                            />
                        )}

                        <div className={styles.botoes}>
                            <button className={styles.cancelar} onClick={() => setModalBloquear(false)}>Cancelar</button>
                            <button
                                className={styles.confirmar}
                                onClick={bloquear}
                                disabled={salvando || !categoria || (categoria === 'Outro' && !descricaoImpedimento.trim())}
                            >
                                {salvando ? 'Salvando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
