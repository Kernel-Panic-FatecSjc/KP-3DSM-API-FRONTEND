"use client";

import "./dashboardFinanceiro.css";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ProjetoFinanceiro {
  projetoId: number;
  nome: string;
  valorContratado: number;
  custoRealAcumulado: number;
  faturamentoPrevisto: number;
  percentualConsumido: number;
  statusFinanceiro: string;
}

interface ClienteFinanceiro {
  clienteId: number;
  nome: string;
  valorContratado: number;
  custoReal: number;
  lucro: number;
}

const API_URL =
  "http://localhost:8082/projeto/indicadores-financeiros";

const CLIENTE_API =
  "http://localhost:8083/clientes/financeiro";

const PIE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#facc15",
  "#e11d48",
  "#7c3aed",
];

export default function DashboardFinanceiro() {
  const [projetos, setProjetos] = useState<ProjetoFinanceiro[]>([]);
  const [clientes, setClientes] = useState<ClienteFinanceiro[]>([]);
  const [modo, setModo] = useState<"projeto" | "cliente">("projeto");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    setErro(null);

    try {
      const token = localStorage.getItem("token") ?? "";

      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      const [projetosResponse, clientesResponse] =
        await Promise.all([
          axios.get<ProjetoFinanceiro[]>(
            API_URL,
            { headers }
          ),
          axios.get<ClienteFinanceiro[]>(
            CLIENTE_API,
            { headers }
          ),
        ]);

      setProjetos(projetosResponse.data);
      setClientes(clientesResponse.data);
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível carregar os dados financeiros."
      );
    } finally {
      setCarregando(false);
    }
  }

  const receitaTotal = projetos.reduce(
    (acc, projeto) =>
      acc + (projeto.valorContratado || 0),
    0
  );

  const custoTotal = projetos.reduce(
    (acc, projeto) =>
      acc + (projeto.custoRealAcumulado || 0),
    0
  );

  const faturamentoTotal = projetos.reduce(
    (acc, projeto) =>
      acc + (projeto.faturamentoPrevisto || 0),
    0
  );

  const lucroTotal =
    receitaTotal - custoTotal;

  const receitaClientes = clientes.reduce(
    (acc, cliente) =>
      acc + (cliente.valorContratado || 0),
    0
  );

  const custoClientes = clientes.reduce(
    (acc, cliente) =>
      acc + (cliente.custoReal || 0),
    0
  );

  const lucroClientes = clientes.reduce(
    (acc, cliente) =>
      acc + (cliente.lucro || 0),
    0
  );

  const dadosGrafico =
    modo === "projeto"
      ? projetos.map((projeto) => ({
          nome: projeto.nome,
          receita: projeto.valorContratado,
          custo: projeto.custoRealAcumulado,
        }))
      : clientes.map((cliente) => ({
          nome: cliente.nome,
          receita: cliente.valorContratado,
          custo: cliente.custoReal,
          lucro: cliente.lucro,
        }));

  const dadosPizza =
    modo === "projeto"
      ? [
          {
            name: "Receita",
            value: receitaTotal,
          },
          {
            name: "Custos",
            value: custoTotal,
          },
          {
            name: "Lucro",
            value: lucroTotal,
          },
        ]
      : [
          {
            name: "Receita",
            value: receitaClientes,
          },
          {
            name: "Custos",
            value: custoClientes,
          },
          {
            name: "Lucro",
            value: lucroClientes,
          },
        ];

  if (carregando) {
    return (
      <div className="container loading-state">
        <div className="loading-spinner" />
        <p>Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {erro && (
        <div className="aviso-erro">
          {erro}
        </div>
      )}

      <div className="toggle-view">
        <button
          className={
            modo === "projeto"
              ? "toggle-active"
              : ""
          }
          onClick={() =>
            setModo("projeto")
          }
        >
          Projetos
        </button>

        <button
          className={
            modo === "cliente"
              ? "toggle-active"
              : ""
          }
          onClick={() =>
            setModo("cliente")
          }
        >
          Clientes
        </button>
      </div>

      <div className="cards">
        {modo === "projeto" ? (
          <>
            <div className="card">
              <span>Projetos</span>
              <h2>{projetos.length}</h2>
            </div>

            <div className="card">
              <span>Receita Total</span>
              <h2 className="verde">
                R${" "}
                {receitaTotal.toLocaleString(
                  "pt-BR"
                )}
              </h2>
            </div>

            <div className="card">
              <span>Custo Total</span>
              <h2 className="vermelho">
                R${" "}
                {custoTotal.toLocaleString(
                  "pt-BR"
                )}
              </h2>
            </div>

            <div className="card">
              <span>Lucro Estimado</span>
              <h2 className="azul">
                R${" "}
                {lucroTotal.toLocaleString(
                  "pt-BR"
                )}
              </h2>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <span>Clientes</span>
              <h2>{clientes.length}</h2>
            </div>

            <div className="card">
              <span>Receita Total</span>
              <h2 className="verde">
                R${" "}
                {receitaClientes.toLocaleString(
                  "pt-BR"
                )}
              </h2>
            </div>

            <div className="card">
              <span>Custo Total</span>
              <h2 className="vermelho">
                R${" "}
                {custoClientes.toLocaleString(
                  "pt-BR"
                )}
              </h2>
            </div>

            <div className="card">
              <span>Lucro Total</span>
              <h2 className="azul">
                R${" "}
                {lucroClientes.toLocaleString(
                  "pt-BR"
                )}
              </h2>
            </div>
          </>
        )}
      </div>

      <div className="graficos-row">
        <div className="box grafico-meio">
          <h2>
            {modo === "projeto"
              ? "Receita x Custos por Projeto"
              : "Receita x Custos por Cliente"}
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="nome" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="receita"
                fill="#16a34a"
                name="Receita"
              />

              <Bar
                dataKey="custo"
                fill="#dc2626"
                name="Custo"
              />

              {modo === "cliente" && (
                <Bar
                  dataKey="lucro"
                  fill="#2563eb"
                  name="Lucro"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="box grafico-meio">
          <h2>
            Distribuição Financeira
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <PieChart>
              <Pie
                data={dadosPizza}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {dadosPizza.map(
                  (_, index) => (
                    <Cell
                      key={index}
                      fill={
                        PIE_COLORS[
                          index %
                            PIE_COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="box">
        <h2>
          {modo === "projeto"
            ? "Visão Geral dos Projetos"
            : "Visão Geral dos Clientes"}
        </h2>

        <div className="tabela-wrapper">
          {modo === "projeto" ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Projeto</th>
                  <th>Valor Contratado</th>
                  <th>Custo</th>
                  <th>Faturamento</th>
                  <th>% Consumido</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {projetos.map(
                  (projeto) => (
                    <tr
                      key={
                        projeto.projetoId
                      }
                    >
                      <td>
                        {
                          projeto.projetoId
                        }
                      </td>
                      <td>{projeto.nome}</td>
                      <td>
                        R${" "}
                        {projeto.valorContratado.toLocaleString(
                          "pt-BR"
                        )}
                      </td>
                      <td>
                        R${" "}
                        {projeto.custoRealAcumulado.toLocaleString(
                          "pt-BR"
                        )}
                      </td>
                      <td>
                        R${" "}
                        {projeto.faturamentoPrevisto.toLocaleString(
                          "pt-BR"
                        )}
                      </td>
                      <td>
                        {
                          projeto.percentualConsumido
                        }
                        %
                      </td>
                      <td>
                        {
                          projeto.statusFinanceiro
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Valor Contratado</th>
                  <th>Custo</th>
                  <th>Lucro</th>
                </tr>
              </thead>

              <tbody>
                {clientes.map(
                  (cliente) => (
                    <tr
                      key={
                        cliente.clienteId
                      }
                    >
                      <td>
                        {
                          cliente.clienteId
                        }
                      </td>

                      <td>
                        {cliente.nome}
                      </td>

                      <td>
                        R${" "}
                        {cliente.valorContratado.toLocaleString(
                          "pt-BR"
                        )}
                      </td>

                      <td>
                        R${" "}
                        {cliente.custoReal.toLocaleString(
                          "pt-BR"
                        )}
                      </td>

                      <td>
                        R${" "}
                        {cliente.lucro.toLocaleString(
                          "pt-BR"
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="box">
        <h2>
          Resumo Financeiro
        </h2>

        <div className="clientes">
          <div className="clienteCard">
            <h3>
              Receita
            </h3>

            <p>
              <strong>
                R${" "}
                {(modo === "projeto"
                  ? receitaTotal
                  : receitaClientes
                ).toLocaleString("pt-BR")}
              </strong>
            </p>
          </div>

          <div className="clienteCard">
            <h3>
              Custos
            </h3>

            <p>
              <strong>
                R${" "}
                {(modo === "projeto"
                  ? custoTotal
                  : custoClientes
                ).toLocaleString("pt-BR")}
              </strong>
            </p>
          </div>

          <div className="clienteCard">
            <h3>
              Lucro
            </h3>

            <p>
              <strong>
                R${" "}
                {(modo === "projeto"
                  ? lucroTotal
                  : lucroClientes
                ).toLocaleString("pt-BR")}
              </strong>
            </p>
          </div>

          <div className="clienteCard">
            <h3>
              Registros
            </h3>

            <p>
              <strong>
                {modo === "projeto"
                  ? projetos.length
                  : clientes.length}
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}