"use client"
import styles from './App.module.css';
import { useState } from 'react';
import Select, { SingleValue } from 'react-select';

type Option = {
  value: string;
  label: string;
};

const mockTarefas = [
  { id: 1, nome: "Modelagem do Banco", descricao: "Criar tabelas e relações no SQL", projeto: "projeto-1", responsavel: "profissional-a", status: "done" },
  { id: 2, nome: "Criar tela de Login", descricao: "Fazer o layout e conectar com API", projeto: "projeto-1", responsavel: "profissional-b", status: "doing" },
  { id: 3, nome: "Ajustar responsividade", descricao: "Menu está quebrando no celular", projeto: "projeto-2", responsavel: "profissional-a", status: "todo" },
  { id: 4, nome: "Reunião de Planning", descricao: "Definir tarefas da próxima semana", projeto: "projeto-3", responsavel: "profissional-c", status: "todo" },
  { id: 5, nome: "Corrigir bug no carrinho", descricao: "Soma total está calculando errado", projeto: "projeto-2", responsavel: "profissional-b", status: "doing" }
];

const projetosOptions: Option[] = [
  { value: "", label: "Todos os Projetos" },
  { value: "projeto-1", label: "Projeto 1" },
  { value: "projeto-2", label: "Projeto 2" },
  { value: "projeto-3", label: "Projeto 3" }
];

const responsavelOptions: Option[] = [
  { value: "", label: "Todos os Responsáveis" },
  { value: "profissional-a", label: "Profissional A" },
  { value: "profissional-b", label: "Profissional B" },
  { value: "profissional-c", label: "Profissional C" }
];

const statusOptions: Option[] = [
  { value: "", label: "Todos os Status" },
  { value: "todo", label: "To Do" },
  { value: "doing", label: "Doing" },
  { value: "done", label: "Done" }
];

export default function Page() {
  const [projeto, setProjeto] = useState<Option | null>(null);
  const [responsavel, setResponsavel] = useState<Option | null>(null);
  const [status, setStatus] = useState<Option | null>(null);

  const limparFiltros = () => {
    setProjeto(null);
    setResponsavel(null);
    setStatus(null);
  };

  const tarefasFiltradas = mockTarefas.filter((tarefa) => {
    const matchProjeto = !projeto || projeto.value === "" || tarefa.projeto === projeto.value;
    const matchResponsavel = !responsavel || responsavel.value === "" || tarefa.responsavel === responsavel.value;
    const matchStatus = !status || status.value === "" || tarefa.status === status.value;

    return matchProjeto && matchResponsavel && matchStatus;
  });

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: "#012643",
      border: "none",
      borderRadius: "8px",
      minHeight: "40px",
      boxShadow: "none",
      cursor: "pointer",
    }),

    valueContainer: (base: any) => ({
      ...base,
      color: "#ffffff",
    }),

    singleValue: (base: any) => ({
      ...base,
      color: "#ffffff",
      fontSize: "15px",
    }),

    placeholder: (base: any) => ({
      ...base,
      color: "#ffffff",
      opacity: 1,
      fontSize: "15px"
    }),

    input: (base: any) => ({
      ...base,
      color: "#ffffff",
    }),

    dropdownIndicator: (base: any) => ({
      ...base,
      color: "#ffffff",

      "&:hover": {
        color: "#ffffff",
      },
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    menu: (base: any) => ({
      ...base,
      backgroundColor: "#012643",
      borderRadius: "8px",
      overflow: "hidden",
    }),

    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "#033763" : "#012643",
      color: "#ffffff",
      padding: "10px 16px",
      cursor: "pointer",
    }),
  };

  const tableSelectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: "#fff",
      border: "1px solid #e1e4e8",
      borderRadius: "6px",
      minHeight: "32px",
      maxWidth: "100px",
      boxShadow: "none",
    }),

    singleValue: (base: any) => ({
      ...base,
      color: "#333",
      fontSize: "14px",
    }),

    menu: (base: any) => ({
      ...base,
      backgroundColor: "#fff",
    }),

    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "#f6f8fa" : "#fff",
      color: "#333",
      cursor: "pointer",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.containerSelect}>
        
        <Select<Option>
          instanceId="projeto"
          options={projetosOptions}
          value={projeto}
          onChange={(selected: SingleValue<Option>) => setProjeto(selected)}
          className={styles.select}
          styles={selectStyles}
          placeholder="Projetos"
          isSearchable={false}
        />

        <Select<Option>
          instanceId="responsavel"
          options={responsavelOptions}
          value={responsavel}
          onChange={(selected: SingleValue<Option>) => setResponsavel(selected)}
          className={styles.select}
          styles={selectStyles}
          placeholder="Responsáveis"
          isSearchable={false}
        />

        <Select<Option>
          instanceId="status"
          options={statusOptions}
          value={status}
          onChange={(selected: SingleValue<Option>) => setStatus(selected)}
          className={styles.select}
          styles={selectStyles}
          placeholder="Status"
          isSearchable={false}
        />

        <button onClick={limparFiltros}>Limpar</button>
      </div>

      <main className={styles.tableContainer}>
        <table className={styles.taskTable}>
          <thead>
            <tr>
              <th>Nome da Tarefa</th>
              <th>Descrição</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {tarefasFiltradas.length > 0 ? (
              tarefasFiltradas.map((tarefa) => (
                <tr key={tarefa.id}>
                  <td>{tarefa.nome}</td>
                  <td>{tarefa.descricao}</td>

                  <td>
                    {tarefa.responsavel === "profissional-a" ? "Profissional A" :
                     tarefa.responsavel === "profissional-b" ? "Profissional B" : "Profissional C"}
                  </td>

                  <td>
                    <Select<Option>
                      instanceId={`status-${tarefa.id}`}
                      options={statusOptions.filter(opt => opt.value !== "")}
                      defaultValue={statusOptions.find(opt => opt.value === tarefa.status)}
                      className={styles.selectTable}
                      styles={tableSelectStyles}
                      isSearchable={false}
                    />
                  </td>

                  <td>CRUD</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                  Nenhuma tarefa encontrada com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>

      <button className={styles.btnAdicionarMais}>
        +
      </button>
    </div>
  );
}