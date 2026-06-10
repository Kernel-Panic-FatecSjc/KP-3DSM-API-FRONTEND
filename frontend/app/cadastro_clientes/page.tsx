"use client";

import React, { useState } from "react";
import styles from "./App.module.css";

type Cliente = {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  projetos: string[];
};

export default function Page() {
  const [clientes] = useState<Cliente[]>([
    {
      id: 1,
      nome: "Empresa Alpha",
      cnpj: "12.345.678/0001-99",
      email: "contato@alpha.com",
      telefone: "(11) 99999-9999",
      projetos: [
        "Sistema Financeiro",
        "Portal do Cliente",
        "Dashboard BI",
      ],
    },
    {
      id: 2,
      nome: "Tech Solutions",
      cnpj: "98.765.432/0001-55",
      email: "comercial@tech.com",
      telefone: "(12) 98888-8888",
      projetos: ["Aplicativo Mobile", "ERP Corporativo"],
    },
    {
      id: 3,
      nome: "Inova Digital",
      cnpj: "11.222.333/0001-44",
      email: "contato@inovadigital.com",
      telefone: "(12) 97777-7777",
      projetos: ["Website Institucional"],
    },
    {
      id: 4,
      nome: "Inova Digital",
      cnpj: "11.222.333/0001-44",
      email: "contato@inovadigital.com",
      telefone: "(12) 97777-7777",
      projetos: ["Website Institucional"],
    },
    {
      id: 5,
      nome: "Inova Digital",
      cnpj: "11.222.333/0001-44",
      email: "contato@inovadigital.com",
      telefone: "(12) 97777-7777",
      projetos: ["Website Institucional"],
    },
    {
      id: 6,
      nome: "Inova Digital",
      cnpj: "11.222.333/0001-44",
      email: "contato@inovadigital.com",
      telefone: "(12) 97777-7777",
      projetos: ["Website Institucional"],
    },
    {
      id: 7,
      nome: "Inova Digital",
      cnpj: "11.222.333/0001-44",
      email: "contato@inovadigital.com",
      telefone: "(12) 97777-7777",
      projetos: ["Website Institucional"],
    },
    {
      id: 8,
      nome: "Inova Digital",
      cnpj: "11.222.333/0001-44",
      email: "contato@inovadigital.com",
      telefone: "(12) 97777-7777",
      projetos: ["Website Institucional"],
    },
  ]);

  const [paginaAtual, setPaginaAtual] = useState(1);

  const itensPorPagina = 6;

  const [filtroNome, setFiltroNome] = useState("");

  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalAtualizar, setModalAtualizar] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);

  const [clienteSelecionado, setClienteSelecionado] =
    useState<Cliente | null>(null);

  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

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
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {clientesPaginaAtual.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{cliente.cnpj}</td>
                <td>{cliente.email}</td>
                <td>{cliente.telefone}</td>

                <td className={styles.acoes}>
                  <button
                    className={styles.botaoAbrirEdicao}
                    onClick={() => {
                      setClienteSelecionado(cliente);
                      setNomeEdit(cliente.nome);
                      setCnpjEdit(cliente.cnpj);
                      setEmailEdit(cliente.email);
                      setTelefoneEdit(cliente.telefone);
                      setModalAtualizar(true);
                    }}
                  >
                    <img
                      src="/images/atualizar.svg"
                      alt="Editar"
                      className={styles.imagemBotao}
                    />
                  </button>

                  <button className={styles.botaoExcluir}>
                    <img
                      src="/images/deletar.svg"
                      alt="Excluir"
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
                      src="/images/detalhes.svg"
                      alt="Detalhes"
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

      {/* Modal Cadastro */}

      {modalCadastro && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalConteudo}>
            <button
              className={styles.botaoFecharModal}
              onClick={() => setModalCadastro(false)}
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
                className={styles.inputStyle}
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
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
                onClick={() => setModalCadastro(false)}
              >
                Cancelar
              </button>

              <button className={styles.confirmar}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Atualização */}

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
                className={styles.inputStyle}
                value={cnpjEdit}
                onChange={(e) => setCnpjEdit(e.target.value)}
              />
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

              <button className={styles.confirmar}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Projetos */}

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

              <select className={styles.selectStyle}>
                <option>Sistema Financeiro</option>
                <option>ERP Corporativo</option>
                <option>Dashboard BI</option>
                <option>Portal do Cliente</option>
                <option>Aplicativo Mobile</option>
              </select>
            </div>

            <button
              className={styles.confirmar}
              style={{ marginBottom: "20px" }}
            >
              Vincular Projeto
            </button>

            <div>
              <h3>Projetos já vinculados</h3>

              {clienteSelecionado.projetos.map(
                (projeto, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px",
                      marginTop: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  >
                    {projeto}
                  </div>
                )
              )}
            </div>

            <div className={styles.botoes}>
              <button
                className={styles.cancelar}
                onClick={() => setModalDetalhes(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}