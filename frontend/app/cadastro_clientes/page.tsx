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

const formatarCnpj = (valor: string) => {
  const digitos = valor.replace(/\D/g, '').slice(0, 14);
  return digitos
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const cnpjValido = (valor: string) => {
  const cnpj = valor.replace(/\D/g, '');

  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const calcularDigito = (tamanho: number, pesoInicial: number) => {
    let soma = 0;
    let peso = pesoInicial;

    for (let i = 0; i < tamanho; i++) {
      soma += Number(cnpj[i]) * peso--;
      if (peso < 2) peso = 9;
    }

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  return calcularDigito(12, 5) === Number(cnpj[12]) &&
    calcularDigito(13, 6) === Number(cnpj[13]);
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

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({ 
    message: '', 
    type: 'success', 
    visible: false 
  });

  const mostrarToast = (message: string, type: 'success' | 'error' = 'success', duracao: number = 4000) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, duracao);
  };

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
      mostrarToast('Erro ao buscar clientes', 'error');
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
      mostrarToast('Erro ao atualizar cliente selecionado', 'error');
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
      mostrarToast('Erro ao buscar projetos', 'error');
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchProjetos();
  }, []);

  const [cnpjExiste, setCnpjExiste] = useState(false);
  const [cnpjInvalido, setCnpjInvalido] = useState(false);
  const [shakeCnpj, setShakeCnpj] = useState(false);

  const verificarCnpj = (valor: string) => {
    const cnpjFormatado = formatarCnpj(valor);
    setCnpj(cnpjFormatado);

    const existe = clientes.some(
      cliente =>
        cliente.cnpj.replace(/\D/g, '') ===
        cnpjFormatado.replace(/\D/g, '')
    );

    setCnpjExiste(existe);
    setCnpjInvalido(cnpjFormatado.length > 0 && !cnpjValido(cnpjFormatado));
  };

  const limparFormularioCadastro = () => {
    setNome('');
    setCnpj('');
    setEmail('');
    setTelefone('');
    setObservacao('');
    setCnpjExiste(false);
    setCnpjInvalido(false);
  };

  const cadastrarCliente = async () => {
    if (cnpjExiste || cnpjInvalido) {
      setShakeCnpj(true);

      setTimeout(() => {
        setShakeCnpj(false);
      }, 500);

      mostrarToast(cnpjExiste ? 'Este CNPJ já está cadastrado' : 'CNPJ inválido', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:8083/clientes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nome,
            cnpj: cnpj.replace(/\D/g, ''),
            email,
            telefone,
            observacao,
            projetoIds: []
          })
        }
      );

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.message || 'Erro ao cadastrar cliente');
      }

      mostrarToast('Cliente cadastrado com sucesso!', 'success');
      setModalCadastro(false);
      limparFormularioCadastro();
      fetchClientes();

    } catch (error) {
      console.error(error);
      mostrarToast('Erro ao cadastrar cliente', 'error');
    }
  };

  const [cnpjExisteEdit, setCnpjExisteEdit] = useState(false);
  const [cnpjInvalidoEdit, setCnpjInvalidoEdit] = useState(false);

  const verificarCnpjEdit = (valor: string) => {
    const cnpjFormatado = formatarCnpj(valor);
    setCnpjEdit(cnpjFormatado);

    const existe = clientes.some(
      cliente =>
        cliente.cnpj.replace(/\D/g, '') === cnpjFormatado.replace(/\D/g, '') &&
        cliente.id !== clienteSelecionado?.id
    );

    setCnpjExisteEdit(existe);
    setCnpjInvalidoEdit(cnpjFormatado.length > 0 && !cnpjValido(cnpjFormatado));
  };

  const atualizarCliente = async () => {
    if (!clienteSelecionado) return;

    if (cnpjExisteEdit || cnpjInvalidoEdit) {
      mostrarToast(cnpjExisteEdit ? 'Este CNPJ já está cadastrado' : 'CNPJ inválido', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:8083/clientes/${clienteSelecionado.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nome: nomeEdit,
            cnpj: cnpjEdit.replace(/\D/g, ''),
            email: emailEdit,
            telefone: telefoneEdit,
            observacao: clienteSelecionado.observacao,
            ativo: clienteSelecionado.ativo
          })
        }
      );

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.message || 'Erro ao atualizar cliente');
      }

      mostrarToast('Cliente atualizado com sucesso!', 'success');
      await fetchClientes();
      setModalAtualizar(false);

    } catch (error) {
      console.error(error);
      mostrarToast('Erro ao atualizar cliente', 'error');
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

      if (!response.ok) {
        throw new Error('Erro ao desativar cliente');
      }

      mostrarToast('Cliente desativado com sucesso!', 'success');
      fetchClientes();

    } catch (error) {
      console.error("ERRO:", error);
      mostrarToast('Erro ao desativar cliente', 'error');
    }
  };

  const vincularProjeto = async () => {
    if (!clienteSelecionado) return;

    if (!projetoSelecionado) {
      mostrarToast('Selecione um projeto antes de vincular', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
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

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.message || 'Erro ao vincular projeto');
      }

      mostrarToast('Projeto vinculado com sucesso!', 'success');
      await atualizarClienteSelecionado(clienteSelecionado.id);
      setProjetoSelecionado('');

    } catch (error) {
      console.error(error);
      mostrarToast('Erro ao vincular projeto', 'error');
    }
  };

  const desvincularProjeto = async (
    clienteId: number,
    projetoId: number
  ) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:8083/clientes/${clienteId}/projetos/${projetoId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao desvincular projeto');
      }

      mostrarToast('Projeto desvinculado com sucesso!', 'success');
      await atualizarClienteSelecionado(clienteId);

    } catch (error) {
      console.error(error);
      mostrarToast('Erro ao desvincular projeto', 'error');
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
                      setCnpjInvalidoEdit(!cnpjValido(cliente.cnpj));

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
                  ${cnpjExiste || cnpjInvalido ? styles.inputErro : ""}
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
                  cnpjExisteEdit || cnpjInvalidoEdit ? styles.inputErro : ""
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

      {toast.visible && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '16px 24px',
          borderRadius: '10px',
          backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff',
          fontWeight: 600,
          fontSize: '14px',
          boxShadow: '0 10px 30px rgba(1, 38, 67, 0.15)',
          animation: 'slideIn 0.3s ease',
          zIndex: 10000,
          maxWidth: '400px',
          wordWrap: 'break-word'
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}