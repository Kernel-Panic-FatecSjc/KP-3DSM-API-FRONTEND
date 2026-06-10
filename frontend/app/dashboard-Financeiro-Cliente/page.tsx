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
} from "recharts";

interface Projeto {
  id: number;
  nome: string;
  cliente: string;
  receita: number;
  custo: number;
  status: string;
}

export default function DashboardFinanceiro() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/financeiro"
      );

      setProjetos(response.data.projetos);
    } catch {
      setProjetos(mockProjetos);
    }
  }

  const receitaTotal = projetos.reduce(
    (acc, p) => acc + p.receita,
    0
  );

  const custoTotal = projetos.reduce(
    (acc, p) => acc + p.custo,
    0
  );

  const lucroTotal = receitaTotal - custoTotal;

  const margem =
    receitaTotal > 0
      ? ((lucroTotal / receitaTotal) * 100).toFixed(
          1
        )
      : "0";

  const clientesAgrupados = Object.values(
    projetos.reduce((acc: any, projeto) => {
      if (!acc[projeto.cliente]) {
        acc[projeto.cliente] = {
          cliente: projeto.cliente,
          projetos: 0,
          receita: 0,
          custo: 0,
        };
      }

      acc[projeto.cliente].projetos++;
      acc[projeto.cliente].receita +=
        projeto.receita;
      acc[projeto.cliente].custo +=
        projeto.custo;

      return acc;
    }, {})
  );

  return (
    <div className="container">


      <div className="cards">
        <div className="card">
          <span>Receita Total</span>
          <h2>
            R${" "}
            {receitaTotal.toLocaleString("pt-BR")}
          </h2>
        </div>

        <div className="card">
          <span>Custo Total</span>
          <h2>
            R${" "}
            {custoTotal.toLocaleString("pt-BR")}
          </h2>
        </div>

        <div className="card">
          <span>Lucro Total</span>
          <h2 className="verde">
            R${" "}
            {lucroTotal.toLocaleString("pt-BR")}
          </h2>
        </div>

        <div className="card">
          <span>Margem Média</span>
          <h2>{margem}%</h2>
        </div>
      </div>

      <div className="box">
        <h2>
          Receita x Custo por Projeto
        </h2>

        <ResponsiveContainer
          width="100%"
          height={400}
        >
          <BarChart data={projetos}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="nome" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="receita"
              fill="#2563eb"
              name="Receita"
            />

            <Bar
              dataKey="custo"
              fill="#16a34a"
              name="Custo"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="box">
        <h2>Visão Geral dos Projetos</h2>

        <table>
          <thead>
            <tr>
              <th>Projeto</th>
              <th>Cliente</th>
              <th>Receita</th>
              <th>Custo</th>
              <th>Lucro</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {projetos.map((projeto) => (
              <tr key={projeto.id}>
                <td>{projeto.nome}</td>

                <td>{projeto.cliente}</td>

                <td>
                  R$
                  {projeto.receita.toLocaleString(
                    "pt-BR"
                  )}
                </td>

                <td>
                  R$
                  {projeto.custo.toLocaleString(
                    "pt-BR"
                  )}
                </td>

                <td>
                  R$
                  {(
                    projeto.receita -
                    projeto.custo
                  ).toLocaleString("pt-BR")}
                </td>

                <td>{projeto.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="box">
        <h2>Visão por Cliente</h2>

        <div className="clientes">
          {clientesAgrupados.map(
            (cliente: any) => {
              const lucro =
                cliente.receita -
                cliente.custo;

              return (
                <div
                  className="clienteCard"
                  key={cliente.cliente}
                >
                  <h3>
                    {cliente.cliente}
                  </h3>

                  <p>
                    Projetos:{" "}
                    {cliente.projetos}
                  </p>

                  <p>
                    Receita: R$
                    {cliente.receita.toLocaleString(
                      "pt-BR"
                    )}
                  </p>

                  <p>
                    Custos: R$
                    {cliente.custo.toLocaleString(
                      "pt-BR"
                    )}
                  </p>

                  <p className="verde">
                    Lucro: R$
                    {lucro.toLocaleString(
                      "pt-BR"
                    )}
                  </p>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

const mockProjetos: Projeto[] = [
  {
    id: 1,
    nome: "Sistema de Apontamento",
    cliente: "GSW Soluções",
    receita: 50000,
    custo: 35000,
    status: "Em andamento",
  },
  {
    id: 2,
    nome: "Portal RH",
    cliente: "GSW Soluções",
    receita: 30000,
    custo: 23000,
    status: "Em andamento",
  },
  {
    id: 3,
    nome: "Integração ERP",
    cliente: "GSW Soluções",
    receita: 20000,
    custo: 12000,
    status: "Concluído",
  },
  {
    id: 4,
    nome: "App Mobile",
    cliente: "TechKorp",
    receita: 40000,
    custo: 28000,
    status: "Em andamento",
  },
  {
    id: 5,
    nome: "Dashboard BI",
    cliente: "TechKorp",
    receita: 20000,
    custo: 14000,
    status: "Planejado",
  },
  {
    id: 6,
    nome: "E-commerce",
    cliente: "Nova Ventures",
    receita: 30000,
    custo: 18000,
    status: "Concluído",
  },
];