"use client";

import React, { useState } from "react";
import styles from "./App.module.css";

export default function Page() {
  const [projetos, setProjetos] = useState([
    {
      id: 1,
      nome: "Sistema de Gestão de Tarefas",
      descricao:
        "Aplicação para organizar tarefas diárias com status e prazos.",
      status: "EM_ANDAMENTO",
      prazo: "2026-05-10T00:00:00",
      valor_contratado: 15000.0,
      responsavelId: 2,
      dataCriacao: "2026-04-20T10:30:00",
    },
    {
      id: 2,
      nome: "E-commerce de Eletrônicos",
      descricao: "Loja virtual com catálogo de produtos e carrinho de compras.",
      status: "EM_PLANEJAMENTO",
      prazo: "2026-06-01T00:00:00",
      valor_contratado: 45000.0,
      responsavelId: 1,
      dataCriacao: "2026-04-18T09:15:00",
    },
    {
      id: 3,
      nome: "API de Controle Financeiro",
      descricao: "API para gerenciamento de receitas e despesas pessoais.",
      status: "CONCLUIDO",
      prazo: "2026-04-30T00:00:00",
      valor_contratado: 22000.0,
      responsavelId: 3,
      dataCriacao: "2026-03-15T14:00:00",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [projetoEditando, setProjetoEditando] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EM_PLANEJAMENTO":
        return "#9CA3AF";
      case "EM_ANDAMENTO":
        return "#3B82F6";
      case "CONCLUIDO":
        return "#10B981";
      default:
        return "#9CA3AF";
    }
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    const updated = projetos.map((p) =>
      p.id === id ? { ...p, status: newStatus } : p,
    );
    setProjetos(updated);
  };

  const openModal = (projeto: any) => {
    setProjetoEditando(projeto);
    setModalOpen(true);
  };

  const handleSave = () => {
    const updated = projetos.map((p) =>
      p.id === projetoEditando.id ? projetoEditando : p,
    );

    setProjetos(updated);
    setModalOpen(false);
    setProjetoEditando(null);
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

              <button
                className={styles.editBtn}
                onClick={() => openModal(projeto)}
              >
                ✏️
              </button>
            </div>

            <p className={styles.descricao}>{projeto.descricao}</p>

            <div className={styles.info}>
              <span>
                <strong>ID:</strong> {projeto.id}
              </span>

              <span>
                <strong>Status:</strong> {projeto.status}
              </span>

              <span>
                <strong>Prazo:</strong>{" "}
                {new Date(projeto.prazo).toLocaleString()}
              </span>

              <span>
                <strong>Valor:</strong> R$ {projeto.valor_contratado}
              </span>

              <span>
                <strong>Responsável:</strong> {projeto.responsavelId}
              </span>

              <span>
                <strong>Criação:</strong>{" "}
                {new Date(projeto.dataCriacao).toLocaleString()}
              </span>
            </div>

            <select
              className={styles.select}
              value={projeto.status}
              onChange={(e) => handleStatusChange(projeto.id, e.target.value)}
            >
              <option value="EM_PLANEJAMENTO">Em planejamento</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>
          </div>
        ))}
      </div>

      {modalOpen && projetoEditando && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Editar Projeto</h2>

            {/* Nome */}
            <input
              type="text"
              value={projetoEditando.nome}
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  nome: e.target.value,
                })
              }
              placeholder="Nome do projeto"
            />

            {/* Descrição */}
            <textarea
              value={projetoEditando.descricao}
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  descricao: e.target.value,
                })
              }
              placeholder="Descrição"
            />

            {/* Status ENUM */}
            <select
              value={projetoEditando.status}
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  status: e.target.value,
                })
              }
            >
              <option value="EM_PLANEJAMENTO">Em planejamento</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>

            {/* Prazo (TIMESTAMP) */}
            <input
              type="datetime-local"
              value={projetoEditando.prazo?.slice(0, 16)}
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  prazo: e.target.value,
                })
              }
            />

            {/* Valor contratado */}
            <input
              type="number"
              value={projetoEditando.valor_contratado}
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  valor_contratado: Number(e.target.value),
                })
              }
              placeholder="Valor contratado"
            />

            {/* Responsável ID */}
            <input
              type="number"
              value={projetoEditando.responsavelId}
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  responsavelId: Number(e.target.value),
                })
              }
              placeholder="ID do responsável"
            />

            {/* Data criação (somente leitura) */}
            <input type="text" value={projetoEditando.dataCriacao} disabled />

            {/* Ações */}
            <div className={styles.modalActions}>
              <button onClick={() => setModalOpen(false)}>Cancelar</button>
              <button onClick={handleSave}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
