"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./app.module.css";
import NavigationBar from "../../components/layout/navegationBar/navegationBar";
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

const API_URL = '';

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

      // Buscar dados do usuário
      const userResponse = await fetch(`${API_URL}/api/usuario/${profId}`, { headers });
      if (!userResponse.ok) throw new Error(`Erro ao buscar dados do usuário (${userResponse.status})`);
      const userData = await userResponse.json();

      // Buscar projetos via /api/projeto (reescrito para port 8082)
      const projetosResponse = await fetch(`${API_URL}/api/projeto`, { headers });

      // Buscar horas via /api/horas/filtrar (reescrito para port 8084)
      const horasParams = new URLSearchParams();
      horasParams.append('usuarioId', profId);
      horasParams.append('dataInicio', dataInicio);
      horasParams.append('dataFim', dataFim);
      const horasResponse = await fetch(`${API_URL}/api/horas/filtrar?${horasParams.toString()}`, { headers });

      // Buscar alterações via /api/tarefas/alteracoes (reescrito para port 8085)
      const alteracoesParams = new URLSearchParams();
      alteracoesParams.append('dataInicio', dataInicio);
      alteracoesParams.append('dataFim', dataFim);
      if (filtroPrioridade !== "todas") alteracoesParams.append('prioridade', filtroPrioridade);
      if (filtroProjetoId && filtroProjetoId !== "todos") alteracoesParams.append('projetoId', filtroProjetoId);
      const alteracoesResponse = await fetch(`${API_URL}/api/tarefas/alteracoes?${alteracoesParams.toString()}`, { headers });

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
      const message = err instanceof Error ? err.message : "Erro ao carregar dados. Verifique sua conexão ou tente novamente mais tarde.";
      setError(message.includes("Failed to fetch")
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

  const exportarCSV = () => {
    const rows: string[] = [];
    const sep = ";";

    if (fields.periodo)      rows.push(`Período${sep}${fmtDate(dataInicio)} – ${fmtDate(dataFim)}`);
    if (fields.profissional) rows.push(`Profissional${sep}${profissional.nome}`);
    if (fields.horasTotais)  rows.push(`Total de horas${sep}${totalHoras}h`);

    if (fields.projetos) {
      rows.push("", "Projetos", `Nome${sep}Data Início${sep}Data Fim${sep}Horas registradas${sep}Meta${sep}Status`);
      projetosFiltrados.forEach((p) => {
        const status = p.horasRegistradas > p.horasPrevistas ? "Acima" : p.horasRegistradas < p.horasPrevistas ? "Abaixo" : "No prazo";
        rows.push(`${p.nome}${sep}${fmtDate(p.dataInicio)}${sep}${fmtDate(p.dataFim)}${sep}${p.horasRegistradas}h${sep}${p.horasPrevistas}h${sep}${status}`);
      });
    }

    if (fields.tarefas) {
      rows.push("", "Alterações recentes", `Tarefa${sep}Campo alterado${sep}Valor anterior${sep}Valor novo${sep}Data${sep}Usuário`);
      alteracoes.forEach((a) => {
        rows.push(`${a.tarefaNome}${sep}${a.campoAlterado}${sep}${a.valorAnterior}${sep}${a.valorNovo}${sep}${fmtDateTime(a.dataAlteracao)}${sep}${a.usuario}`);
      });
    }

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

      <div className={styles.pdfContainer}>
        <div ref={targetRef} className={styles.pdfContent}>
          <div className={styles.pdfHeader}>
            <h1>Relatório de Auditoria</h1>
            <p>Gerado em {new Date().toLocaleString("pt-BR")}</p>
          </div>
          {fields.periodo      && <p> Período: {fmtDate(dataInicio)} – {fmtDate(dataFim)}</p>}
          {fields.profissional && <p> Profissional: {profissional.nome}</p>}
          {fields.horasTotais  && <p> Total de horas: {totalHoras}h</p>}
          {fields.projetos && (
            <>
              <h2> Projetos</h2>
              {projetosFiltrados.map((p) => (
                <div key={p.id} className={styles.pdfItem}>
                  <p><strong>{p.nome}</strong></p>
                  <p>Período: {fmtDate(p.dataInicio)} – {fmtDate(p.dataFim)}</p>
                  <p>Horas: {p.horasRegistradas}h / {p.horasPrevistas}h</p>
                </div>
              ))}
            </>
          )}
          {fields.tarefas && (
            <>
              <h2> Alterações</h2>
              {alteracoes.map((a) => (
                <div key={a.id} className={styles.pdfItem}>
                  <p><strong>{a.tarefaNome}</strong></p>
                  <p>{a.campoAlterado}: {a.valorAnterior} → {a.valorNovo}</p>
                  <p>Data: {fmtDateTime(a.dataAlteracao)}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}