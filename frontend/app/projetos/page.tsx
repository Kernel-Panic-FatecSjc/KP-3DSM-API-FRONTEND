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
        const response = await axios.get("http://localhost:8082/projeto");

        console.log(response.data);

        setProjetos(response.data);
      } catch (error: any) {
        console.log(error.response);
        console.log(error.message);
        console.log(error);
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "EM_PLANEJAMENTO":
        return "Em planejamento";

      case "EM_ANDAMENTO":
        return "Em andamento";

      case "CONCLUIDO":
        return "Concluído";

      default:
        return status;
    }
  };

  const formatPrazo = (prazo: string) => {
    const data = new Date(prazo);

    const horas = data.getHours();
    const minutos = data.getMinutes();

    const dataFormatada = data.toLocaleDateString("pt-BR");

    if (minutos === 0) {
      return `${dataFormatada} às ${horas}hrs`;
    }

    return `${dataFormatada} às ${horas}hrs ${minutos}min`;
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
    const updated = projetos.filter(
      (p) => p.id !== projetoEditando.id
    );

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

      <div className={styles.grid}>
        {projetos.length === 0 ? (
          <p>Nenhum projeto encontrado.</p>
        ) : (
          projetos.map((projeto) => (
            <div
              key={projeto.id}
              className={styles.card}
            >
              <div
                className={styles.statusBar}
                style={{
                  backgroundColor: getStatusColor(projeto.status),
                }}
              />

              <div className={styles.header}>
                <h2>{projeto.nome}</h2>

                <button
                  className={styles.editBtn}
                  onClick={() => openModal(projeto)}
                >
                  Editar
                </button>
              </div>

              <p className={styles.descricao}>
                {projeto.descricao}
              </p>

              <div className={styles.info}>
                <span>
                  <strong>ID:</strong> {projeto.id}
                </span>

                <span>
                  <strong>Status:</strong>{" "}
                  {getStatusLabel(projeto.status)}
                </span>

                <span>
                  <strong>Prazo:</strong>{" "}
                  {projeto.prazo
                    ? formatPrazo(projeto.prazo)
                    : "-"}
                </span>

                <span>
                  <strong>Valor:</strong> R${" "}
                  {projeto.valorContratado}
                </span>

                <span>
                  <strong>Criação:</strong>{" "}
                  {projeto.dataCriacao
                    ? formatPrazo(projeto.dataCriacao)
                    : "-"}
                </span>
              </div>

              <select
                className={styles.select}
                value={projeto.status}
                onChange={(e) =>
                  handleStatusChange(
                    projeto.id,
                    e.target.value
                  )
                }
              >
                <option value="EM_PLANEJAMENTO">
                  Em planejamento
                </option>

                <option value="EM_ANDAMENTO">
                  Em andamento
                </option>

                <option value="CONCLUIDO">
                  Concluído
                </option>
              </select>
            </div>
          ))
        )}
      </div>

      {modalOpen && projetoEditando && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Editar Projeto</h2>

            <label>Nome</label>

            <input
              type="text"
              value={projetoEditando.nome}
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  nome: e.target.value,
                })
              }
              placeholder="Ex: Site Institucional"
            />

            <label>Descrição</label>

            <textarea
              value={projetoEditando.descricao}
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  descricao: e.target.value,
                })
              }
              placeholder="Descreva o objetivo do projeto..."
            />

            <label>Status</label>

            <select
              value={projetoEditando.status}
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  status: e.target.value,
                })
              }
            >
              <option value="EM_PLANEJAMENTO">
                Em planejamento
              </option>

              <option value="EM_ANDAMENTO">
                Em andamento
              </option>

              <option value="CONCLUIDO">
                Concluído
              </option>
            </select>

            <label>Prazo</label>

            <input
              type="datetime-local"
              value={
                projetoEditando.prazo?.slice(0, 16) || ""
              }
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  prazo: e.target.value,
                })
              }
            />

            <label>Valor contratado (R$)</label>

            <input
              type="number"
              value={projetoEditando.valorContratado}
              onChange={(e) =>
                setProjetoEditando({
                  ...projetoEditando,
                  valorContratado: Number(
                    e.target.value
                  ),
                })
              }
              placeholder="Ex: 15000"
            />

            <label>Data de criação</label>

            <input
              type="text"
              value={
                projetoEditando.dataCriacao
                  ? formatPrazo(
                      projetoEditando.dataCriacao
                    )
                  : ""
              }
              disabled
            />

            {confirmandoDelete && (
              <div className={styles.deleteConfirm}>
                <p>
                  Tem certeza que deseja excluir{" "}
                  <strong>
                    {projetoEditando.nome}
                  </strong>
                  ?
                </p>

                <div
                  className={
                    styles.deleteConfirmActions
                  }
                >
                  <button
                    className={
                      styles.cancelDeleteBtn
                    }
                    onClick={() =>
                      setConfirmandoDelete(false)
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    className={
                      styles.confirmDeleteBtn
                    }
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
                onClick={() =>
                  setConfirmandoDelete(true)
                }
              >
                Excluir
              </button>

              <div
                className={
                  styles.modalActionsRight
                }
              >
                <button onClick={handleCloseModal}>
                  Cancelar
                </button>

                <button onClick={handleSave}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}