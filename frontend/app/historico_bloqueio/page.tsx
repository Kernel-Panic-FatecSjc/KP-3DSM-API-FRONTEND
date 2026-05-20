'use client';

import styles from './App.module.css';
import React, { useState, useEffect } from 'react';

type Tarefa = {
  id: number;
  nome: string;
  status: string;
  dataCriacao: string;
  data_inicio_bloqueio: string;
  data_fim_bloqueio: string;
  projetoId: number;
};

type Projeto = {
  id: number;
  nome: string;
};

type Historico = {
  id: number;
  usuarioId: number;
  tempoAlocado: number;
  categoriaImpedimento: string;
  tempoBloqueio: number;
  dataEvento: string;
};

export default function Page() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState('');

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState('');

  const [historico, setHistorico] = useState<Historico[]>([]);

  const [historicoGeral, setHistoricoGeral] = useState<Historico[]>([]);

  const tarefasFiltradas =
  projetoSelecionado === ''
    ? tarefas
    : tarefas.filter(
        (tarefa) =>
          tarefa.projetoId === Number(projetoSelecionado)
        );

  const fetchTarefas = async () => {
    try {
      const response = await fetch('http://localhost:8085/tarefas');

      const data = await response.json();

      setTarefas(data);

    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    }
  };

  console.log(tarefas);

  useEffect(() => {
    fetchTarefas();
  }, []);

  const fetchProjetos = async () => {
    try {
      const response = await fetch('http://localhost:8082/projeto');

      const data = await response.json();

      setProjetos(data);

    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    }
  };

  useEffect(() => {
    fetchProjetos();
  }, []);

  const fetchHistorico = async (tarefaId: string) => {
    try {

        const response = await fetch(
        `http://localhost:8085/historico/tarefa/${tarefaId}`
        );

        if (!response.ok) {
        setHistorico([]);
        return;
        }

        const text = await response.text();

        if (!text) {
        setHistorico([]);
        return;
        }

        const data = JSON.parse(text);
        console.log('Histórico recebido:', data);

        setHistorico(data);

    } catch (error) {
        console.error(
        'Erro ao buscar histórico:',
        error
        );

        setHistorico([]);
    }
    };
    useEffect(() => {

    if (tarefaSelecionada) {
        fetchHistorico(tarefaSelecionada);
    }

    }, [tarefaSelecionada]);

    const fetchHistoricoGeral = async () => {

    try {

      const response = await fetch(
        'http://localhost:8085/historico'
      );

      const data = await response.json();

      setHistoricoGeral(data);

    } catch (error) {

      console.error(
        'Erro ao buscar histórico geral:',
        error
      );
    }
  };

  useEffect(() => {
    fetchHistoricoGeral();
  }, []);
  
  const bloqueios = historicoGeral.filter(
    (item) => item.categoriaImpedimento
  );

  const totalBloqueios = bloqueios.length;

  const tempoTotalMinutos =
  bloqueios.reduce(
    (total, item) =>
      total + (item.tempoBloqueio || 0),
    0
  );

  const tempoTotalHoras = (tempoTotalMinutos / 60).toFixed(1);

  const categoriasMap = bloqueios.reduce((acc, item) => {

    const categoria =
      item.categoriaImpedimento;

    if (!categoria) return acc;

    acc[categoria] =
      (acc[categoria] || 0) + 1;

    return acc;

  }, {} as Record<string, number>);

  const categoriaMaisRecorrente =
  Object.entries(categoriasMap)
    .sort((a, b) => b[1] - a[1])[0]?.[0]
    || '-';

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>
        Rastreabilidade de Tarefas
      </h1>

      <div className={styles.filtros}>
        <select
          className={styles.selectFiltro}
          value={projetoSelecionado}
          onChange={(e) =>
            setProjetoSelecionado(e.target.value)
          }
        >
          <option value="">
            Selecione um projeto
          </option>

          {projetos.map((projeto) => (
            <option
              key={projeto.id}
              value={projeto.id}
            >
              {projeto.nome}
            </option>
          ))}
        </select>

        <select className={styles.selectFiltro}>
          <option>Período</option>
        </select>
      </div>

      <section className={styles.card}>
        <h2 className={styles.subTitulo}>
          BLOQUEIOS DO PROJETO
        </h2>

        <div className={styles.informacoesContainer}>
          <div className={styles.infoCard}>
            <span>Total de bloqueios</span>
            <strong>{totalBloqueios}</strong>
          </div>

          <div className={styles.infoCard}>
            <span>Tempo total parado</span>
            <strong>{tempoTotalHoras}h</strong>
          </div>

          <div className={styles.infoCard}>
            <span>Categoria mais recorrente</span>
            <strong>{categoriaMaisRecorrente}</strong>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Ocorrências</th>
              <th>Tempo total parado</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categoriasMap).map(
              ([categoria, ocorrencias]) => {

                const tempoCategoria =
                  bloqueios
                    .filter(
                      (b) =>
                        b.categoriaImpedimento === categoria
                    )
                    .reduce(
                      (total, item) =>
                        total + (item.tempoBloqueio || 0),
                      0
                    );

                return (

                  <tr key={categoria}>

                    <td>{categoria}</td>

                    <td>{ocorrencias}</td>

                    <td>
                      {(tempoCategoria / 60).toFixed(1)}h
                    </td>

                  </tr>
                );
              }
            )}

        </tbody>
        </table>
      </section>

      <section className={styles.card}>
        <h2 className={styles.subTitulo}>
          HISTÓRICO DA TAREFA
        </h2>

        <select
          className={styles.selectFiltroHistorico}
          value={tarefaSelecionada}
          onChange={(e) =>
            setTarefaSelecionada(e.target.value)
          }
        >
          <option value="">
            Selecione uma tarefa
          </option>

          {tarefasFiltradas.map((tarefa) => (
            <option
              key={tarefa.id}
              value={tarefa.id}
            >
              {tarefa.nome}
            </option>
          ))}
        </select>

        <div className={styles.timeline}>

        {historico.length === 0 && (
          <p>Nenhum histórico encontrado</p>
        )}

        {historico.map((item) => (

            <div
                key={item.id}
                className={styles.timelineItem}
            >

                <div
                className={`${styles.bolinha} ${
                    item.categoriaImpedimento
                    ? styles.vermelho
                    : styles.cinza
                }`}
                />

                <p>
                {new Date(item.dataEvento).toLocaleString()}
                {' — '}

                {item.categoriaImpedimento
                    ? `Bloqueio: ${item.categoriaImpedimento}`
                    : `Tempo alocado: ${item.tempoAlocado}h`}
                </p>

            </div>

            ))}
        </div>

        <span className={styles.rodape}>
          Histórico imutável — apenas leitura
        </span>
      </section>
    </div>
  );
}