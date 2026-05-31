"use client";
import styles from './App.module.css';
import { useEffect, useState } from 'react';
import Select, { SingleValue } from 'react-select';
import axios from 'axios';

type Option = {
  value: string;
  label: string;
};

type Tarefa = {
  id: number;
  nome: string;
  descricao: string;
  idProjeto: number;
  idResponsaveis: number[];
  status: string;
};

const statusOptions: Option[] = [
  { value: "", label: "Todos os Status" },
  { value: "TO_DO", label: "To Do" },
  { value: "DOING", label: "Doing" },
  { value: "DONE", label: "Done" },
  { value: "BLOCKED", label: "Bloqueada" }
];

// O task-service devolve o status em formatos diferentes conforme o endpoint:
//  - GET /tarefas              -> "To Do" / "Doing" / "Done"  (label amigável)
//  - GET /tarefas/projeto/{id} -> "TO_DO" / "DOING" / ...      (nome do enum)
// Normaliza ambos para o valor canônico do enum para comparar e exibir.
const normalizeStatus = (s: string | null | undefined): string =>
  (s ?? "").trim().toUpperCase().replace(/\s+/g, "_");

export default function Page() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [projetoOptions, setProjetoOptions] = useState<Option[]>([]);
  const [responsavelOptions, setResponsavelOptions] = useState<Option[]>([]);
  const [projeto, setProjeto] = useState<Option | null>(null);
  const [responsavel, setResponsavel] = useState<Option | null>(null);
  const [status, setStatus] = useState<Option | null>(null);
  const [modalProjeto, setModalProjeto] = useState(false);
  const [responsaveisModal, setResponsaveisModal] = useState<Option[]>([]);
  const [nomeTarefa, setNomeTarefa] = useState("");
  const [descricaoTarefa, setDescricaoTarefa] = useState("");
  const [modalEditar, setModalEditar] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null);
  const [nomeEdit, setNomeEdit] = useState("");
  const [descricaoEdit, setDescricaoEdit] = useState("");
  const [responsaveisEdit, setResponsaveisEdit] = useState<Option[]>([]);

  const API = "http://localhost:8085/tarefas";

  const fetchProjetos = async () => {
    try {
      const res = await axios.get("http://localhost:8082/projeto");
      const options = res.data.map((p: any) => ({
        value: p.id.toString(),
        label: p.nome
      }));
      setProjetoOptions([{ value: "", label: "Todos os Projetos" }, ...options]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:8083/usuario/todos");
      const options = res.data.map((u: any) => ({
        value: u.id.toString(),
        label: u.nome
      }));
      setResponsavelOptions([{ value: "", label: "Todos os Responsáveis" }, ...options]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTarefas = async () => {
    try {
      const url = projeto && projeto.value !== "" ? `${API}/projeto/${projeto.value}` : API;
      const res = await axios.get(url);
      setTarefas(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProjetos();
    fetchUsuarios();
  }, []);

  useEffect(() => {
    fetchTarefas();
  }, [projeto]);

  const salvarTarefa = async () => {
    if (!projeto || projeto.value === "") {
      alert("Selecione um projeto");
      return;
    }
    if (!nomeTarefa || !descricaoTarefa) return;
    try {
      await axios.post(API, {
        nome: nomeTarefa,
        descricao: descricaoTarefa,
        idProjeto: Number(projeto.value),
        idResponsaveis: responsaveisModal.map(r => Number(r.value)),
        statusTarefa: "TO_DO"
      });
      setModalProjeto(false);
      setNomeTarefa("");
      setDescricaoTarefa("");
      setResponsaveisModal([]);
      fetchTarefas();
    } catch (e) {
      console.error(e);
    }
  };

  const atualizarTarefa = async () => {
    if (!tarefaEditando) return;
    try {
      await axios.patch(`${API}/${tarefaEditando.id}`, {
        nome: nomeEdit,
        descricao: descricaoEdit,
        idProjeto: tarefaEditando.idProjeto,
        idResponsaveis: responsaveisEdit.map(r => Number(r.value)),
        statusTarefa: normalizeStatus(tarefaEditando.status)
      });
      setModalEditar(false);
      setTarefaEditando(null);
      fetchTarefas();
    } catch (e: any) {
      console.error("status:", e.response?.status);
      console.error("data:", JSON.stringify(e.response?.data));
      console.error("config url:", e.config?.url);
    }
  };

  const abrirModalEditar = (t: Tarefa) => {
    setTarefaEditando(t);
    setNomeEdit(t.nome);
    setDescricaoEdit(t.descricao);
    setResponsaveisEdit(
      responsavelOptions.filter(r => t.idResponsaveis.includes(Number(r.value)))
    );
    setModalEditar(true);
  };

  const atualizarStatus = async (id: number, value: string) => {
    try {
      await axios.patch(`${API}/${id}`, { statusTarefa: value });
      fetchTarefas();
    } catch (e) {
      console.error(e);
    }
  };

  const deletar = async (id: number) => {
    try {
      await axios.delete(`${API}/${id}`);
      fetchTarefas();
    } catch (e) {
      console.error(e);
    }
  };

  const limparFiltros = () => {
    setProjeto(null);
    setResponsavel(null);
    setStatus(null);
  };

  const tarefasFiltradas = tarefas.filter((t) => {
    const matchResp =
      !responsavel || responsavel.value === "" ||
      t.idResponsaveis.includes(Number(responsavel.value));
    const matchStatus =
      !status || status.value === "" ||
      normalizeStatus(t.status) === status.value;
    return matchResp && matchStatus;
  });

  const selectStyles = {
    control: (b: any) => ({ ...b, backgroundColor: "#012643", border: "none", borderRadius: "8px", minHeight: "40px" }),
    singleValue: (b: any) => ({ ...b, color: "#fff" }),
    placeholder: (b: any) => ({ ...b, color: "#fff" }),
    menu: (b: any) => ({ ...b, backgroundColor: "#012643" }),
    option: (b: any, s: any) => ({ ...b, backgroundColor: s.isFocused ? "#033763" : "#012643", color: "#fff" })
  };

  const tableSelectStyles = {
    control: (b: any) => ({ ...b, backgroundColor: "#fff", minHeight: "32px" }),
    singleValue: (b: any) => ({ ...b, color: "#333" }),
  };

  const modalSelectStyles = {
    control: (b: any) => ({ ...b, backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px", minHeight: "40px" }),
    singleValue: (b: any) => ({ ...b, color: "#333" }),
    placeholder: (b: any) => ({ ...b, color: "#888" }),
    menu: (b: any) => ({ ...b, backgroundColor: "#fff" }),
    option: (b: any, s: any) => ({ ...b, backgroundColor: s.isFocused ? "#E8EFF9" : "#fff", color: "#012643" }),
    multiValue: (b: any) => ({ ...b, backgroundColor: "#E8EFF9" }),
    multiValueLabel: (b: any) => ({ ...b, color: "#012643" }),
    multiValueRemove: (b: any) => ({ ...b, color: "#012643" }),
  };

  return (
    <div className={styles.pageContainer}>

      <div className={styles.containerSelect}>
        <Select
          instanceId="projeto-select"
          options={projetoOptions}
          value={projeto}
          onChange={(s) => setProjeto(s)}
          styles={selectStyles}
          placeholder="Projetos"
        />
        <Select
          instanceId="responsavel-select"
          options={responsavelOptions}
          value={responsavel}
          onChange={(s) => setResponsavel(s)}
          styles={selectStyles}
          placeholder="Responsáveis"
        />
        <Select
          instanceId="status-select"
          options={statusOptions}
          value={status}
          onChange={(s) => setStatus(s)}
          styles={selectStyles}
          placeholder="Status"
        />
        <button onClick={limparFiltros}>Limpar</button>
      </div>

      <main className={styles.tableContainer}>
        <table className={styles.taskTable}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tarefasFiltradas.map((t) => (
              <tr key={t.id}>
                <td>{t.nome}</td>
                <td>{t.descricao}</td>
                <td>
                  {t.idResponsaveis
                    .map(id => responsavelOptions.find(r => r.value === id.toString())?.label)
                    .filter(Boolean)
                    .join(", ") || "Sem responsável"}
                </td>
                <td>
                  <Select
                    instanceId={`select-status-table-${t.id}`}
                    options={statusOptions.filter(o => o.value)}
                    value={statusOptions.find(o => o.value === normalizeStatus(t.status))}
                    onChange={(s) => atualizarStatus(t.id, s!.value)}
                    styles={tableSelectStyles}
                  />
                </td>
                <td>
                  <button className={styles.botaoAbrirEdicao} onClick={() => abrirModalEditar(t)}>
                    <img src="/images/atualizar.svg" className={styles.imagemBotao} alt="Editar" />
                  </button>
                  <button className={styles.botaoExcluir} onClick={() => deletar(t.id)}>
                    <img src="/images/deletar.svg" className={styles.imagemBotao} alt="Deletar" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {projeto && projeto.value !== "" && (
        <button className={styles.btnAdicionarMais} onClick={() => setModalProjeto(true)}>+</button>
      )}

      {modalProjeto && (
        <div className={styles.modalOverlay} onClick={() => setModalProjeto(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Nova Tarefa</h2>
            <input placeholder="Insira o nome da Tarefa" value={nomeTarefa} onChange={(e) => setNomeTarefa(e.target.value)} />
            <textarea placeholder="Insira a descrição da Tarefa" value={descricaoTarefa} onChange={(e) => setDescricaoTarefa(e.target.value)} />
            <Select
              instanceId="select-responsaveis-modal"
              isMulti
              options={responsavelOptions.filter(o => o.value)}
              value={responsaveisModal}
              onChange={(s) => setResponsaveisModal(s as Option[])}
              styles={modalSelectStyles}
            />
            <div className={styles.modalButtons}>
              <button onClick={() => setModalProjeto(false)} className={styles.modalButton}>Fechar</button>
              <button onClick={salvarTarefa} className={styles.modalButton}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {modalEditar && tarefaEditando && (
        <div className={styles.modalOverlay} onClick={() => setModalEditar(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Editar Tarefa</h2>
            <input placeholder="Nome da Tarefa" value={nomeEdit} onChange={(e) => setNomeEdit(e.target.value)} />
            <textarea placeholder="Descrição da Tarefa" value={descricaoEdit} onChange={(e) => setDescricaoEdit(e.target.value)} />
            <Select
              instanceId="select-responsaveis-edit"
              isMulti
              options={responsavelOptions.filter(o => o.value)}
              value={responsaveisEdit}
              onChange={(s) => setResponsaveisEdit(s as Option[])}
              styles={modalSelectStyles}
            />
            <div className={styles.modalButtons}>
              <button onClick={() => setModalEditar(false)} className={styles.modalButton}>Fechar</button>
              <button onClick={atualizarTarefa} className={styles.modalButton}>Salvar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}