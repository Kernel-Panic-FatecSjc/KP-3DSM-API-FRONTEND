"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import styles from "./App.module.css";

// ================================================================
// TIPOS — espelham os DTOs e enums Java
// ================================================================

type PeriodicidadeFinanceira = "SEMANAL" | "MENSAL";

type StatusFinanceiroProjeto =
  | "DENTRO_DO_ORCAMENTO"
  | "PROXIMO_DO_LIMITE"
  | "ACIMA_DO_LIMITE";

interface AlertaIndicadorFinanceiroDTO {
  usuarioId: number;
  codigo: string;
  mensagem: string;
}

// Alerta com contexto de projeto — usado apenas internamente no front
interface AlertaComProjeto extends AlertaIndicadorFinanceiroDTO {
  projectName: string;
}

interface EvolucaoFinanceiraProjetoDTO {
  data: string;             // ISO date: "2026-01-15"
  custoAcumulado: number;
  valorContratado: number;
}

interface IndicadorFinanceiroProjetoDTO {
  projetoId: number;
  nome: string;
  periodoInicio: string;
  periodoFim: string;
  periodicidade: PeriodicidadeFinanceira;
  valorContratado: number;
  custoRealAcumulado: number;
  percentualConsumido: number;
  statusFinanceiro: StatusFinanceiroProjeto;
  faturamentoPrevisto: number;  // calculado pelo back: CLT ÷220h | PJ fixo ÷160h | PJ variável valor/hora
  baseCalculoCusto: string;
  alertas: AlertaIndicadorFinanceiroDTO[];
  evolucao: EvolucaoFinanceiraProjetoDTO[];
}

// Tipos internos do front
interface ProjectCost {
  projetoId: number;
  projectName: string;
  realCost: number;
  contractedValue: number;
  percentConsumed: number;
  status: StatusFinanceiroProjeto;
}

interface CostEntry {
  label: string;
  realCost: number;
  contractedValue: number;
}

// ================================================================
// MOCKS TEMPORÁRIOS
// Remover quando os endpoints abaixo estiverem prontos no back:
//   GET /projeto/custo-profissional?projetoIds=...
//   GET /projeto/historico-financeiro?projetoId=...
// ================================================================

const MOCK_PROFESSIONAL_COSTS = [
  { professionalName: "Carlos",   Alpha: 18, Beta: 10, Gama: 6  },
  { professionalName: "Fernanda", Alpha: 15, Beta: 12, Gama: 8  },
  { professionalName: "João",     Alpha: 12, Beta: 9,  Gama: 5  },
  { professionalName: "Amanda",   Alpha: 15, Beta: 11, Gama: 14 },
];

const MOCK_FINANCIAL_CHANGES = [
  { id: "1", date: "02/05/2026", projectName: "Alpha", professionalName: "Carlos Mendes",  description: "Horas extras aprovadas",     impact:  4500 },
  { id: "2", date: "06/05/2026", projectName: "Beta",  professionalName: "Fernanda Lima",  description: "Redução de escopo",           impact: -3200 },
  { id: "3", date: "11/05/2026", projectName: "Gama",  professionalName: "João Pedro",     description: "Nova contratação temporária", impact:  6800 },
  { id: "4", date: "17/05/2026", projectName: "Alpha", professionalName: "Amanda Souza",   description: "Mudança de fornecedor",       impact: -1800 },
];


// API
// ================================================================

const API_BASE_URL = "http://localhost:8082";

async function fetchIndicadoresFinanceiros(
  periodicidade: PeriodicidadeFinanceira,
  ano: number,
  mes: number
): Promise<IndicadorFinanceiroProjetoDTO[]> {
  const url = new URL(`${API_BASE_URL}/projeto/indicadores-financeiros`);
  url.searchParams.set("periodicidade", periodicidade);
  url.searchParams.set("ano", String(ano));
  url.searchParams.set("mes", String(mes));

  const res = await fetch(url.toString(), {
    headers: { "Content-Type": "application/json" },
    // headers: { Authorization: `Bearer ${getToken()}` }, // descomente para auth
  });

  if (!res.ok) throw new Error(`Erro ${res.status}: ${await res.text()}`);
  return res.json();
}

// ================================================================
// HELPERS
// ================================================================

const PRIMARY_BLUE = "#1E3A8A";
const MEDIUM_BLUE  = "#3B82F6";
const LIGHT_BLUE   = "#93C5FD";
const LINE_COLORS  = [PRIMARY_BLUE, MEDIUM_BLUE, LIGHT_BLUE];

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

function formatarLabel(data: string, periodicidade: PeriodicidadeFinanceira): string {
  const d = new Date(data + "T00:00:00");
  if (periodicidade === "MENSAL") {
    return d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  }
  return `Sem ${Math.ceil(d.getDate() / 7)}`;
}

// ================================================================
// COMPONENTES DE UI
// ================================================================

function MetricCard({ label, value, sub, alert }: {
  label: string; value: string; sub?: string; alert?: boolean;
}) {
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
  return (
    <span className={`${styles.statusBadge} ${value >= 0 ? styles.positive : styles.negative}`}>
      {value >= 0 ? "+" : ""}{formatBRL(value)}
    </span>
  );
}

function AlertaBanner({ alertas }: { alertas: AlertaComProjeto[] }) {
  if (alertas.length === 0) return null;
  return (
    <div className={styles.overBudgetAlert}>
      <div>
        <strong>Alertas financeiros:</strong>{" "}
        {alertas.map((a, i) => (
          <span key={i} className={styles.overBudgetTag}>
            {a.projectName} — {a.mensagem}
          </span>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// DASHBOARD
// ================================================================

export default function FinanceiroDashboard() {
  const [periodoUI, setPeriodoUI] = useState<"semanal" | "mensal">("semanal");
  const periodicidade: PeriodicidadeFinanceira = periodoUI === "semanal" ? "SEMANAL" : "MENSAL";

  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [openDropdown, setOpenDropdown] = useState(false);

  const [indicadores, setIndicadores] = useState<IndicadorFinanceiroProjetoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const now = new Date();
    fetchIndicadoresFinanceiros(periodicidade, now.getFullYear(), now.getMonth() + 1)
      .then((data) => { if (!cancelled) setIndicadores(data); })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [periodicidade]);

  // ── Filtragem ──────────────────────────────────────────────────
  const indicadoresFiltrados = useMemo(() => {
    if (selectedProject === "all") return indicadores;
    return indicadores.filter((p) => String(p.projetoId) === selectedProject);
  }, [indicadores, selectedProject]);

  // ── Dados derivados ────────────────────────────────────────────
  const projectCosts: ProjectCost[] = useMemo(
    () => indicadoresFiltrados.map((p) => ({
      projetoId: p.projetoId,
      projectName: p.nome,
      realCost: p.custoRealAcumulado,
      contractedValue: p.valorContratado,
      percentConsumed: p.percentualConsumido,
      status: p.statusFinanceiro,
    })),
    [indicadoresFiltrados]
  );

  const costOverTime: CostEntry[] = useMemo(() => {
    const dateMap = new Map<string, { realCost: number; contractedValue: number }>();
    indicadoresFiltrados.forEach((p) =>
      p.evolucao.forEach((e) => {
        const prev = dateMap.get(e.data) ?? { realCost: 0, contractedValue: 0 };
        dateMap.set(e.data, {
          realCost: prev.realCost + e.custoAcumulado,
          contractedValue: prev.contractedValue + e.valorContratado,
        });
      })
    );
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, v]) => ({
        label: formatarLabel(data, periodicidade),
        realCost: v.realCost,
        contractedValue: v.contractedValue,
      }));
  }, [indicadoresFiltrados, periodicidade]);

  const totalRealCost      = useMemo(() => projectCosts.reduce((s, p) => s + p.realCost, 0), [projectCosts]);
  const totalContracted    = useMemo(() => projectCosts.reduce((s, p) => s + p.contractedValue, 0), [projectCosts]);
  const faturamentoPrevisto = useMemo(() => indicadoresFiltrados.reduce((s, p) => s + p.faturamentoPrevisto, 0), [indicadoresFiltrados]);
  const faturamentoVariacao = faturamentoPrevisto - totalContracted;
  const overBudgetCount    = useMemo(() => projectCosts.filter((p) => p.status === "ACIMA_DO_LIMITE").length, [projectCosts]);

  const alertasComProjeto = useMemo<AlertaComProjeto[]>(
    () => indicadoresFiltrados.flatMap((p) =>
      p.alertas.map((a) => ({ ...a, projectName: p.nome }))
    ),
    [indicadoresFiltrados]
  );

  // Dropdown de projetos populado pela API
  const projectOptions = useMemo(() => [
    { id: "all", name: "Todos os projetos" },
    ...indicadores.map((p) => ({ id: String(p.projetoId), name: p.nome })),
  ], [indicadores]);

  const visibleProjectKeys = useMemo(() => projectCosts.map((p) => p.projectName), [projectCosts]);

  // Mocks temporários filtrados por projeto
  const professionalCosts = useMemo(() => {
    if (selectedProject === "all") return MOCK_PROFESSIONAL_COSTS;
    const nome = indicadores.find((p) => String(p.projetoId) === selectedProject)?.nome ?? "";
    return MOCK_PROFESSIONAL_COSTS.map((pc) => ({ professionalName: pc.professionalName, [nome]: (pc as any)[nome] ?? 0 }));
  }, [selectedProject, indicadores]);

  const financialChanges = useMemo(() => {
    if (selectedProject === "all") return MOCK_FINANCIAL_CHANGES;
    const nome = indicadores.find((p) => String(p.projetoId) === selectedProject)?.nome ?? "";
    return MOCK_FINANCIAL_CHANGES.filter((c) => c.projectName === nome);
  }, [selectedProject, indicadores]);

  const selectedLabel = projectOptions.find((u) => u.id === selectedProject)?.name ?? "Todos os projetos";

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className={styles.container}>

      {/* Filtros */}
      <div className={styles.filtersRow}>
        <div className={styles.dropdownWrapper}>
          <div className={styles.projectDropdown} onClick={() => setOpenDropdown(!openDropdown)}>
            {selectedLabel}
            {openDropdown && (
              <div className={styles.dropdownMenu}>
                {projectOptions.map((u) => (
                  <div
                    key={u.id}
                    className={`${styles.dropdownItem} ${selectedProject === u.id ? styles.dropdownItemActive : ""}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedProject(u.id); setOpenDropdown(false); }}
                  >
                    {u.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={styles.toggle}>
          <button className={periodoUI === "semanal" ? styles.activeToggle : styles.toggleButton} onClick={() => setPeriodoUI("semanal")}>Semanal</button>
          <button className={periodoUI === "mensal"  ? styles.activeToggle : styles.toggleButton} onClick={() => setPeriodoUI("mensal")}>Mensal</button>
        </div>
      </div>

      {loading && <div className={styles.loading}>Carregando...</div>}

      {error && (
        <div className={styles.overBudgetAlert} style={{ borderColor: "#EF4444" }}>
          <strong>Erro ao carregar dados:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <AlertaBanner alertas={alertasComProjeto} />

          {/* Métricas */}
          <div className={styles.metricsGrid}>
            <MetricCard
              label="Custo total acumulado"
              value={formatBRLk(totalRealCost)}
              sub={periodoUI === "semanal" ? "Últimas semanas" : "Mês atual"}
            />
            <MetricCard
              label="Valor contratado"
              value={formatBRLk(totalContracted)}
              sub={`${projectCosts.length} projeto(s) ativo(s)`}
            />
            <MetricCard
              label={`Previsão de faturamento — ${periodoUI === "semanal" ? "mensal" : "anual"}`}
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
              value={String(overBudgetCount)}
              sub={overBudgetCount > 0 ? "⚠ Ação necessária" : "Dentro do orçamento"}
              alert={overBudgetCount > 0}
            />
          </div>

          {/* Gráficos */}
          <div className={styles.chartsGrid}>

            <ChartCard title="Evolução — Custo real acumulado vs Valor contratado">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={costOverTime} margin={{ bottom: 20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
                  <XAxis dataKey="label" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={formatBRLk} />
                  <Tooltip formatter={(v: any) => formatBRLk(v)} />
                  <Legend wrapperStyle={{ paddingTop: "15px" }} />
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
                  <Tooltip formatter={(v: any) => formatBRLk(v)} />
                  <Bar dataKey="realCost" name="Custo real" fill={PRIMARY_BLUE} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="contractedValue" name="Valor contratado" fill={LIGHT_BLUE} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* TODO: substituir por endpoint real quando disponível */}
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
                <BarChart data={professionalCosts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
                  <XAxis dataKey="professionalName" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={formatBRLk} />
                  <Tooltip formatter={(v: any) => formatBRLk(v)} />
                  {visibleProjectKeys.map((k, i) => (
                    <Bar key={k} dataKey={k} stackId="a" fill={LINE_COLORS[i % LINE_COLORS.length]}
                      radius={i === visibleProjectKeys.length - 1 ? [3, 3, 0, 0] : undefined} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* TODO: substituir por endpoint real quando disponível */}
            <ChartCard title="Histórico de alterações com impacto financeiro">
              <div className={styles.tableWrapper}>
                {financialChanges.length === 0 ? (
                  <div style={{ color: "#94A3B8", fontSize: 13, paddingTop: 12 }}>
                    Nenhuma alteração registrada no período.
                  </div>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Data</th><th>Projeto</th><th>Profissional</th><th>Descrição</th>
                        <th className={styles.right}>Impacto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialChanges.map((ch) => (
                        <tr key={ch.id}>
                          <td>{ch.date}</td>
                          <td>{ch.projectName}</td>
                          <td>{ch.professionalName}</td>
                          <td>{ch.description}</td>
                          <td className={styles.right}><ImpactBadge value={ch.impact} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </ChartCard>

          </div>
        </>
      )}
    </div>
  );
}