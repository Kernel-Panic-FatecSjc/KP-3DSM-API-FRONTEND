"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
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

type HoursEntry = {
  label: string;
  horas: number;
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

const MOCK_HOURS_WEEK: HoursEntry[] = [
  { label: "Sem 1", horas: 32 },
  { label: "Sem 2", horas: 41 },
  { label: "Sem 3", horas: 28 },
];

const MOCK_HOURS_MONTH: HoursEntry[] = [
  { label: "Jan", horas: 142 },
  { label: "Fev", horas: 128 },
  { label: "Mar", horas: 165 },
];

const MOCK_ACTIVITY: ActivityDistribution[] = [
  { name: "Desenvolvimento", value: 38 },
  { name: "Análise", value: 20 },
  { name: "Testes", value: 18 },
];

const MOCK_LAUNCH_STATUS: LaunchStatus[] = [
  { name: "Aprovado", quantidade: 34 },
  { name: "Em progresso", quantidade: 12 },
  { name: "Aguardando aprovação", quantidade: 5 },
];

const MOCK_TASKS: Task[] = [
  { id: "1", title: "Implementar login", status: "done", projectName: "Alpha" },
  { id: "2", title: "Corrigir relatório", status: "doing", projectName: "Beta" },
];

const MOCK_USERS: User[] = [
  { id: "1", name: "Ana Lima" },
  { id: "2", name: "Carlos Melo" },
  { id: "3", name: "Julia Rosa" },
];

const PRIMARY_BLUE = "#1E3A8A";
const MEDIUM_BLUE = "#3B82F6";
const LIGHT_BLUE = "#93C5FD";

const ACTIVITY_COLORS = [PRIMARY_BLUE, MEDIUM_BLUE, LIGHT_BLUE];

const LAUNCH_COLORS: Record<string, string> = {
  Aprovado: PRIMARY_BLUE,
  "Em progresso": MEDIUM_BLUE,
  "Aguardando aprovação": LIGHT_BLUE,
};

const STATUS_CONFIG = {
  todo:    { label: "To Do",     color: "#475569", bg: "#E2E8F0" },
  doing:   { label: "Doing",     color: PRIMARY_BLUE, bg: "#DBEAFE" },
  done:    { label: "Done",      color: PRIMARY_BLUE, bg: "#DBEAFE" },
  blocked: { label: "Bloqueada", color: "#7C2D12", bg: "#FED7AA" },
};

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

export default function ProfissionalDashboard() {
  const [loading, setLoading] = useState(true);
  const [perfil] = useState<Perfil>("gestor");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [hoursView, setHoursView] = useState<"week" | "month">("week");
  const [hoursWeek, setHoursWeek] = useState<HoursEntry[]>([]);
  const [hoursMonth, setHoursMonth] = useState<HoursEntry[]>([]);
  const [activity, setActivity] = useState<ActivityDistribution[]>([]);
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setUsers(MOCK_USERS);
    setHoursWeek(MOCK_HOURS_WEEK);
    setHoursMonth(MOCK_HOURS_MONTH);
    setActivity(MOCK_ACTIVITY);
    setLaunchStatus(MOCK_LAUNCH_STATUS);
    setTasks(MOCK_TASKS);
    setLoading(false);
  }, []);

  const hoursData = hoursView === "week" ? hoursWeek : hoursMonth;

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <>
          <div className={styles.dropdownWrapper} style={{ marginBottom: 20 }}>
            {perfil === "gestor" ? (
              <div
                className={styles.projectDropdown}
                onClick={() => setOpenDropdown(!openDropdown)}
              >
                {selectedUser
                  ? users.find((u) => u.id === selectedUser)?.name
                  : "Selecione um profissional"}
                {openDropdown && (
                  <div className={styles.dropdownMenu}>
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className={styles.dropdownItem}
                        onClick={() => {
                          setSelectedUser(user.id);
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
              <div
                className={styles.projectDropdown}
                style={{ cursor: "default", color: "#475569" }}
              >
                Nome do profissional logado
              </div>
            )}
          </div>

          <div className={styles.metricsGrid}>
            <MetricCard label="Horas semana" value="47h" sub="+5h vs anterior" />
            <MetricCard label="Horas no mês" value="435h" sub="Mês atual" />
            <MetricCard label="Aprovados" value="34" sub="12 pendentes" />
            <MetricCard label="Tarefas" value={String(tasks.length)} sub="1 bloqueada" />
          </div>

          <div className={styles.chartsGrid}>
            <ChartCard title="Horas registradas">
              <div className={styles.toggle}>
                <button
                  onClick={() => setHoursView("week")}
                  className={hoursView === "week" ? styles.activeToggle : styles.toggleButton}
                >
                  Semana
                </button>
                <button
                  onClick={() => setHoursView("month")}
                  className={hoursView === "month" ? styles.activeToggle : styles.toggleButton}
                >
                  Mês
                </button>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={hoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                  <XAxis dataKey="label" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip />
                  <Line type="monotone" dataKey="horas" stroke="#1E3A8A" strokeWidth={3} dot={{ fill: "#1E3A8A", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Tipos de atividade">
              <div className={styles.pieContainer}>
                <div className={styles.pieChartWrapper}>
                  <PieChart width={180} height={180}>
                    <Pie data={activity} dataKey="value" innerRadius={45} outerRadius={75}>
                      {activity.map((_, i) => (
                        <Cell key={i} fill={ACTIVITY_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>
                <div className={styles.legendList}>
                  {activity.map((a, i) => (
                    <div key={a.name} className={styles.legendItem}>
                      <div className={styles.legendLeft}>
                        <span className={styles.legendDot} style={{ background: ACTIVITY_COLORS[i] }} />
                        <span>{a.name}</span>
                      </div>
                      <span>{a.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Status dos lançamentos">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={launchStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                  <XAxis type="number" stroke="#64748B" />
                  <YAxis type="category" dataKey="name" width={160} stroke="#64748B" />
                  <Tooltip />
                  <Bar dataKey="quantidade">
                    {launchStatus.map((l) => (
                      <Cell key={l.name} fill={LAUNCH_COLORS[l.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Tarefas">
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <tbody>
                    {tasks.map((task) => (
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