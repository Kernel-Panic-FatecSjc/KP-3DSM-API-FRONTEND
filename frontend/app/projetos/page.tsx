"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./App.module.css";

type Cliente = {
  id: number;
  nome: string;
  cnpj: string;
  ativo: boolean;
  projetoIds: number[];
};

export default function Page() {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [projetoEditando, setProjetoEditando] = useState<any>(null);
  const [confirmandoDelete, setConfirmandoDelete] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");

  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  useEffect(() => {
    const fetchProjetos = async () => {
      try {
        const response = await axios.get("http://localhost:8082/projeto");
        setProjetos(response.data);
      } catch (error: any) {
        console.log(error);
      }
    };

    const fetchUsuarios = async () => {
      try {
        const response = await axios.get("http://localhost:8083/usuario/todos");
        setUsuarios(response.data);
      } catch (error: any) {
        console.log(error);
      }
    };

    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8083/clientes/todos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClientes(response.data);
      } catch (error: any) {
        console.log(error);
      }
    };

    fetchProjetos();
    fetchUsuarios();
    fetchClientes();
  }, []);

  // Fecha dropdown de profissionais ao clicar fora
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (expandedProject == null) return;
      const target = e.target as Node | null;
      const expandedEl = document.querySelector(`[data-project-id="${expandedProject}"]`);
      if (expandedEl && target && expandedEl.contains(target)) {
        // click inside expanded card -> don't close
        return;
      }
      setExpandedProject(null);
    };
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, [expandedProject]);

  // Retorna o nome do cliente vinculado ao projeto, ou null se não houver
  const getClienteDoProjeto = (projetoId: number): string | null => {
    const cliente = clientes.find((c) =>
      c.projetoIds.includes(projetoId)
    );
    return cliente ? cliente.nome : null;
  };

  const gestores = usuarios.filter((u) => u.cargo === "ROLE_GESTOR");
  const profissionais = usuarios.filter((u) => u.cargo === "ROLE_PROFISSIONAL");

  const projetosFiltrados = projetos.filter(
    (p) => filtroStatus === "TODOS" || (p.status ?? "") === filtroStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EM_PLANEJAMENTO": return "#9CA3AF";
      case "EM_ANDAMENTO": return "#3B82F6";
      case "CONCLUIDO": return "#10B981";
      default: return "#9CA3AF";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "EM_PLANEJAMENTO": return "Em planejamento";
      case "EM_ANDAMENTO": return "Em andamento";
      case "CONCLUIDO": return "Concluído";
      default: return status ?? "-";
    }
  };

  const formatPrazo = (prazo: string) => {
    const data = new Date(prazo);
    const horas = data.getHours();
    const minutos = data.getMinutes();
    const dataFormatada = data.toLocaleDateString("pt-BR");
    if (minutos === 0) return `${dataFormatada} às ${horas}hrs`;
    return `${dataFormatada} às ${horas}hrs ${minutos}min`;
  };

  const getNomeUsuario = (id: number) => {
    const usuario = usuarios.find((u) => Number(u.id) === Number(id));
    return usuario ? usuario.nome : "-";
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setProjetos(projetos.map((p) => p.id === id ? { ...p, status: newStatus } : p));
  };

  const openModal = (projeto: any) => {
    setProjetoEditando({
      ...projeto,
      profissionaisIds: projeto.profissionaisIds || [],
    });
    setConfirmandoDelete(false);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const prazoFormatado = projetoEditando.prazo
        ? projetoEditando.prazo.replace(" ", "T").slice(0, 16)
        : null;

      await axios.put(`http://localhost:8082/projeto/${projetoEditando.id}/atualizacao`, {
        id: projetoEditando.id,
        nome: projetoEditando.nome,
        status: projetoEditando.status,
        descricao: projetoEditando.descricao,
        prazo: prazoFormatado,
        valorContratado: projetoEditando.valorContratado,
        responsavelId: projetoEditando.responsavelId,
        profissionaisIds: projetoEditando.profissionaisIds,
      });

      const response = await axios.get("http://localhost:8082/projeto");
      setProjetos(response.data);

      setModalOpen(false);
      setProjetoEditando(null);
      setConfirmandoDelete(false);
    } catch (error: any) {
      console.log(error);
      alert("Erro ao salvar projeto!");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8082/projeto/${projetoEditando.id}`);
      setProjetos(projetos.filter((p) => p.id !== projetoEditando.id));
      setModalOpen(false);
      setProjetoEditando(null);
      setConfirmandoDelete(false);
    } catch (error: any) {
      console.log(error);
      alert("Erro ao excluir projeto!");
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setProjetoEditando(null);
    setConfirmandoDelete(false);
  };

  const toggleProfissional = (id: number) => {
    const ids: number[] = (projetoEditando.profissionaisIds || []).map(Number);
    const updated = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
    setProjetoEditando({ ...projetoEditando, profissionaisIds: updated });
  };

  return (
    <div className={styles.container}>
      <h1>Projetos</h1>

      <div className={styles.toolbar}>
        <label htmlFor="filtroStatus">Filtrar por status:</label>
        <select
          id="filtroStatus"
          className={styles.filterSelect}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="TODOS">Todos</option>
          <option value="EM_PLANEJAMENTO">Em planejamento</option>
          <option value="EM_ANDAMENTO">Em andamento</option>
          <option value="CONCLUIDO">Concluído</option>
        </select>
        <span className={styles.filterCount}>
          {projetosFiltrados.length} projeto{projetosFiltrados.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className={styles.grid}>
        {projetosFiltrados.length === 0 ? (
          <p>Nenhum projeto encontrado.</p>
        ) : (
          projetosFiltrados.map((projeto) => {
            const clienteVinculado = getClienteDoProjeto(projeto.id);
            const profDoProjeto = (projeto.profissionaisIds || [])
              .map((id: any) => profissionais.find((p) => Number(p.id) === Number(id)))
              .filter(Boolean);
            return (
              <div
                key={projeto.id}
                className={expandedProject === projeto.id ? `${styles.card} ${styles.cardExpanded}` : styles.card}
                data-project-id={projeto.id}
              >
                <div
                  className={styles.statusBar}
                  style={{ backgroundColor: getStatusColor(projeto.status ?? "") }}
                />

                <div className={styles.header}>
                  <h2>{projeto.nome}</h2>
                  <button className={styles.editBtn} onClick={() => openModal(projeto)}>
                    Editar
                  </button>
                </div>

                <p className={styles.descricao}>{projeto.descricao}</p>

                <div className={styles.info}>
                  <span><strong>Status:</strong> {getStatusLabel(projeto.status)}</span>
                  <span><strong>Prazo:</strong> {projeto.prazo ? formatPrazo(projeto.prazo) : "-"}</span>
                  <span><strong>Valor:</strong> {projeto.valorContratado ? projeto.valorContratado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-"}</span>
                  <span><strong>Responsável:</strong> {projeto.responsavelId ? getNomeUsuario(projeto.responsavelId) : "-"}</span>
                  <span><strong>Criação:</strong> {projeto.dataCriacao ? formatPrazo(projeto.dataCriacao) : "-"}</span>
                  <span>
                    <strong>Cliente:</strong>{" "}
                    {clienteVinculado ? (
                      <span style={{ color: "#3B82F6", fontWeight: 500 }}>
                        {clienteVinculado}
                      </span>
                    ) : (
                      <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>
                        Sem cliente
                      </span>
                    )}
                  </span>
                </div>

                <select
                  className={styles.select}
                  value={projeto.status ?? "EM_PLANEJAMENTO"}
                  onChange={(e) => handleStatusChange(projeto.id, e.target.value)}
                >
                  <option value="EM_PLANEJAMENTO">Em planejamento</option>
                  <option value="EM_ANDAMENTO">Em andamento</option>
                  <option value="CONCLUIDO">Concluído</option>
                </select>
                
                <div className={styles.profLabel}>Profissionais</div>

                <div className={styles.avatarGroup}>
                  {profDoProjeto.slice(0, 3).map((p: any) => {
                    const nome = p?.nome || "-";
                    const initials = nome
                      .split(" ")
                      .map((s: string) => s[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <div key={p.id} className={styles.avatar} title={nome}>
                        {initials}
                      </div>
                    );
                  })}

                  {profDoProjeto.length > 0 && (
                    <button
                      className={styles.moreBadge}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedProject(expandedProject === projeto.id ? null : projeto.id);
                      }}
                      aria-expanded={expandedProject === projeto.id}
                      title="Ver profissionais"
                    >
                      <span className={styles.expandIcon}>▾</span>
                      {profDoProjeto.length > 3 && (
                        <span className={styles.moreCount}>+{profDoProjeto.length - 3}</span>
                      )}
                    </button>
                  )}
                </div>

                {expandedProject === projeto.id && (
                  <div className={styles.expandedList} onClick={(e) => e.stopPropagation()}>
                    {profDoProjeto.map((p: any) => (
                      <div key={p.id} className={styles.moreItem}>
                        <div className={styles.avatarSmall}>
                          {p.nome
                            .split(" ")
                            .map((s: string) => s[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div className={styles.moreName}>{p.nome}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {modalOpen && projetoEditando && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Editar Projeto</h2>

            <label>Nome</label>
            <input
              type="text"
              value={projetoEditando.nome ?? ""}
              onChange={(e) => setProjetoEditando({ ...projetoEditando, nome: e.target.value })}
              placeholder="Ex: Site Institucional"
            />

            <label>Descrição</label>
            <textarea
              value={projetoEditando.descricao ?? ""}
              onChange={(e) => setProjetoEditando({ ...projetoEditando, descricao: e.target.value })}
              placeholder="Descreva o objetivo do projeto..."
            />

            <label>Status</label>
            <select
              value={projetoEditando.status ?? "EM_PLANEJAMENTO"}
              onChange={(e) => setProjetoEditando({ ...projetoEditando, status: e.target.value })}
            >
              <option value="EM_PLANEJAMENTO">Em planejamento</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>

            <label>Prazo</label>
            <input
              type="datetime-local"
              value={projetoEditando.prazo?.replace(" ", "T").slice(0, 16) || ""}
              onChange={(e) => setProjetoEditando({ ...projetoEditando, prazo: e.target.value })}
            />

            <label>Valor contratado (R$)</label>
            <input
              type="number"
              value={projetoEditando.valorContratado ?? ""}
              onChange={(e) => setProjetoEditando({ ...projetoEditando, valorContratado: Number(e.target.value) })}
              placeholder="Ex: 15000"
            />

            <label>Responsável (Gestor)</label>
            <select
              value={projetoEditando.responsavelId ?? ""}
              onChange={(e) => setProjetoEditando({ ...projetoEditando, responsavelId: Number(e.target.value) })}
            >
              <option value="">Selecione um gestor</option>
              {gestores.map((g) => (
                <option key={g.id} value={g.id}>{g.nome}</option>
              ))}
            </select>

            <label>Profissionais</label>
            <div className={styles.checkboxGroup}>
              {profissionais.map((p) => (
                <label key={p.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={(projetoEditando.profissionaisIds || [])
                      .map(Number)
                      .includes(Number(p.id))}
                    onChange={() => toggleProfissional(p.id)}
                  />
                  {p.nome}
                </label>
              ))}
            </div>

            <label>Cliente vinculado</label>
            <input
              type="text"
              value={getClienteDoProjeto(projetoEditando.id) ?? "Sem cliente"}
              disabled
            />

            <label>Data de criação</label>
            <input
              type="text"
              value={projetoEditando.dataCriacao ? formatPrazo(projetoEditando.dataCriacao) : ""}
              disabled
            />

            {confirmandoDelete && (
              <div className={styles.deleteConfirm}>
                <p>Tem certeza que deseja excluir <strong>{projetoEditando.nome}</strong>?</p>
                <div className={styles.deleteConfirmActions}>
                  <button className={styles.cancelDeleteBtn} onClick={() => setConfirmandoDelete(false)}>Cancelar</button>
                  <button className={styles.confirmDeleteBtn} onClick={handleDelete}>Sim, excluir</button>
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              <button className={styles.deleteBtn} onClick={() => setConfirmandoDelete(true)}>Excluir</button>
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