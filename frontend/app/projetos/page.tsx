'use client';
import React, { useState } from 'react';
import styles from './App.module.css';

export default function Page() {
    const [projetos, setProjetos] = useState([
        {
            id: '001',
            nome: 'Sistema de Vendas',
            descricao: 'Projeto para gerenciamento de vendas online',
            prazo: '2026-04-15',
            dataCriacao: '2026-03-01',
            status: 'fazer'
        },
        {
            id: '002',
            nome: 'App Mobile',
            descricao: 'Aplicativo mobile para clientes',
            prazo: '2026-05-10',
            dataCriacao: '2026-03-10',
            status: 'doing'
        },
        {
            id: '003',
            nome: 'Dashboard Admin',
            descricao: 'Painel administrativo com métricas',
            prazo: '2026-06-01',
            dataCriacao: '2026-03-20',
            status: 'done'
        }
    ]);

    const getStatusColor = (status:any) => {
        switch (status) {
            case 'fazer':
                return '#9CA3AF';
            case 'doing':
                return '#3B82F6';
            case 'done':
                return '#10B981';
            default:
                return '#9CA3AF';
        }
    };

    const handleStatusChange = (id:any, newStatus:any) => {
        const updated = projetos.map((p) =>
            p.id === id ? { ...p, status: newStatus } : p
        );
        setProjetos(updated);
    };

    return (
        <div className={styles.container}>
            <h1>Projetos</h1>

            <div className={styles.grid}>
                {projetos.map((projeto) => (
                    <div key={projeto.id} className={styles.card}>
                        <div
                            className={styles.statusBar}
                            style={{ backgroundColor: getStatusColor(projeto.status) }}
                        />

                        <div className={styles.header}>
                            <h2>{projeto.nome}</h2>

                            <button className={styles.editBtn}>
                                ✏️
                            </button>
                        </div>

                        <p className={styles.descricao}>{projeto.descricao}</p>

                        <select
                            className={styles.select}
                            value={projeto.status}
                            onChange={(e) =>
                                handleStatusChange(projeto.id, e.target.value)
                            }
                        >
                            <option value="fazer">A fazer</option>
                            <option value="doing">Em produção</option>
                            <option value="done">Feito</option>
                        </select>

                        <div className={styles.info}>
                            <span><strong>ID:</strong> {projeto.id}</span>
                            <span><strong>Prazo:</strong> {projeto.prazo}</span>
                            <span><strong>Criação:</strong> {projeto.dataCriacao}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}