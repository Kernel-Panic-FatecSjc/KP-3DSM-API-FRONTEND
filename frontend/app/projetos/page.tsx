"use client";
import React, { useState, useEffect } from "react";
import styles from "./App.module.css";
import axios from "axios";

export default function Page() {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjetos = async () => {
    try {
      const response = await axios.get("http://localhost:8080/projeto", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setProjetos(response.data);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjetos();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fazer":
        return "#9CA3AF";
      case "fazendo":
        return "#3B82F6";
      case "feito":
        return "#10B981";
      default:
        return "#9CA3AF";
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const updated = projetos.map((p) =>
      p.id === id ? { ...p, status: newStatus } : p,
    );
    setProjetos(updated);
  };

  if (loading) {
    return <div className={styles.container}>Carregando projetos...</div>;
  }

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

              <button className={styles.editBtn}>✏️</button>
            </div>

            <p className={styles.descricao}>{projeto.descricao}</p>

            <select
              className={styles.select}
              value={projeto.status}
              onChange={(e) => handleStatusChange(projeto.id, e.target.value)}
            >
              <option value="fazer">A fazer</option>
              <option value="fazendo">Em produção</option>
              <option value="feito">Feito</option>
            </select>

            <div className={styles.info}>
              <span>
                <strong>ID:</strong> {projeto.id}
              </span>
              <span>
                <strong>Prazo:</strong> {projeto.prazo}
              </span>
              <span>
                <strong>Criação:</strong> {projeto.dataCriacao}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
