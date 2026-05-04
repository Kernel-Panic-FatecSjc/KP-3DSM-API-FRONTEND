"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./App.module.css";

export default function Page() {
  const [projetos, setProjetos] = useState<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [projetoEditando, setProjetoEditando] = useState<any>(null);
  const [confirmandoDelete, setConfirmandoDelete] = useState(false);

  useEffect(() => {
    const fetchProjetos = async () => {
      try {
        const response = await axios.get("http://localhost:8082/projetos");
        setProjetos(response.data);
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      }
    };

    fetchProjetos();
  }, []);

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
      p.id === id ? { ...p, status: newStatus } : p
    );
    setProjetos(updated);
  };

  const openModal = (projeto: any) => {
    setProjetoEditando(projeto);
    setConfirmandoDelete(false);
    setModalOpen(true);
  };

  const handleSave = () => {
    const updated = projetos.map((p) =>
      p.id === projetoEditando.id ? projetoEditando : p
    );

    setProjetos(updated);
    setModalOpen(false);
    setProjetoEditando(null);
    setConfirmandoDelete(false);
  };

  const handleDelete = () => {
    const updated = projetos.filter((p) => p.id !== projetoEditando.id);
    setProjetos(updated);
    setModalOpen(false);
    setProjetoEditando(null);
    setConfirmandoDelete(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setProjetoEditando(null);
    setConfirmandoDelete(false);
  };

  return (
    <div className={styles.container}>
      <h1>Projetos</h1>

      {/* GRID DE PROJETOS */}
      <div className={styles.grid}>
        {projetos.length === 0 ? (
          <p>Nenhum projeto encontrado.</p>
        ) : (
          projetos.map((projeto) => (
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
                  {projeto.prazo
                    ? new Date(projeto.prazo).toLocaleString()
                    : "-"}
                </span>

                <span>
                  <strong>Valor:</strong> R$ {projeto.valor_contratado}
                </span>

                <span>
                  <strong>Responsável:</strong> {projeto.responsavelId}
                </span>

                <span>
                  <strong>Criação:</strong>{" "}
                  {projeto.dataCriacao
                    ? new Date(projeto.dataCriacao).toLocaleString()
                    : "-"}
                </span>
              </div>

              <select
                className={styles.select}
                value={projeto.status}
                onChange={(e) =>
                  handleStatusChange(projeto.id, e.target.value)
                }
              >
                <option value="EM_PLANEJAMENTO">Em planejamento</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {modalOpen && projetoEditando && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Editar Projeto</h2>

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

            <input
              type="datetime-local"
              value={projetoEditando.prazo?.slice(0, 16) || ""}
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  prazo: e.target.value,
                })
              }
            />

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

            <input
              type="number"
              value={projetoEditando.responsavelId}
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  responsavelId: Number(e.target.value),
                })
              }
              placeholder="Responsável ID"
            />

            <input
              type="text"
              value={projetoEditando.dataCriacao || ""}
              disabled
            />

            {/* CONFIRMAÇÃO DE DELETE */}
            {confirmandoDelete && (
              <div className={styles.deleteConfirm}>
                <p>Tem certeza que deseja excluir <strong>{projetoEditando.nome}</strong>? Esta ação não pode ser desfeita.</p>
                <div className={styles.deleteConfirmActions}>
                  <button
                    className={styles.cancelDeleteBtn}
                    onClick={() => setConfirmandoDelete(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className={styles.confirmDeleteBtn}
                    onClick={handleDelete}
                  >
                    Sim, excluir
                  </button>
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.deleteBtn}
                onClick={() => setConfirmandoDelete(true)}
              >
                🗑️ Excluir
              </button>
              <div className={styles.modalActionsRight}>
                <button onClick={handleCloseModal}>Cancelar</button>
                <button onClick={handleSave}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
