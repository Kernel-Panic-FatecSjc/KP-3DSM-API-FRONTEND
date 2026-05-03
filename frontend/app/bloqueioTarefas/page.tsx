'use client';
import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

const API_URL = 'http://localhost:8080';

type Status = 'To Do' | 'Doing' | 'Done';

type Tarefa = {
    id: number;
    nome: string;
    descricao: string;
    projetoId: number;
    nomeProjeto: string;
    status: Status;
    bloqueada: boolean;
};

type Projeto = {
    id: number;
    nome: string;
};

export default function Page() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [loading, setLoading] = useState(true);

    const [filtroProjeto, setFiltroProjeto] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');

    // 🔥 BUSCAR DO BACKEND
    useEffect(() => {
        fetch(`${API_URL}/tarefas`)
            .then(res => res.json())
            .then(data => {
                setTarefas(data);
                setLoading(false);
            })
            .catch(() => {
                alert('Erro ao buscar tarefas');
                setLoading(false);
            });
    }, []);

    // 🔥 FILTRO
    const tarefasFiltradas = tarefas.filter((t) => {
        const matchProjeto = filtroProjeto === '' || String(t.projetoId) === filtroProjeto;
        const matchStatus = filtroStatus === '' || t.status === filtroStatus;
        return matchProjeto && matchStatus;
    });

    // 🔥 BLOQUEAR
    const bloquear = async (tarefa: Tarefa) => {
        try {
            await fetch(`${API_URL}/tarefas/${tarefa.id}/bloquear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuarioId: 1,
                    categoria: 'ERRO_TECNICO',
                    descricao: 'Bloqueado pelo front'
                })
            });

            // atualiza local
            setTarefas(prev =>
                prev.map(t =>
                    t.id === tarefa.id
                        ? { ...t, bloqueada: true }
                        : t
                )
            );
        } catch {
            alert('Erro ao bloquear');
        }
    };

    // 🔥 DESBLOQUEAR
    const desbloquear = async (tarefa: Tarefa) => {
        try {
            await fetch(`${API_URL}/tarefas/${tarefa.id}/desbloquear`, {
                method: 'PATCH'
            });

            setTarefas(prev =>
                prev.map(t =>
                    t.id === tarefa.id
                        ? { ...t, bloqueada: false }
                        : t
                )
            );
        } catch {
            alert('Erro ao desbloquear');
        }
    };

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
                        {[...new Set(tarefas.map(t => t.projetoId))].map((id) => (
                            <option key={id} value={id}>
                                Projeto {id}
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
                            <tr>
                                <td colSpan={5}>Carregando...</td>
                            </tr>
                        )}

                        {!loading && tarefasFiltradas.length === 0 && (
                            <tr>
                                <td colSpan={5}>Nenhuma tarefa encontrada</td>
                            </tr>
                        )}

                        {tarefasFiltradas.map((tarefa) => (
                            <tr key={tarefa.id}>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {tarefa.bloqueada && (
                                            <span className={styles.badgeBloqueada}>
                                                ⚠ BLOQUEADA
                                            </span>
                                        )}
                                        {tarefa.nome}
                                    </div>
                                </td>
                                <td>{tarefa.descricao}</td>
                                <td>{tarefa.nomeProjeto}</td>
                                <td>
                                    <span
                                        className={`${styles.statusBadge} ${
                                            tarefa.status === 'To Do'
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
                                    {tarefa.bloqueada ? (
                                        <button
                                            className={styles.btnDesbloquear}
                                            onClick={() => desbloquear(tarefa)}
                                        >
                                            Desbloquear
                                        </button>
                                    ) : (
                                        <button
                                            className={styles.btnBloquear}
                                            onClick={() => bloquear(tarefa)}
                                        >
                                            Bloquear
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}