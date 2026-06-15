"use client";

import React, { useEffect, useState } from "react";
import styles from "./App.module.css";

type Cliente = {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  observacao: string;
  ativo: boolean;
  projetoIds: number[];
};

type Projeto = {
  id: number;
  nome: string;
  descricao: string;
  status: string;
};

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const storedToken =
      localStorage.getItem("token");

    setToken(storedToken);
  }, []);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [observacao, setObservacao] = useState('');

  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalAtualizar, setModalAtualizar] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);

  const [clienteSelecionado, setClienteSelecionado] =
    useState<Cliente | null>(null);

  const [projetoSelecionado, setProjetoSelecionado] = useState('');

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:8083/clientes',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      setClientes(data);

    } catch (error) {
      console.error(error);
    }
  };

  const atualizarClienteSelecionado = async (clienteId: number) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8083/clientes",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      setClientes(data);

      const clienteAtualizado = data.find(
        (c: Cliente) => c.id === clienteId
      );

      if (clienteAtualizado) {
        setClienteSelecionado(clienteAtualizado);
      }

    } catch (error) {
      console.error(error);
    }
  };

  const fetchProjetos = async () => {
    try {
      const response = await fetch(
        'http://localhost:8082/projeto'
      );

      const data = await response.json();
      setProjetos(data);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchProjetos();
  }, []);

  const [cnpjExiste, setCnpjExiste] = useState(false);
  const [shakeCnpj, setShakeCnpj] = useState(false);

  const verificarCnpj = (valor: string) => {
    setCnpj(valor);

    const existe = clientes.some(
      cliente =>
        cliente.cnpj.replace(/\D/g, '') ===
        valor.replace(/\D/g, '')
    );

    setCnpjExiste(existe);
  };

  const limparFormularioCadastro = () => {
    setNome('');
    setCnpj('');
    setEmail('');
    setTelefone('');
    setObservacao('');
    setCnpjExiste(false);
  };

  const cadastrarCliente = async () => {
    if (cnpjExiste) {
      setShakeCnpj(true);

      setTimeout(() => {
        setShakeCnpj(false);
      }, 500);

      return;
    }
    try {
      const token = localStorage.getItem('token');

      await fetch(
        'http://localhost:8083/clientes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nome,
            cnpj,
            email,
            telefone,
            observacao,
            projetoIds: []
          })
        }
      );

      setModalCadastro(false);
      limparFormularioCadastro();
      fetchClientes();

    } catch (error) {
      console.error(error);
    }
  };

  const [cnpjExisteEdit, setCnpjExisteEdit] = useState(false);

  const verificarCnpjEdit = (valor: string) => {
    setCnpjEdit(valor);

    const existe = clientes.some(
      cliente =>
        cliente.cnpj.replace(/\D/g, '') === valor.replace(/\D/g, '') &&
        cliente.id !== clienteSelecionado?.id
    );

    setCnpjExisteEdit(existe);
  };

  const atualizarCliente = async () => {
    if (!clienteSelecionado) return;

    if (cnpjExisteEdit) {
      alert('Este CNPJ já está cadastrado.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await fetch(
        `http://localhost:8083/clientes/${clienteSelecionado.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nome: nomeEdit,
            cnpj: cnpjEdit,
            email: emailEdit,
            telefone: telefoneEdit,
            observacao: clienteSelecionado.observacao,
            ativo: clienteSelecionado.ativo
          })
        }
      );

      await fetchClientes();
      setModalAtualizar(false);

    } catch (error) {
      console.error(error);
    }
  };

 const desativarCliente = async (id: number) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      `http://localhost:8083/clientes/${id}/desativar`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("Status:", response.status);
    console.log("OK:", response.ok);

    fetchClientes();

  } catch (error) {
    console.error("ERRO:", error);
  }
};

  const vincularProjeto = async () => {
    if (!clienteSelecionado) return;

    if (!projetoSelecionado) {
      alert('Selecione um projeto antes de vincular.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await fetch(
      `http://localhost:8083/clientes/${clienteSelecionado.id}/projetos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projetoIds: [Number(projetoSelecionado)]
        })
      }
    );

    await atualizarClienteSelecionado(
      clienteSelecionado.id
    );

    setProjetoSelecionado('');

    } catch (error) {
      console.error(error);
    }
  };

  const desvincularProjeto = async (
    clienteId: number,
    projetoId: number
  ) => {
    try {
      const token = localStorage.getItem('token');

      await fetch(
        `http://localhost:8083/clientes/${clienteId}/projetos/${projetoId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      await atualizarClienteSelecionado(clienteId);

    } catch (error) {
      console.error(error);
    }
  };

  const [paginaAtual, setPaginaAtual] = useState(1);

  const itensPorPagina = 6;

  const [filtroNome, setFiltroNome] = useState("");

  const [nomeEdit, setNomeEdit] = useState("");
  const [cnpjEdit, setCnpjEdit] = useState("");
  const [emailEdit, setEmailEdit] = useState("");
  const [telefoneEdit, setTelefoneEdit] = useState("");

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(filtroNome.toLowerCase())
  );

  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;

  const clientesPaginaAtual = clientesFiltrados.slice(
    indicePrimeiroItem,
    indiceUltimoItem
  );

  const totalPaginas = Math.ceil(
    clientesFiltrados.length / itensPorPagina
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Página de Clientes</h1>

      <div className={styles.filtros}>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={filtroNome}
          onChange={(e) => {
            setFiltroNome(e.target.value);
            setPaginaAtual(1);
          }}
          className={styles.inputFiltro}
        />
      </div>

      <div className={styles.tabelaContainer}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientesPaginaAtual.map(cliente => (
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{cliente.cnpj}</td>
                <td>{cliente.email}</td>
                <td>{cliente.telefone}</td>

                <td>
                  <span
                    className={
                      cliente.ativo
                        ? styles.ativo
                        : styles.inativo
                    }
                  >
                    {cliente.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>

                <td className={styles.acoes}>
                  <button
                    className={styles.botaoAbrirEdicao}
                    onClick={() => {
                      setClienteSelecionado(cliente);

                      setNomeEdit(cliente.nome);
                      setCnpjEdit(cliente.cnpj);
                      setEmailEdit(cliente.email);
                      setTelefoneEdit(cliente.telefone);
                      setCnpjExisteEdit(false);

                      setModalAtualizar(true);
                    }}
                  >
                    <img
                      src="/images/atualizar.svg"
                      className={styles.imagemBotao}
                    />
                  </button>

                  <button
                    className={styles.botaoDetalhes}
                    onClick={() => {
                      setClienteSelecionado(cliente);
                      setModalDetalhes(true);
                    }}
                  >
                    <img
                      src="/images/Expand.svg"
                      className={styles.imagemBotao}
                    />
                  </button>

                  <button
                    className={styles.botaoExcluir}
                    onClick={() => desativarCliente(cliente.id)}
                  >
                    <img
                      src="/images/deletar.svg"
                      className={styles.imagemBotao}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 0 && (
        <div className={styles.paginacao}>
          <button
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual(paginaAtual - 1)}
          >
            {"<"}
          </button>

          {[...Array(totalPaginas)].map((_, index) => (
            <button
              key={index}
              className={
                paginaAtual === index + 1
                  ? styles.pagAtivo
                  : ""
              }
              onClick={() => setPaginaAtual(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={paginaAtual >= totalPaginas}
            onClick={() => setPaginaAtual(paginaAtual + 1)}
          >
            {">"}
          </button>
        </div>
      )}

      <button
        className={styles.botaoAbrirModal}
        onClick={() => setModalCadastro(true)}
      >
        +
      </button>

      {modalCadastro && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalConteudo}>
            <button
              className={styles.botaoFecharModal}
              onClick={() => {
                setModalCadastro(false);
                limparFormularioCadastro();
              }}
            >
              ×
            </button>

            <h2 className={styles.tituloModal}>Cadastro de Cliente</h2>

            <div className={styles.inputWrapper}>
              <label>Nome</label>
              <input
                className={styles.inputStyle}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label>CNPJ</label>
              <input
                className={`
                  ${styles.inputStyle}
                  ${cnpjExiste ? styles.inputErro : ""}
                  ${shakeCnpj ? styles.shake : ""}
                `}
                value={cnpj}
                onChange={(e) => verificarCnpj(e.target.value)}
              />
              {cnpjExiste && (
                <span className={styles.erroTexto}>
                  Este CNPJ já está cadastrado.
                </span>
              )}
            </div>

            <div className={styles.inputWrapper}>
              <label>Email</label>
              <input
                className={styles.inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label>Telefone</label>
              <input
                className={styles.inputStyle}
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>

            <div className={styles.botoes}>
              <button
                className={styles.cancelar}
                onClick={() => {
                  setModalCadastro(false);
                  limparFormularioCadastro();
                }}
              >
                Cancelar
              </button>

              <button
                className={styles.confirmar}
                onClick={cadastrarCliente}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAtualizar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalConteudo}>
            <button
              className={styles.botaoFecharModal}
              onClick={() => setModalAtualizar(false)}
            >
              ×
            </button>

            <h2 className={styles.tituloModal}>Atualizar Cliente</h2>

            <div className={styles.inputWrapper}>
              <label>Nome</label>
              <input
                className={styles.inputStyle}
                value={nomeEdit}
                onChange={(e) => setNomeEdit(e.target.value)}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label>CNPJ</label>
              <input
                className={`${styles.inputStyle} ${
                  cnpjExisteEdit ? styles.inputErro : ""
                }`}
                value={cnpjEdit}
                onChange={(e) => verificarCnpjEdit(e.target.value)}
              />
              {cnpjExisteEdit && (
                <p className={styles.mensagemErro}>
                  Este CNPJ já está cadastrado.
                </p>
              )}
            </div>

            <div className={styles.inputWrapper}>
              <label>Email</label>
              <input
                className={styles.inputStyle}
                value={emailEdit}
                onChange={(e) => setEmailEdit(e.target.value)}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label>Telefone</label>
              <input
                className={styles.inputStyle}
                value={telefoneEdit}
                onChange={(e) => setTelefoneEdit(e.target.value)}
              />
            </div>

            <div className={styles.botoes}>
              <button
                className={styles.cancelar}
                onClick={() => setModalAtualizar(false)}
              >
                Cancelar
              </button>

              <button
                className={styles.confirmar}
                onClick={atualizarCliente}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalDetalhes && clienteSelecionado && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalConteudo}>
            <button
              className={styles.botaoFecharModal}
              onClick={() => setModalDetalhes(false)}
            >
              ×
            </button>

            <h2 className={styles.tituloModal}>
              Projetos Vinculados
            </h2>

            <div className={styles.inputWrapper}>
              <label>Cliente</label>

              <input
                disabled
                value={clienteSelecionado.nome}
                className={styles.inputStyle}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label>Adicionar Projeto</label>

              <select
                className={styles.selectStyle}
                value={projetoSelecionado}
                onChange={(e) =>
                  setProjetoSelecionado(e.target.value)
                }
              >
                <option value="">
                  Selecione um projeto
                </option>

                {projetos.map((projeto) => (
                  <option
                    key={projeto.id}
                    value={projeto.id}
                  >
                    {projeto.nome}
                  </option>
                ))}
              </select>
            </div>

            <button
              className={styles.confirmar}
              style={{ marginBottom: "20px" }}
              onClick={vincularProjeto}
              disabled={!projetoSelecionado}
            >
              Vincular Projeto
            </button>

            <div>
              <h3>Projetos já vinculados</h3>

              {clienteSelecionado.projetoIds.map((projetoId) => {
                const projeto = projetos.find(
                  p => p.id === projetoId
                );

                return (
                  <div
                    key={projetoId}
                    style={{
                      padding: "10px",
                      marginTop: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span>
                      {projeto?.nome || `Projeto ${projetoId}`}
                    </span>

                    <button
                      className={styles.botaoRemover}
                      onClick={() =>
                        desvincularProjeto(
                          clienteSelecionado.id,
                          projetoId
                        )
                      }
                    >
                      Remover
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}