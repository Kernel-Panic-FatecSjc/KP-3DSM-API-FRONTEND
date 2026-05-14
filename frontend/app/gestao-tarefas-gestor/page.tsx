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
  { value: "DONE", label: "Done" }
];

export default function Page() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);

  // OPTIONS vindos da API
  const [projetoOptions, setProjetoOptions] = useState<Option[]>([]);
  const [responsavelOptions, setResponsavelOptions] = useState<Option[]>([]);

  // VALORES selecionados
  const [projeto, setProjeto] = useState<Option | null>(null);
  const [responsavel, setResponsavel] = useState<Option | null>(null);
  const [status, setStatus] = useState<Option | null>(null);

  const [modalProjeto, setModalProjeto] = useState(false);
  const [responsavelModal, setResponsavelModal] = useState<Option | null>(null);

  const [nomeTarefa, setNomeTarefa] = useState("");
  const [descricaoTarefa, setDescricaoTarefa] = useState("");

  const API = "http://localhost:8085/tarefas";


  // -------- PROJETOS
  const fetchProjetos = async () => {
    try {
      const res = await axios.get("http://localhost:8082/projeto");

      const options = res.data.map((p: any) => ({
        value: p.id.toString(),
        label: p.nome
      }));

      setProjetoOptions([
        { value: "", label: "Todos os Projetos" },
        ...options
      ]);
    } catch (e) {
      console.error(e);
    }
  };


  // -------- USUARIOS
  const fetchUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:8083/usuario/todos");

      const options = res.data.map((u: any) => ({
        value: u.id.toString(),
        label: u.nome
      }));

      setResponsavelOptions([
        { value: "", label: "Todos os Responsáveis" },
        ...options
      ]);
    } catch (e) {
      console.error(e);
    }
  };


  // -------- TAREFAS
  const fetchTarefas = async () => {
    try {
      setLoading(true);

      const url =
        projeto && projeto.value !== ""
          ? `${API}/projeto/${projeto.value}`
          : API;

      const res = await axios.get(url);
      setTarefas(res.data);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjetos();
    fetchUsuarios();
  }, []);

  useEffect(() => {
    fetchTarefas();
  }, [projeto]);

  // -------- CRUD
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
        idResponsaveis: responsavelModal ? [Number(responsavelModal.value)] : [],
        statusTarefa: "TO_DO"
      });

      setModalProjeto(false);
      setNomeTarefa("");
      setDescricaoTarefa("");
      setResponsavelModal(null);

      fetchTarefas();
    } catch (e) {
      console.error(e);
    }
  };

  const atualizarStatus = async (id: number, value: string) => {
    try {
      await axios.patch(`${API}/${id}`, {
        statusTarefa: value
      });

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
      t.status === status.value;

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

  if (loading) return <div>Carregando...</div>;

  return (
    <div className={styles.pageContainer}>

      <div className={styles.containerSelect}>

        <Select
          options={projetoOptions}
          value={projeto}
          onChange={(s) => setProjeto(s)}
          styles={selectStyles}
          placeholder="Projetos"
        />

        <Select
          options={responsavelOptions}
          value={responsavel}
          onChange={(s) => setResponsavel(s)}
          styles={selectStyles}
          placeholder="Responsáveis"
        />

        <Select
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
                  {
                    responsavelOptions.find(r =>
                      r.value === t.idResponsaveis[0]?.toString()
                    )?.label || "Sem responsável"
                  }
                </td>

                <td>
                  <Select
                    options={statusOptions.filter(o => o.value)}
                    value={statusOptions.find(
                      o => o.value === t.status || o.label === t.status
                    )}
                    onChange={(s) => atualizarStatus(t.id, s!.value)}
                    styles={tableSelectStyles}
                  />
                </td>

                <td>
                  <button 
                    className={styles.botaoExcluir} 
                    onClick={() => deletar(t.id)}>
                    <img
                      src="/images/deletar.svg"
                      className={styles.imagemBotao}
                      alt="Deletar"
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <button className={styles.btnAdicionarMais} onClick={() => setModalProjeto(true)}>+</button>

      {modalProjeto && (
        <div className={styles.modalOverlay} onClick={() => setModalProjeto(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

            <h2>Nova Tarefa</h2>

            <input placeholder = "Insira o nome da Tarefa" value={nomeTarefa} onChange={(e) => setNomeTarefa(e.target.value)} />

            <textarea placeholder = "Insira a descrição da Tarefa" value={descricaoTarefa} onChange={(e) => setDescricaoTarefa(e.target.value)} />

            <Select
              options={responsavelOptions.filter(o => o.value)}
              value={responsavelModal}
              onChange={(s) => setResponsavelModal(s)}
              styles={selectStyles}
            />

            <div className={styles.modalButtons}>
              <button onClick={() => setModalProjeto(false)} className={styles.modalButton}>Fechar</button>
              <button onClick={salvarTarefa} className={styles.modalButton}>Salvar</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}


