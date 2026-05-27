"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./App.module.css";

type TaskStatus = "todo" | "doing" | "done" | "blocked";
type Perfil = "gestor" | "profissional";

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  projectName: string;
};

type ActivityDistribution = {
  name: string;
  value: number;
};

type LaunchStatus = {
  name: string;
  quantidade: number;
};

type User = {
  id: string;
  name: string;
};

type HorasResumoDTO = {
  usuarioId: number;
  mes: number;
  ano: number;
  totalHorasMes: string;
  horasPorStatus: Record<string, string>;
  horasPorAtividade: Record<string, string>;
  lancamentosRejeitados: {
    id: number;
    tituloSessao: string;
    motivoRejeicao: string;
    estado: string;
    dataLancamento: string;
  }[];
};

const PRIMARY_BLUE = "#1E3A8A";
const MEDIUM_BLUE = "#3B82F6";
const LIGHT_BLUE = "#93C5FD";

const ACTIVITY_COLORS = [PRIMARY_BLUE, MEDIUM_BLUE, LIGHT_BLUE, "#60A5FA", "#BFDBFE"];

const LAUNCH_COLORS: Record<string, string> = {
  APROVADO: PRIMARY_BLUE,
  AGUARDANDO_APROVACAO: LIGHT_BLUE,
  REJEITADO: "#EF4444",
};

const LAUNCH_LABELS: Record<string, string> = {
  APROVADO: "Aprovado",
  AGUARDANDO_APROVACAO: "Aguardando",
  REJEITADO: "Rejeitado",
};

const ACTIVITY_LABELS: Record<string, string> = {
  DESENVOLVIMENTO: "Desenvolvimento",
  ANALISE: "Análise",
  TESTES: "Testes",
  FEATURE: "Feature",
  CORRECAO_BUG: "Correção de Bug",
};

const STATUS_CONFIG = {
  todo:    { label: "To Do",     color: "#475569", bg: "#E2E8F0" },
  doing:   { label: "Doing",     color: PRIMARY_BLUE, bg: "#DBEAFE" },
  done:    { label: "Done",      color: PRIMARY_BLUE, bg: "#DBEAFE" },
  blocked: { label: "Bloqueada", color: "#7C2D12", bg: "#FED7AA" },
};

const BASE_URL = "http://localhost:8084";
const USUARIO_URL = "http://localhost:8083";

function parseDuration(iso: string): number {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  return Math.round(h + m / 60 + s / 3600);
}

function formatHoras(iso: string): string {
  if (!iso) return "0h";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return "0h";
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className={styles.metricCard}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
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

function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={styles.statusBadge} style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

const MOCK_TASKS: Task[] = [
  { id: "1", title: "Implementar login", status: "done", projectName: "Alpha" },
  { id: "2", title: "Corrigir relatório", status: "doing", projectName: "Beta" },
];

export default function ProfissionalDashboard() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [perfil, setPerfil] = useState<Perfil>("profissional");
  const [usuarioIdLogado, setUsuarioIdLogado] = useState<string | null>(null);
  const [nomeLogado, setNomeLogado] = useState<string>("");

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  const [resumo, setResumo] = useState<HorasResumoDTO | null>(null);

  useEffect(() => {
    const cargo = localStorage.getItem("cargo");
    const id = localStorage.getItem("usuarioId");
    const nome = localStorage.getItem("nome") || "";

    setPerfil(cargo === "ROLE_GESTOR" ? "gestor" : "profissional");
    setUsuarioIdLogado(id);
    setNomeLogado(nome);
  }, []);

  useEffect(() => {
    if (perfil !== "gestor") return;

    const token = localStorage.getItem("token");

    fetch(`${USUARIO_URL}/usuario/todos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const lista = Array.isArray(data) ? data : data.content ?? data.usuarios ?? [];
        const profissionais = lista
          .filter((u: any) => u.cargo === "ROLE_PROFISSIONAL")
          .map((u: any) => ({ id: String(u.id), name: u.nome }));
        setUsers(profissionais);
      })
      .catch((e) => console.error("Erro ao buscar usuários:", e));
  }, [perfil]);

  const idConsulta = perfil === "gestor" ? selectedUserId : usuarioIdLogado;

  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  useEffect(() => {
    if (!idConsulta) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    setLoading(true);
    setErro(null);

    fetch(`${BASE_URL}/horas/${idConsulta}/resumo?mes=${mes}&ano=${ano}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        return res.json();
      })
      .then((data: HorasResumoDTO) => setResumo(data))
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [idConsulta]);

  const horasAtividade: ActivityDistribution[] = resumo
    ? Object.entries(resumo.horasPorAtividade).map(([name, dur]) => ({
        name: ACTIVITY_LABELS[name] ?? name,
        value: parseDuration(dur),
      }))
    : [];

  const launchStatus: LaunchStatus[] = resumo
    ? Object.entries(resumo.horasPorStatus).map(([key, dur]) => ({
        name: LAUNCH_LABELS[key] ?? key,
        quantidade: parseDuration(dur),
      }))
    : [];

  const totalAprovado = resumo?.horasPorStatus["APROVADO"]
    ? parseDuration(resumo.horasPorStatus["APROVADO"])
    : 0;

  const totalAguardando = resumo?.horasPorStatus["AGUARDANDO_APROVACAO"]
    ? parseDuration(resumo.horasPorStatus["AGUARDANDO_APROVACAO"])
    : 0;

  const totalRejeitados = resumo?.lancamentosRejeitados?.length ?? 0;

  return (
    <div className={styles.container}>
      <div className={styles.dropdownWrapper}>
        {perfil === "gestor" ? (
          <div
            className={styles.projectDropdown}
            onClick={() => setOpenDropdown(!openDropdown)}
          >
            {selectedUserId
              ? users.find((u) => u.id === selectedUserId)?.name ?? `Profissional #${selectedUserId}`
              : "Selecione um profissional"}
            {openDropdown && (
              <div className={styles.dropdownMenu}>
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={styles.dropdownItem}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setOpenDropdown(false);
                    }}
                  >
                    {user.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.projectDropdown} style={{ cursor: "default", color: "#475569" }}>
            {nomeLogado || "Profissional"}
          </div>
        )}
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : erro ? (
        <div className={styles.loading} style={{ color: "#EF4444" }}>Erro ao carregar: {erro}</div>
      ) : !idConsulta ? (
        <div className={styles.loading}>Selecione um profissional para visualizar o resumo.</div>
      ) : (
        <>
          <div className={styles.metricsGrid}>
            <MetricCard
              label="Total horas no mês"
              value={resumo ? formatHoras(resumo.totalHorasMes) : "—"}
              sub={`${mes}/${ano}`}
            />
            <MetricCard
              label="Horas aprovadas"
              value={`${totalAprovado}h`}
              sub="No mês atual"
            />
            <MetricCard
              label="Aguardando aprovação"
              value={`${totalAguardando}h`}
              sub="Pendentes"
            />
            <MetricCard
              label="Lançamentos rejeitados"
              value={String(totalRejeitados)}
              sub="Com motivo registrado"
            />
          </div>

          <div className={styles.chartsGrid}>
            <ChartCard title="Horas por status">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={launchStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                  <XAxis type="number" stroke="#64748B" unit="h" />
                  <YAxis type="category" dataKey="name" width={120} stroke="#64748B" />
                  <Tooltip formatter={(v) => `${v}h`} />
                  <Bar dataKey="quantidade">
                    {launchStatus.map((l) => {
                      const key = Object.keys(LAUNCH_LABELS).find(
                        (k) => LAUNCH_LABELS[k] === l.name
                      ) ?? l.name;
                      return <Cell key={l.name} fill={LAUNCH_COLORS[key] ?? MEDIUM_BLUE} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Tipos de atividade">
              {horasAtividade.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 13 }}>
                  Sem dados para o período
                </div>
              ) : (
                <div className={styles.pieContainer}>
                  <div className={styles.pieChartWrapper}>
                    <PieChart width={180} height={180}>
                      <Pie data={horasAtividade} dataKey="value" innerRadius={45} outerRadius={75}>
                        {horasAtividade.map((_, i) => (
                          <Cell key={i} fill={ACTIVITY_COLORS[i % ACTIVITY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}h`} />
                    </PieChart>
                  </div>
                  <div className={styles.legendList}>
                    {horasAtividade.map((a, i) => (
                      <div key={a.name} className={styles.legendItem}>
                        <div className={styles.legendLeft}>
                          <span className={styles.legendDot} style={{ background: ACTIVITY_COLORS[i % ACTIVITY_COLORS.length] }} />
                          <span>{a.name}</span>
                        </div>
                        <span>{a.value}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ChartCard>

            <ChartCard title="Lançamentos rejeitados">
              <div className={styles.tableWrapper}>
                {resumo?.lancamentosRejeitados?.length === 0 ? (
                  <div style={{ color: "#94A3B8", fontSize: 13, paddingTop: 12 }}>
                    Nenhum lançamento rejeitado no período.
                  </div>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>Data</th>
                        <th>Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumo?.lancamentosRejeitados?.map((l) => (
                        <tr key={l.id}>
                          <td>{l.tituloSessao}</td>
                          <td>{l.dataLancamento}</td>
                          <td style={{ color: "#EF4444" }}>{l.motivoRejeicao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Tarefas">
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <tbody>
                    {MOCK_TASKS.map((task) => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>{task.projectName}</td>
                        <td className={styles.right}>
                          <StatusBadge status={task.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}