"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./app.module.css";
import { DropdownProfissional, DropdownProjeto, DropdownStatus, DropdownPrioridade } from "../../components/layout/dropdown/dropdown";
import generatePDF from "react-to-pdf";

interface Profissional {
  id: number;
  nome: string;
  email: string;
  cargo: string;
}

interface Projeto {
  id: number;
  nome: string;
  dataInicio: string;
  dataFim: string;
  horasRegistradas: number;
  horasPrevistas: number;
  status: string;
}

interface Alteracao {
  id: number;
  tarefaId: number;
  tarefaNome: string;
  campoAlterado: string;
  valorAnterior: string;
  valorNovo: string;
  dataAlteracao: string;
  usuario: string;
}

interface DashboardData {
  totalHoras: number;
  totalProjetos: number;
  totalAlteracoes: number;
  profissional: Profissional;
  projetos: Projeto[];
  alteracoesRecentes: Alteracao[];
}

type ExportFormat = "pdf" | "csv";

interface ExportFields {
  projetos: boolean;
  tarefas: boolean;
  profissional: boolean;
  periodo: boolean;
  horasTotais: boolean;
}

const FALLBACK_DATA: DashboardData = {
  totalHoras: 126,
  totalProjetos: 4,
  totalAlteracoes: 8,
  profissional: {
    id: 1,
    nome: "Gabriel Henrique",
    email: "gabriel@empresa.com",
    cargo: "Desenvolvedor",
  },
  projetos: [
    { id: 1, nome: "Sistema Financeiro", dataInicio: "2026-05-01", dataFim: "2026-05-22", horasRegistradas: 42, horasPrevistas: 40, status: "concluido" },
    { id: 2, nome: "Dashboard React",    dataInicio: "2026-05-10", dataFim: "2026-05-22", horasRegistradas: 28, horasPrevistas: 32, status: "em_andamento" },
    { id: 3, nome: "API Spring",         dataInicio: "2026-05-05", dataFim: "2026-05-22", horasRegistradas: 35, horasPrevistas: 40, status: "em_andamento" },
    { id: 4, nome: "Mobile App",         dataInicio: "2026-05-15", dataFim: "2026-05-22", horasRegistradas: 21, horasPrevistas: 24, status: "atrasado" },
  ],
  alteracoesRecentes: [
    { id: 1, tarefaId: 101, tarefaNome: "Implementar autenticação", campoAlterado: "status",      valorAnterior: "pendente", valorNovo: "em_andamento", dataAlteracao: "2026-05-21T10:30:00", usuario: "Gabriel Henrique" },
    { id: 2, tarefaId: 102, tarefaNome: "Criar dashboard",          campoAlterado: "prioridade",  valorAnterior: "baixa",    valorNovo: "alta",         dataAlteracao: "2026-05-20T15:45:00", usuario: "Gabriel Henrique" },
    { id: 3, tarefaId: 103, tarefaNome: "Configurar API",           campoAlterado: "responsavel", valorAnterior: "Carlos",   valorNovo: "Ana",          dataAlteracao: "2026-05-19T09:15:00", usuario: "Ana Lima" },
  ],
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const resolveApiUrl = (path: string) => API_URL ? `${API_URL}${path.replace(/^\/api/, "")}` : path;

export default function Auditoria() {
  const [dataInicio, setDataInicio] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().split("T")[0]);

  const [showModal, setShowModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported]   = useState(false);
  const [format, setFormat]       = useState<ExportFormat>("pdf");
  const [fields, setFields]       = useState<ExportFields>({
    projetos: true, tarefas: true, profissional: true, periodo: true, horasTotais: true,
  });

  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const [filtroProfissionalId, setFiltroProfissionalId] = useState<string>("");
  const [filtroProjetoId, setFiltroProjetoId]           = useState<string>("");
  const [filtroStatusSelect, setFiltroStatusSelect]     = useState<string>("todos");
  const [filtroPrioridade, setFiltroPrioridade]         = useState<string>("todas");

  const [token, setToken]   = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedToken  = localStorage.getItem("token")  ?? "";
    const storedUserId = localStorage.getItem("usuarioId") ?? "";
    setToken(storedToken);
    setUserId(storedUserId);

    if (!storedToken || !storedUserId) {
      setError("Usuário não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (!token || !userId) return;

    const timeout = setTimeout(() => {
      fetchDashboardData();
    }, 500);

    return () => clearTimeout(timeout);

    const timeout = setTimeout(() => {
      fetchDashboardData();
    }, 500);

    return () => clearTimeout(timeout);
  }, [token, userId, dataInicio, dataFim, filtroProfissionalId, filtroProjetoId, filtroStatusSelect, filtroPrioridade]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!token || !userId) {
        throw new Error("Token ou usuário ausente. Faça login novamente.");
      }

      const profId = filtroProfissionalId || userId;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const userResponse = await fetch(resolveApiUrl(`/api/usuario/${profId}`), { headers });
      if (!userResponse.ok) throw new Error(`Erro ao buscar dados do usuário (${userResponse.status})`);
      const userData = await userResponse.json();

      const projetosResponse = await fetch(resolveApiUrl('/api/projeto'), { headers });

      const horasParams = new URLSearchParams();
      horasParams.append('usuarioId', profId);
      horasParams.append('dataInicio', dataInicio);
      horasParams.append('dataFim', dataFim);
      const horasResponse = await fetch(resolveApiUrl(`/api/horas/filtrar?${horasParams.toString()}`), { headers });

      const alteracoesParams = new URLSearchParams();
      alteracoesParams.append('dataInicio', dataInicio);
      alteracoesParams.append('dataFim', dataFim);
      if (filtroPrioridade !== "todas") alteracoesParams.append('prioridade', filtroPrioridade);
      if (filtroProjetoId && filtroProjetoId !== "todos") alteracoesParams.append('projetoId', filtroProjetoId);
      const alteracoesResponse = await fetch(resolveApiUrl(`/api/tarefas/alteracoes?${alteracoesParams.toString()}`), { headers });

      const projetosRaw    = projetosResponse.ok    ? await projetosResponse.json()    : [];
      const horasRaw       = horasResponse.ok       ? await horasResponse.json()       : [];
      const alteracoesRaw  = alteracoesResponse.ok  ? await alteracoesResponse.json()  : [];

      const projetosData   = Array.isArray(projetosRaw)   ? projetosRaw   : (projetosRaw.content   ?? projetosRaw.data   ?? []);
      const horasData      = Array.isArray(horasRaw)      ? horasRaw      : (horasRaw.content      ?? horasRaw.data      ?? horasRaw.horas      ?? []);
      const alteracoesData = Array.isArray(alteracoesRaw) ? alteracoesRaw : (alteracoesRaw.content ?? alteracoesRaw.data ?? alteracoesRaw.alteracoes ?? []);

      const partialErrors: string[] = [];
      if (!projetosResponse.ok)   partialErrors.push(`projetos (${projetosResponse.status})`);
      if (!horasResponse.ok)      partialErrors.push(`horas (${horasResponse.status})`);
      if (!alteracoesResponse.ok) partialErrors.push(`alterações (${alteracoesResponse.status})`);

      if (partialErrors.length > 0) {
        const errorDetails = [
          !projetosResponse.ok && `projetos (${projetosResponse.status})`,
          !horasResponse.ok && `horas (${horasResponse.status})`,
          !alteracoesResponse.ok && `alterações (${alteracoesResponse.status})`,
        ].filter(Boolean).join(", ");
        console.warn(" Erros ao carregar dados de auditoria:", errorDetails);
        if (partialErrors.length < 3) {
          setError(` Alguns dados não puderam ser carregados: ${errorDetails}. Verifique a conexão com o servidor.`);
        const errorDetails = [
          !projetosResponse.ok && `projetos (${projetosResponse.status})`,
          !horasResponse.ok && `horas (${horasResponse.status})`,
          !alteracoesResponse.ok && `alterações (${alteracoesResponse.status})`,
        ].filter(Boolean).join(", ");
        console.warn(" Erros ao carregar dados de auditoria:", errorDetails);
        if (partialErrors.length < 3) {
          setError(` Alguns dados não puderam ser carregados: ${errorDetails}. Verifique a conexão com o servidor.`);
        }
      }

      const totalHoras = horasData.reduce(
        (acc: number, h: any) => acc + (h.horasTrabalhadas ?? h.horas ?? 0),
        0
      );

      const projetosFormatados: Projeto[] = projetosData.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        dataInicio: p.dataInicio || dataInicio,
        dataFim:    p.dataFim    || dataFim,
        horasRegistradas: horasData
          .filter((h: any) => h.projetoId === p.id)
          .reduce((acc: number, h: any) => acc + (h.horasTrabalhadas ?? h.horas ?? 0), 0),
        horasPrevistas: p.horasPrevistas ?? p.tempo ?? 8,
        status: p.status || "em_andamento",
      }));

      setDashboardData({
        totalHoras,
        totalProjetos:     projetosData.length,
        totalAlteracoes:   alteracoesData.length,
        profissional: {
          id:    userData.id,
          nome:  userData.nome,
          email: userData.email  || "",
          cargo: userData.cargo  || "Profissional",
        },
        projetos:           projetosFormatados,
        alteracoesRecentes: alteracoesData.slice(0, 10),
      });
    } catch (err) {
      console.error("Erro ao carregar dados:", err, { profId: filtroProfissionalId || userId });
      console.error("Erro ao carregar dados:", err, { profId: filtroProfissionalId || userId });
      const message = err instanceof Error ? err.message : "Erro ao carregar dados. Verifique sua conexão ou tente novamente mais tarde.";
      setError(message.includes("Failed to fetch")
        ? `Falha de conexão com o backend. Verifique se NEXT_PUBLIC_API_URL está configurado corretamente ou se o servidor está rodando.`
        ? `Falha de conexão com o backend. Verifique se NEXT_PUBLIC_API_URL está configurado corretamente ou se o servidor está rodando.`
        : message
      );
      setDashboardData(FALLBACK_DATA);
    } finally {
      setLoading(false);
    }
  };

  const profissional = dashboardData?.profissional || { nome: "Carregando..." };
  const projetos     = dashboardData?.projetos     || [];
  const alteracoes   = dashboardData?.alteracoesRecentes || [];
  const totalHoras   = dashboardData?.totalHoras   || 0;

  const projetosFiltrados = projetos.filter((projeto) => {
    if (filtroStatusSelect === "todos") return true;
    return projeto.status === filtroStatusSelect;
  });

  function getStatusBadge(horasRegistradas: number, horasPrevistas: number) {
    if (horasRegistradas > horasPrevistas) return { label: `+${horasRegistradas - horasPrevistas}h acima`, cls: "statusAtrasado" };
    if (horasRegistradas < horasPrevistas) return { label: `-${horasPrevistas - horasRegistradas}h abaixo`, cls: "statusAbaixo" };
    return { label: "no prazo", cls: "statusPrazo" };
  }

  function getBarColor(horasRegistradas: number, horasPrevistas: number) {
    if (horasRegistradas > horasPrevistas) return "#ef4444";
    if (horasRegistradas < horasPrevistas) return "#22c55e";
    return "#4f46e5";
  }

  function getBarWidth(horasRegistradas: number, horasPrevistas: number) {
    const maxHoras = Math.max(horasRegistradas, horasPrevistas);
    return Math.min((horasRegistradas / maxHoras) * 100, 100);
  }

  const openModal  = () => { setShowModal(true); setExported(false); };
  const closeModal = () => { setShowModal(false); setExporting(false); setExported(false); };

  const fmtDate = (iso: string) => {
    if (!iso) return "—";
    try { return new Date(iso + "T00:00").toLocaleDateString("pt-BR"); }
    catch { return iso; }
  };

  const fmtDateTime = (iso: string) => {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleString("pt-BR"); }
    catch { return iso; }
  };

  const toggleField = (key: keyof ExportFields) =>
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── CSV melhorado ──────────────────────────────────────────────────────────
  const exportarCSV = () => {
    const rows: string[] = [];
    const sep = ";";

    rows.push(`RELATORIO DE AUDITORIA`);
    rows.push(`Gerado em${sep}${new Date().toLocaleString("pt-BR")}`);
    rows.push(``);

    if (fields.periodo)      rows.push(`Periodo${sep}${fmtDate(dataInicio)} ate ${fmtDate(dataFim)}`);
    if (fields.profissional) rows.push(`Profissional${sep}${profissional.nome}`);
    if (fields.horasTotais)  rows.push(`Total de Horas${sep}${totalHoras}h`);

    if (fields.projetos) {
      rows.push(``);
      rows.push(`== PROJETOS ==`);
      rows.push(`Nome${sep}Data Inicio${sep}Data Fim${sep}Horas Registradas${sep}Meta de Horas${sep}Situacao`);
      projetosFiltrados.forEach((p) => {
        const situacao =
          p.horasRegistradas > p.horasPrevistas ? "Acima do previsto" :
          p.horasRegistradas < p.horasPrevistas ? "Abaixo do previsto" : "No prazo";
        rows.push(`${p.nome}${sep}${fmtDate(p.dataInicio)}${sep}${fmtDate(p.dataFim)}${sep}${p.horasRegistradas}h${sep}${p.horasPrevistas}h${sep}${situacao}`);
      });
      rows.push(`Total${sep}${sep}${sep}${projetosFiltrados.reduce((a, p) => a + p.horasRegistradas, 0)}h${sep}${projetosFiltrados.reduce((a, p) => a + p.horasPrevistas, 0)}h${sep}`);
    }

    if (fields.tarefas) {
      rows.push(``);
      rows.push(`== ALTERACOES RECENTES ==`);
      rows.push(`Tarefa${sep}Campo Alterado${sep}Valor Anterior${sep}Valor Novo${sep}Data e Hora${sep}Responsavel`);
      alteracoes.forEach((a) => {
        rows.push(`${a.tarefaNome}${sep}${a.campoAlterado}${sep}${a.valorAnterior}${sep}${a.valorNovo}${sep}${fmtDateTime(a.dataAlteracao)}${sep}${a.usuario}`);
      });
    }

    rows.push(``);
    rows.push(`Fim do relatorio`);

    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `auditoria_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportarPDF = async () => {
    if (!targetRef.current || exporting) return;
    setExporting(true);
    try {
      await generatePDF(targetRef, { filename: `auditoria_${new Date().toISOString().split("T")[0]}.pdf` });
      setExported(true);
      setTimeout(closeModal, 1400);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      setError("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportar = async () => {
    if (exporting) return;
    if (format === "csv") {
      exportarCSV();
      setExported(true);
      setTimeout(closeModal, 1400);
    } else {
      await exportarPDF();
    }
  };

  const anyFieldSelected = Object.values(fields).some(Boolean);

  const limparFiltros = () => {
    setFiltroProfissionalId("");
    setFiltroProjetoId("");
    setFiltroStatusSelect("todos");
    setFiltroPrioridade("todas");
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    setDataInicio(trintaDiasAtras.toISOString().split("T")[0]);
    setDataFim(hoje.toISOString().split("T")[0]);
  };

  if (loading && !dashboardData) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Carregando dados de auditoria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      <div className={styles.container}>
        <div className={styles.headerSection}>
          <div className={styles.headerLeft}>
            <h1 className={styles.titulo}>Auditoria</h1>
            <p className={styles.subtitulo}>Controle de alterações e auditoria de projetos</p>
          </div>
          <button className={styles.btnExport} onClick={openModal}>
             Exportar
          </button>
        </div>

        <div className={styles.menuContainer}>
          <div className={styles.filtros}>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className={styles.dateInput}
              placeholder="Data início"
            />
          </div>
          <div className={styles.filtros}>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className={styles.dateInput}
              placeholder="Data fim"
            />
          </div>

          <DropdownProfissional
            token={token}
            onSelect={(value) => {
              setFiltroProfissionalId(value);
              setFiltroProjetoId("");
            }}
          />

          <DropdownProjeto
            token={token}
            profissionalId={filtroProfissionalId || userId}
            onSelect={setFiltroProjetoId}
          />

          <DropdownStatus    onSelect={setFiltroStatusSelect} />
          <DropdownPrioridade onSelect={setFiltroPrioridade} />

          <button className={styles.btnLimpar} onClick={limparFiltros}>
             Limpar filtros
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <span></span>
            <p>{error}</p>
            <button onClick={fetchDashboardData}>Tentar novamente</button>
          </div>
        )}

        <div className={styles.kpisGrid}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcon}></span>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Total de horas</span>
              <strong className={styles.kpiValue}>{totalHoras}h</strong>
            </div>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcon}></span>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Projetos</span>
              <strong className={styles.kpiValue}>{dashboardData?.totalProjetos || 0}</strong>
            </div>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcon}></span>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Alterações</span>
              <strong className={styles.kpiValue}>{dashboardData?.totalAlteracoes || 0}</strong>
            </div>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcon}></span>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Profissional</span>
              <strong className={styles.kpiValue}>{profissional.nome}</strong>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}> Projetos</h2>
            <span className={styles.cardCount}>{projetosFiltrados.length} projetos</span>
          </div>
          <div className={styles.tabelaContainer}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Período</th>
                  <th>Horas</th>
                  <th>Progresso</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {projetosFiltrados.map((p) => {
                  const badge = getStatusBadge(p.horasRegistradas, p.horasPrevistas);
                  return (
                    <tr key={p.id}>
                      <td className={styles.projetoTitulo}>{p.nome}</td>
                      <td>
                        {fmtDate(p.dataInicio)} - {fmtDate(p.dataFim)}
                      </td>
                      <td>
                        <div className={styles.horasInfo}>
                          <span>{p.horasRegistradas}h</span>
                          <span className={styles.horasMeta}>/ {p.horasPrevistas}h</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${getBarWidth(p.horasRegistradas, p.horasPrevistas)}%`,
                              backgroundColor: getBarColor(p.horasRegistradas, p.horasPrevistas),
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[badge.cls]}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {projetosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      Nenhum projeto encontrado no período selecionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}> Alterações recentes</h2>
            <span className={styles.cardCount}>{alteracoes.length} alterações</span>
          </div>
          <div className={styles.tabelaContainer}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Tarefa</th>
                  <th>Campo alterado</th>
                  <th>Valor anterior</th>
                  <th>Valor novo</th>
                  <th>Data</th>
                  <th>Usuário</th>
                </tr>
              </thead>
              <tbody>
                {alteracoes.map((a) => (
                  <tr key={a.id}>
                    <td className={styles.tarefaNome}>{a.tarefaNome}</td>
                    <td>
                      <span className={styles.campoAlterado}>{a.campoAlterado}</span>
                    </td>
                    <td className={styles.valorAntigo}>{a.valorAnterior}</td>
                    <td className={styles.valorNovo}>{a.valorNovo}</td>
                    <td>{fmtDateTime(a.dataAlteracao)}</td>
                    <td>{a.usuario}</td>
                  </tr>
                ))}
                {alteracoes.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      Nenhuma alteração registrada no período
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.legendRow}>
            <div className={styles.legendItem}>
              <div className={styles.dot} style={{ backgroundColor: "#ef4444" }} />
              <span> Acima do prazo</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.dot} style={{ backgroundColor: "#22c55e" }} />
              <span> Abaixo do prazo</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.dot} style={{ backgroundColor: "#4f46e5" }} />
              <span> No prazo</span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modalConteudo}>
            <button className={styles.botaoFecharModal} onClick={closeModal}>×</button>

            <h3 className={styles.modalTitulo}> Exportar relatório</h3>
            <p className={styles.modalSubtitulo}>Escolha o formato e os dados que deseja exportar</p>

            <div className={styles.formatGroup}>
              <label className={styles.formatLabel}>Formato</label>
              <div className={styles.formatButtons}>
                <button
                  className={`${styles.formatBtn} ${format === "pdf" ? styles.formatBtnActive : ""}`}
                  onClick={() => setFormat("pdf")}
                >
                   PDF
                </button>
                <button
                  className={`${styles.formatBtn} ${format === "csv" ? styles.formatBtnActive : ""}`}
                  onClick={() => setFormat("csv")}
                >
                   CSV
                </button>
              </div>
            </div>

            <div className={styles.camposGroup}>
              <label className={styles.camposLabel}>Incluir no relatório</label>
              <div className={styles.listaCategorias}>
                {(Object.keys(fields) as (keyof ExportFields)[]).map((key) => {
                  const labels: Record<keyof ExportFields, string> = {
                    projetos:     " Projetos",
                    tarefas:      " Alterações",
                    profissional: " Profissional",
                    periodo:      " Período",
                    horasTotais:  " Total de horas",
                  };
                  return (
                    <label key={key} className={styles.opcaoCategoria}>
                      <input
                        type="checkbox"
                        checked={fields[key]}
                        onChange={() => toggleField(key)}
                      />
                      <span>{labels[key]}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={styles.modalPreview}>
              <p className={styles.modalPreviewTitle}>Prévia</p>
              <div className={styles.previewContent}>
                {fields.periodo      && <span> {fmtDate(dataInicio)} – {fmtDate(dataFim)}</span>}
                {fields.profissional && <span> {profissional.nome}</span>}
                {fields.horasTotais  && <span> {totalHoras}h totais</span>}
                {fields.projetos     && <span> {projetosFiltrados.length} projetos</span>}
                {fields.tarefas      && <span> {alteracoes.length} alterações</span>}
              </div>
            </div>

            {exported && <div className={styles.successMsg}>✓ Exportado com sucesso!</div>}

            <div className={styles.botoes}>
              <button className={styles.cancelar} onClick={closeModal}>Cancelar</button>
              <button
                className={styles.confirmar}
                onClick={handleExportar}
                disabled={exporting || exported || !anyFieldSelected}
              >
                {exporting ? " Exportando..." : exported ? " Exportado!" : ` Exportar ${format.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PDF melhorado ───────────────────────────────────────────────────── */}
      <div className={styles.pdfContainer}>
        <div ref={targetRef} className={styles.pdfContent}>

          {/* Cabeçalho com gradiente */}
          <div style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
            color: "#fff",
            padding: "32px 40px 24px",
            marginBottom: "32px",
            borderRadius: "4px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 700, letterSpacing: "-0.5px" }}>
                  Relatório de Auditoria
                </h1>
                <p style={{ margin: "6px 0 0", fontSize: "13px", opacity: 0.75 }}>
                  Gerado em {new Date().toLocaleString("pt-BR")}
                </p>
              </div>
              <div style={{ textAlign: "right", fontSize: "13px", opacity: 0.85 }}>
                {fields.periodo      && <p style={{ margin: 0 }}>Período: {fmtDate(dataInicio)} – {fmtDate(dataFim)}</p>}
                {fields.profissional && <p style={{ margin: "4px 0 0" }}>Profissional: {profissional.nome}</p>}
              </div>
            </div>

            {/* KPI cards no cabeçalho */}
            <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
              {fields.horasTotais && (
                <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "8px", padding: "12px 20px", minWidth: "100px" }}>
                  <div style={{ fontSize: "22px", fontWeight: 700 }}>{totalHoras}h</div>
                  <div style={{ fontSize: "11px", opacity: 0.75, marginTop: "2px" }}>Total de horas</div>
                </div>
              )}
              {fields.projetos && (
                <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "8px", padding: "12px 20px", minWidth: "100px" }}>
                  <div style={{ fontSize: "22px", fontWeight: 700 }}>{projetosFiltrados.length}</div>
                  <div style={{ fontSize: "11px", opacity: 0.75, marginTop: "2px" }}>Projetos</div>
                </div>
              )}
              {fields.tarefas && (
                <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "8px", padding: "12px 20px", minWidth: "100px" }}>
                  <div style={{ fontSize: "22px", fontWeight: 700 }}>{alteracoes.length}</div>
                  <div style={{ fontSize: "11px", opacity: 0.75, marginTop: "2px" }}>Alterações</div>
                </div>
              )}
            </div>
          </div>

          {/* Seção Projetos */}
          {fields.projetos && (
            <div style={{ marginBottom: "32px", padding: "0 4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{ width: "4px", height: "20px", background: "#4338ca", borderRadius: "2px" }} />
                <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1e1b4b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Projetos
                </h2>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#f1f0fe" }}>
                    {["Projeto", "Período", "Horas Registradas", "Meta", "Situação"].map((col) => (
                      <th key={col} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#4338ca", borderBottom: "2px solid #c7d2fe", whiteSpace: "nowrap" }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projetosFiltrados.map((p, i) => {
                    const situacao =
                      p.horasRegistradas > p.horasPrevistas
                        ? { label: `+${p.horasRegistradas - p.horasPrevistas}h acima`, color: "#ef4444", bg: "#fef2f2" }
                        : p.horasRegistradas < p.horasPrevistas
                        ? { label: `-${p.horasPrevistas - p.horasRegistradas}h abaixo`, color: "#16a34a", bg: "#f0fdf4" }
                        : { label: "No prazo", color: "#4338ca", bg: "#eef2ff" };
                    return (
                      <tr key={p.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "9px 12px", fontWeight: 600, color: "#111827" }}>{p.nome}</td>
                        <td style={{ padding: "9px 12px", color: "#6b7280" }}>{fmtDate(p.dataInicio)} – {fmtDate(p.dataFim)}</td>
                        <td style={{ padding: "9px 12px", fontWeight: 600, color: "#111827" }}>{p.horasRegistradas}h</td>
                        <td style={{ padding: "9px 12px", color: "#6b7280" }}>{p.horasPrevistas}h</td>
                        <td style={{ padding: "9px 12px" }}>
                          <span style={{ background: situacao.bg, color: situacao.color, padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 600 }}>
                            {situacao.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Linha de totais */}
                  <tr style={{ background: "#f1f0fe", fontWeight: 700, borderTop: "2px solid #c7d2fe" }}>
                    <td style={{ padding: "9px 12px", color: "#1e1b4b" }}>Total</td>
                    <td style={{ padding: "9px 12px" }} />
                    <td style={{ padding: "9px 12px", color: "#1e1b4b" }}>
                      {projetosFiltrados.reduce((a, p) => a + p.horasRegistradas, 0)}h
                    </td>
                    <td style={{ padding: "9px 12px", color: "#1e1b4b" }}>
                      {projetosFiltrados.reduce((a, p) => a + p.horasPrevistas, 0)}h
                    </td>
                    <td style={{ padding: "9px 12px" }} />
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Seção Alterações */}
          {fields.tarefas && (
            <div style={{ padding: "0 4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{ width: "4px", height: "20px", background: "#7c3aed", borderRadius: "2px" }} />
                <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1e1b4b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Alterações Recentes
                </h2>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#f5f3ff" }}>
                    {["Tarefa", "Campo", "Valor Anterior", "Valor Novo", "Data", "Responsável"].map((col) => (
                      <th key={col} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#7c3aed", borderBottom: "2px solid #ddd6fe", whiteSpace: "nowrap" }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alteracoes.map((a, i) => (
                    <tr key={a.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "9px 12px", fontWeight: 600, color: "#111827" }}>{a.tarefaNome}</td>
                      <td style={{ padding: "9px 12px" }}>
                        <span style={{ background: "#ede9fe", color: "#7c3aed", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 500 }}>
                          {a.campoAlterado}
                        </span>
                      </td>
                      <td style={{ padding: "9px 12px", color: "#ef4444", textDecoration: "line-through" }}>{a.valorAnterior}</td>
                      <td style={{ padding: "9px 12px", color: "#16a34a", fontWeight: 600 }}>{a.valorNovo}</td>
                      <td style={{ padding: "9px 12px", color: "#6b7280", fontSize: "11px" }}>{fmtDateTime(a.dataAlteracao)}</td>
                      <td style={{ padding: "9px 12px", color: "#374151" }}>{a.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Rodapé do PDF */}
          <div style={{ marginTop: "40px", paddingTop: "16px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#9ca3af" }}>
            <span>Relatório gerado automaticamente pelo sistema</span>
            <span>{new Date().toLocaleDateString("pt-BR")}</span>
          </div>

        </div>
      </div>
    </div>
  );
}