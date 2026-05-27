"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./App.module.css";

type ProjectCost = {
  projectName: string;
  realCost: number;
  contractedValue: number;
};

type CostEntry = {
  label: string;
  realCost: number;
  contractedValue: number;
};

type ProfessionalCost = {
  professionalName: string;
  [projectName: string]: number | string;
};

type FinancialChange = {
  id: string;
  date: string;
  projectName: string;
  professionalName: string;
  description: string;
  impact: number;
};

type User = { id: string; name: string };
type Perfil = "gestor" | "profissional";
type Periodo = "semanal" | "mensal";

const PRIMARY_BLUE = "#1E3A8A";
const MEDIUM_BLUE = "#3B82F6";
const LIGHT_BLUE = "#93C5FD";

const LINE_COLORS = [PRIMARY_BLUE, MEDIUM_BLUE, LIGHT_BLUE];
const PROJECT_KEYS = ["Alpha", "Beta", "Gama"];

const MOCK_WEEKLY: Record<string, { costOverTime: CostEntry[]; projectCosts: ProjectCost[] }> = {
  Alpha: {
    costOverTime: [
      { label: "Sem 1", realCost: 20, contractedValue: 55 },
      { label: "Sem 2", realCost: 35, contractedValue: 55 },
      { label: "Sem 3", realCost: 48, contractedValue: 55 },
      { label: "Sem 4", realCost: 60, contractedValue: 55 },
    ],
    projectCosts: [{ projectName: "Alpha", realCost: 60, contractedValue: 55 }],
  },
  Beta: {
    costOverTime: [
      { label: "Sem 1", realCost: 15, contractedValue: 50 },
      { label: "Sem 2", realCost: 22, contractedValue: 50 },
      { label: "Sem 3", realCost: 30, contractedValue: 50 },
      { label: "Sem 4", realCost: 42, contractedValue: 50 },
    ],
    projectCosts: [{ projectName: "Beta", realCost: 42, contractedValue: 50 }],
  },
  Gama: {
    costOverTime: [
      { label: "Sem 1", realCost: 10, contractedValue: 35 },
      { label: "Sem 2", realCost: 18, contractedValue: 35 },
      { label: "Sem 3", realCost: 25, contractedValue: 35 },
      { label: "Sem 4", realCost: 33, contractedValue: 35 },
    ],
    projectCosts: [{ projectName: "Gama", realCost: 33, contractedValue: 35 }],
  },
};

const MOCK_MONTHLY: Record<string, { costOverTime: CostEntry[]; projectCosts: ProjectCost[] }> = {
  Alpha: {
    costOverTime: [
      { label: "Jan", realCost: 45, contractedValue: 200 },
      { label: "Fev", realCost: 95, contractedValue: 200 },
      { label: "Mar", realCost: 160, contractedValue: 200 },
      { label: "Abr", realCost: 230, contractedValue: 200 },
    ],
    projectCosts: [{ projectName: "Alpha", realCost: 230, contractedValue: 200 }],
  },
  Beta: {
    costOverTime: [
      { label: "Jan", realCost: 40, contractedValue: 180 },
      { label: "Fev", realCost: 80, contractedValue: 180 },
      { label: "Mar", realCost: 120, contractedValue: 180 },
      { label: "Abr", realCost: 155, contractedValue: 180 },
    ],
    projectCosts: [{ projectName: "Beta", realCost: 155, contractedValue: 180 }],
  },
  Gama: {
    costOverTime: [
      { label: "Jan", realCost: 30, contractedValue: 140 },
      { label: "Fev", realCost: 65, contractedValue: 140 },
      { label: "Mar", realCost: 100, contractedValue: 140 },
      { label: "Abr", realCost: 138, contractedValue: 140 },
    ],
    projectCosts: [{ projectName: "Gama", realCost: 138, contractedValue: 140 }],
  },
};

const ALL_PROFESSIONAL_COSTS: ProfessionalCost[] = [
  { professionalName: "Carlos", Alpha: 18, Beta: 10, Gama: 6 },
  { professionalName: "Fernanda", Alpha: 15, Beta: 12, Gama: 8 },
  { professionalName: "João", Alpha: 12, Beta: 9, Gama: 5 },
  { professionalName: "Amanda", Alpha: 15, Beta: 11, Gama: 14 },
];

const ALL_FINANCIAL_CHANGES: FinancialChange[] = [
  { id: "1", date: "02/05/2026", projectName: "Alpha", professionalName: "Carlos Mendes", description: "Horas extras aprovadas", impact: 4500 },
  { id: "2", date: "06/05/2026", projectName: "Beta", professionalName: "Fernanda Lima", description: "Redução de escopo", impact: -3200 },
  { id: "3", date: "11/05/2026", projectName: "Gama", professionalName: "João Pedro", description: "Nova contratação temporária", impact: 6800 },
  { id: "4", date: "17/05/2026", projectName: "Alpha", professionalName: "Amanda Souza", description: "Mudança de fornecedor", impact: -1800 },
];

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatBRLk(value: number) {
  return `R$${value}k`;
}

function MetricCard({ label, value, sub, alert }: { label: string; value: string; sub?: string; alert?: boolean }) {
  return (
    <div className={`${styles.metricCard} ${alert ? styles.metricCardAlert : ""}`}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={`${styles.metricValue} ${alert ? styles.metricValueAlert : ""}`}>{value}</p>
      {sub && <p className={styles.metricSub}>{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.chartCard}>
      <p className={styles.chartTitle}>{title}</p>
      {children}
    </div>
  );
}

function ImpactBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`${styles.statusBadge} ${positive ? styles.positive : styles.negative}`}>
      {positive ? "+" : ""}{formatBRL(value)}
    </span>
  );
}

function OverBudgetAlert({ projects }: { projects: ProjectCost[] }) {
  if (projects.length === 0) return null;
  return (
    <div className={styles.overBudgetAlert}>
      <div>
        <strong>Projetos acima do orçamento:</strong>{" "}
        {projects.map((p) => (
          <span key={p.projectName} className={styles.overBudgetTag}>
            {p.projectName} ({formatBRLk(p.realCost)} / {formatBRLk(p.contractedValue)})
          </span>
        ))}
      </div>
    </div>
  );
}

export default function FinanceiroDashboard() {
  const [loading, setLoading] = useState(true);
  const [perfil] = useState<Perfil>("gestor");

  const [users] = useState<User[]>([
    { id: "all", name: "Todos os projetos" },
    { id: "alpha", name: "Alpha" },
    { id: "beta", name: "Beta" },
    { id: "gama", name: "Gama" },
  ]);

  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [openProjectDropdown, setOpenProjectDropdown] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>("semanal");

  const [professionalCosts] = useState<ProfessionalCost[]>(ALL_PROFESSIONAL_COSTS);
  const [financialChanges] = useState<FinancialChange[]>(ALL_FINANCIAL_CHANGES);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const mockData = periodo === "semanal" ? MOCK_WEEKLY : MOCK_MONTHLY;

  const projectCosts: ProjectCost[] = useMemo(() => {
    if (selectedProject === "all") return PROJECT_KEYS.map((k) => mockData[k].projectCosts[0]);
    const key = selectedProject.charAt(0).toUpperCase() + selectedProject.slice(1);
    return mockData[key]?.projectCosts ?? [];
  }, [selectedProject, mockData]);

  const costOverTime: CostEntry[] = useMemo(() => {
    if (selectedProject === "all") {
      const base = mockData[PROJECT_KEYS[0]].costOverTime;
      return base.map((entry, i) => ({
        label: entry.label,
        realCost: PROJECT_KEYS.reduce((s, k) => s + mockData[k].costOverTime[i].realCost, 0),
        contractedValue: PROJECT_KEYS.reduce((s, k) => s + mockData[k].costOverTime[i].contractedValue, 0),
      }));
    }
    const key = selectedProject.charAt(0).toUpperCase() + selectedProject.slice(1);
    return mockData[key]?.costOverTime ?? [];
  }, [selectedProject, mockData]);

  const filteredFinancialChanges = useMemo(() => {
    if (selectedProject === "all") return financialChanges;
    const key = selectedProject.charAt(0).toUpperCase() + selectedProject.slice(1);
    return financialChanges.filter((c) => c.projectName === key);
  }, [selectedProject, financialChanges]);

  const filteredProfessionalCosts = useMemo(() => {
    if (selectedProject === "all") return professionalCosts;
    const key = selectedProject.charAt(0).toUpperCase() + selectedProject.slice(1);
    return professionalCosts.map((pc) => ({ professionalName: pc.professionalName, [key]: pc[key] ?? 0 }));
  }, [selectedProject, professionalCosts]);

  const visibleProjectKeys = useMemo(() => {
    if (selectedProject === "all") return PROJECT_KEYS;
    return [selectedProject.charAt(0).toUpperCase() + selectedProject.slice(1)];
  }, [selectedProject]);

  const totalRealCost = projectCosts.reduce((s, p) => s + p.realCost, 0);
  const totalContracted = projectCosts.reduce((s, p) => s + p.contractedValue, 0);
  const overBudgetProjects = projectCosts.filter((p) => p.realCost > p.contractedValue);

  const periodoTotalPeriods = periodo === "semanal" ? 4 : 12;
  const periodoCurrentPeriod = costOverTime.length;
  const faturamentoPrevisto =
    periodoCurrentPeriod > 0
      ? Math.round((totalRealCost / periodoCurrentPeriod) * periodoTotalPeriods)
      : 0;
  const faturamentoVariacao = faturamentoPrevisto - totalContracted;

  const selectedProjectLabel = users.find((u) => u.id === selectedProject)?.name ?? "Todos os projetos";

  return (
    <div className={styles.container}>
      <div className={styles.filtersRow}>
        <div className={styles.dropdownWrapper}>
          <div
            className={styles.projectDropdown}
            onClick={() => setOpenProjectDropdown(!openProjectDropdown)}
          >
            {selectedProjectLabel}
            {openProjectDropdown && (
              <div className={styles.dropdownMenu}>
                {users.map((u) => (
                  <div
                    key={u.id}
                    className={`${styles.dropdownItem} ${selectedProject === u.id ? styles.dropdownItemActive : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(u.id);
                      setOpenProjectDropdown(false);
                    }}
                  >
                    {u.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.toggle}>
          <button
            className={periodo === "semanal" ? styles.activeToggle : styles.toggleButton}
            onClick={() => setPeriodo("semanal")}
          >
            Semanal
          </button>
          <button
            className={periodo === "mensal" ? styles.activeToggle : styles.toggleButton}
            onClick={() => setPeriodo("mensal")}
          >
            Mensal
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <>
          <OverBudgetAlert projects={overBudgetProjects} />

          <div className={styles.metricsGrid}>
            <MetricCard
              label="Custo total acumulado"
              value={formatBRLk(totalRealCost)}
              sub={periodo === "semanal" ? "Últimas 4 semanas" : "Últimos 4 meses"}
            />
            <MetricCard
              label="Valor contratado"
              value={formatBRLk(totalContracted)}
              sub={`${projectCosts.length} projeto(s) ativo(s)`}
            />
            <MetricCard
              label={`Previsão de faturamento — ${periodo === "semanal" ? "mensal" : "anual"}`}
              value={formatBRLk(faturamentoPrevisto)}
              sub={
                faturamentoVariacao > 0
                  ? `▲ ${formatBRLk(faturamentoVariacao)} acima do contratado`
                  : `▼ ${formatBRLk(Math.abs(faturamentoVariacao))} abaixo do contratado`
              }
              alert={faturamentoVariacao > 0}
            />
            <MetricCard
              label="Projetos acima do orçamento"
              value={String(overBudgetProjects.length)}
              sub={overBudgetProjects.length > 0 ? "⚠ Ação necessária" : "Dentro do orçamento"}
              alert={overBudgetProjects.length > 0}
            />
          </div>

          <div className={styles.chartsGrid}>
            <ChartCard title="Evolução — Custo real acumulado vs Valor contratado">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={costOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
                  <XAxis dataKey="label" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={formatBRLk} />
                  <Tooltip formatter={(value: any) => formatBRLk(value)} />
                  <Legend formatter={(value) => value === "realCost" ? "Custo real" : "Valor contratado"} />
                  <Line type="monotone" dataKey="realCost" name="Custo real" stroke={PRIMARY_BLUE} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="contractedValue" name="Valor contratado" stroke={LIGHT_BLUE} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Custo real vs Valor contratado por projeto">
              <div className={styles.legendList}>
                {[{ label: "Custo real", color: PRIMARY_BLUE }, { label: "Valor contratado", color: LIGHT_BLUE }].map((l) => (
                  <div key={l.label} className={styles.legendItem}>
                    <div className={styles.legendLeft}>
                      <span className={styles.legendDot} style={{ background: l.color }} />
                      <span>{l.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={projectCosts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
                  <XAxis dataKey="projectName" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={formatBRLk} />
                  <Tooltip formatter={(value: any) => formatBRLk(value)} />
                  <Bar dataKey="realCost" name="Custo real" fill={PRIMARY_BLUE} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="contractedValue" name="Valor contratado" fill={LIGHT_BLUE} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Custo por profissional">
              <div className={styles.legendList} style={{ flexDirection: "row", gap: 16, marginBottom: 12 }}>
                {visibleProjectKeys.map((k, i) => (
                  <div key={k} className={styles.legendItem}>
                    <div className={styles.legendLeft}>
                      <span className={styles.legendDot} style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
                      <span>{k}</span>
                    </div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={filteredProfessionalCosts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
                  <XAxis dataKey="professionalName" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={formatBRLk} />
                  <Tooltip formatter={(value: any) => formatBRLk(value)} />
                  {visibleProjectKeys.map((k, i) => (
                    <Bar
                      key={k}
                      dataKey={k}
                      stackId="a"
                      fill={LINE_COLORS[i % LINE_COLORS.length]}
                      radius={i === visibleProjectKeys.length - 1 ? [3, 3, 0, 0] : undefined}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Histórico de alterações com impacto financeiro">
              <div className={styles.tableWrapper}>
                {filteredFinancialChanges.length === 0 ? (
                  <div style={{ color: "#94A3B8", fontSize: 13, paddingTop: 12 }}>
                    Nenhuma alteração registrada no período.
                  </div>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Projeto</th>
                        <th>Profissional</th>
                        <th>Descrição</th>
                        <th className={styles.right}>Impacto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFinancialChanges.map((ch) => (
                        <tr key={ch.id}>
                          <td>{ch.date}</td>
                          <td>{ch.projectName}</td>
                          <td>{ch.professionalName}</td>
                          <td>{ch.description}</td>
                          <td className={styles.right}>
                            <ImpactBadge value={ch.impact} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </ChartCard>
          </div>

          <p className={styles.footer}>
            Dashboard somente leitura · Dados mockados para visualização
          </p>
        </>
      )}
    </div>
  );
}