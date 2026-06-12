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

const API_URL =
  "http://localhost:8082/projeto/indicadores-financeiros";

const PIE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#facc15",
  "#e11d48",
  "#7c3aed",
];

export default function DashboardFinanceiro() {
  const [projetos, setProjetos] = useState<ProjetoFinanceiro[]>([]);
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

      const response = await axios.get<ProjetoFinanceiro[]>(
        API_URL,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      setProjetos(response.data);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os dados financeiros.");
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

  const lucroTotal = receitaTotal - custoTotal;

  const dadosGrafico = projetos.map((projeto) => ({
    nome: projeto.nome,
    receita: projeto.valorContratado,
    custo: projeto.custoRealAcumulado,
  }));

  const dadosPizza = [
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
  ].filter((item) => item.value > 0);

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

      <div className="cards">
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
            R$ {custoTotal.toLocaleString("pt-BR")}
          </h2>
        </div>

        <div className="card">
          <span>Lucro Estimado</span>
          <h2 className="azul">
            R$ {lucroTotal.toLocaleString("pt-BR")}
          </h2>
        </div>
      </div>

      <div className="graficos-row">
        <div className="box grafico-meio">
          <h2>
            Receita x Custos por Projeto
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
        <h2>Visão Geral dos Projetos</h2>

        {projetos.length === 0 ? (
          <p className="sem-dados">
            Nenhum projeto encontrado.
          </p>
        ) : (
          <div className="tabela-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Projeto</th>
                  <th>Valor Contratado</th>
                  <th>Custo Acumulado</th>
                  <th>Faturamento Previsto</th>
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

                      <td className="nome-col">
                        {projeto.nome}
                      </td>

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
                        <span
                          className="badge-status"
                          style={{
                            backgroundColor:
                              projeto.statusFinanceiro ===
                              "OK"
                                ? "#16a34a"
                                : "#dc2626",
                          }}
                        >
                          {
                            projeto.statusFinanceiro
                          }
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="box">
        <h2>
          Resumo Financeiro
        </h2>

        <div className="clientes">
          <div className="clienteCard">
            <h3>
              Receita Contratada
            </h3>

            <p>
              <strong>
                R${" "}
                {receitaTotal.toLocaleString(
                  "pt-BR"
                )}
              </strong>
            </p>
          </div>

          <div className="clienteCard">
            <h3>
              Custos Acumulados
            </h3>

            <p>
              <strong>
                R${" "}
                {custoTotal.toLocaleString(
                  "pt-BR"
                )}
              </strong>
            </p>
          </div>

          <div className="clienteCard">
            <h3>
              Faturamento Previsto
            </h3>

            <p>
              <strong>
                R${" "}
                {faturamentoTotal.toLocaleString(
                  "pt-BR"
                )}
              </strong>
            </p>
          </div>

          <div className="clienteCard">
            <h3>
              Lucro Estimado
            </h3>

            <p>
              <strong>
                R${" "}
                {lucroTotal.toLocaleString(
                  "pt-BR"
                )}
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}