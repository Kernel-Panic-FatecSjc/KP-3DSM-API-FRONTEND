'use client';

import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

type Usuario = {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  tipoContratacao: string;
  salario: string;
  ativo: boolean;
  senha: string;
};

export default function Page() {

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('ROLE_PROFISSIONAL');
  const [tipoContratacao, setTipoContratacao] = useState('CLT');
  const [valorHora, setValorHora] = useState('');
  const [ativo, setAtivo] = useState('true');

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  const [nomeEdit, setNomeEdit] = useState('');
  const [emailEdit, setEmailEdit] = useState('');
  const [senhaEdit, setSenhaEdit] = useState('');
  const [cargoEdit, setCargoEdit] = useState('');
  const [tipoContratacaoEdit, setTipoContratacaoEdit] = useState('');
  const [salarioEdit, setSalarioEdit] = useState('');
  const [ativoEdit, setAtivoEdit] = useState('');

  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalAtualizar, setModalAtualizar] = useState(false);

  const [filtroNome, setFiltroNome] = useState('');
  const [cargoSelecionado, setCargoSelecionado] = useState('');
  const [contratoSelecionado, setContratoSelecionado] = useState('');

  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);

  const getCargoLabel = (cargo: string) => {
    switch (cargo) {
      case "ROLE_GESTOR": return "Gestor";
      case "ROLE_FINANCEIRO": return "Financeiro";
      case "ROLE_PROFISSIONAL": return "Profissional";
      default: return cargo ?? "-";
    }
  };

  const getContratoLabel = (tipoContratacao: string) => {
    switch (tipoContratacao) {
      case "CLT": return "CLT";
      case "PJ_HORAS_FIXAS": return "PJ";
      case "PJ_HORAS_VARIAVEIS": return "PJ/HORA";
      default: return tipoContratacao ?? "-";
    }
  };

  const handleClick = async () => {
    try {
      const body = {
        nome,
        email,
        senha,
        cargo,
        salario: valorHora,
        ativo: ativo === 'true',
        tipoContratacao
      };

      const response = await fetch('http://localhost:8083/usuario/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const texto = await response.text();

      if (!response.ok) {
        throw new Error(texto);
      }

      setModalCadastro(false);
      fetchUsuarios();

    } catch (error) {
      console.error('ERRO:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const currentToken = localStorage.getItem('token');

      const response = await fetch('http://localhost:8083/usuario/todos', {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      const data = await response.json();
      setUsuarios(data);

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (token) {
      fetchUsuarios();
    }
  }, [token]);

  const atualizarUsuario = async () => {
    if (!usuarioSelecionado) return;

    try {
      const currentToken = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:8083/usuario/${usuarioSelecionado.id}/atualizacao`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentToken}`
          },
          body: JSON.stringify({
            id: usuarioSelecionado.id,
            nome: nomeEdit,
            email: emailEdit,
            senha: senhaEdit,
            cargo: cargoEdit,
            salario: salarioEdit,
            tipoContratacao: tipoContratacaoEdit,
            ativo: ativoEdit === 'true'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar');
      }

      const usuarioLogadoId = localStorage.getItem('usuarioId');

      if (usuarioLogadoId === String(usuarioSelecionado.id)) {
        localStorage.setItem('nome', nomeEdit);
        localStorage.setItem('cargo', cargoEdit);
        window.dispatchEvent(new Event('usuarioAtualizado'));
      }

      setModalAtualizar(false);
      fetchUsuarios();

    } catch (error) {
      console.error(error);
    }
  };

  const deletarUsuario = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8083/usuario/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar usuário');
      }

      fetchUsuarios();

    } catch (error) {
      console.error(error);
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const nomeOk = usuario.nome.toLowerCase().includes(filtroNome.toLowerCase());
    const cargoOk = cargoSelecionado === '' || usuario.cargo === cargoSelecionado;
    const contratoOk = contratoSelecionado === '' || usuario.tipoContratacao === contratoSelecionado;
    return nomeOk && cargoOk && contratoOk;
  });

  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const usuariosPaginaAtual = usuariosFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / itensPorPagina);

  return (
    <div className={styles.container}>

      <h1 className={styles.titulo}>Página de Usuários</h1>

      <div className={styles.filtros}>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          className={styles.inputFiltro}
        />

        <select
          value={cargoSelecionado}
          onChange={(e) => setCargoSelecionado(e.target.value)}
          className={styles.selectFiltro}
        >
          <option value="">Todos os cargos</option>
          <option value="ROLE_GESTOR">Gestor</option>
          <option value="ROLE_FINANCEIRO">Financeiro</option>
          <option value="ROLE_PROFISSIONAL">Profissional</option>
        </select>

        <select
          value={contratoSelecionado}
          onChange={(e) => setContratoSelecionado(e.target.value)}
          className={styles.selectFiltro}
        >
          <option value="">Todos os contratos</option>
          <option value="CLT">CLT</option>
          <option value="PJ_HORAS_FIXAS">PJ</option>
          <option value="PJ_HORAS_VARIAVEIS">PJ/HORA</option>
        </select>
      </div>

      <div className={styles.tabelaContainer}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Cargo</th>
              <th>Tipo de Contrato</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPaginaAtual.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>{getCargoLabel(usuario.cargo)}</td>
                <td>{getContratoLabel(usuario.tipoContratacao)}</td>
                <td className={styles.acoes}>
                  <button
                    className={styles.botaoAbrirEdicao}
                    onClick={() => {
                      setUsuarioSelecionado(usuario);
                      setNomeEdit(usuario.nome);
                      setEmailEdit(usuario.email);
                      setCargoEdit(usuario.cargo);
                      setTipoContratacaoEdit(usuario.tipoContratacao);
                      setSalarioEdit(usuario.salario);
                      setAtivoEdit(usuario.ativo ? 'true' : 'false');
                      setModalAtualizar(true);
                    }}
                  >
                    <img src="/images/atualizar.svg" className={styles.imagemBotao} alt="Atualizar" />
                  </button>
                  <button
                    className={styles.botaoExcluir}
                    onClick={() => deletarUsuario(usuario.id)}
                  >
                    <img src="/images/deletar.svg" className={styles.imagemBotao} alt="Deletar" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 0 && (
        <div className={styles.paginacao}>
          <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(paginaAtual - 1)}>{'<'}</button>
          {[...Array(totalPaginas)].map((_, index) => (
            <button
              key={index}
              className={paginaAtual === index + 1 ? styles.pagAtivo : ''}
              onClick={() => setPaginaAtual(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button disabled={paginaAtual >= totalPaginas} onClick={() => setPaginaAtual(paginaAtual + 1)}>{'>'}</button>
        </div>
      )}

      <button className={styles.botaoAbrirModal} onClick={() => setModalCadastro(true)}>+</button>

      {modalCadastro && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalConteudo}>
            <button className={styles.botaoFecharModal} onClick={() => setModalCadastro(false)}>×</button>
            <h2 className={styles.tituloModal}>Cadastro de Usuários</h2>

            <div className={styles.inputWrapper}>
              <label>Nome</label>
              <input className={styles.inputStyle} type="text" value={nome} placeholder="Nome" onChange={(e) => setNome(e.target.value)} />
            </div>

            <div className={styles.inputWrapper}>
              <label>Email</label>
              <input className={styles.inputStyle} type="email" value={email} placeholder="nome@gmail.com" onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className={styles.inputWrapper}>
              <label>Senha</label>
              <input className={styles.inputStyle} type="password" value={senha} placeholder="******" onChange={(e) => setSenha(e.target.value)} />
            </div>

            <div className={styles.row}>
              <div className={styles.inputWrapper}>
                <label>Valor Custo/Hora</label>
                <input className={styles.inputStyle} type="number" value={valorHora} placeholder="R$" onChange={(e) => setValorHora(e.target.value)} />
              </div>

              <div className={styles.inputWrapper}>
                <label>Cargo</label>
                <select className={styles.selectStyle} value={cargo} onChange={(e) => setCargo(e.target.value)}>
                  <option value="ROLE_GESTOR">Gestor</option>
                  <option value="ROLE_FINANCEIRO">Financeiro</option>
                  <option value="ROLE_PROFISSIONAL">Profissional</option>
                </select>
              </div>

              <div className={styles.inputWrapper}>
                <label>Tipo de Contrato</label>
                <select className={styles.selectStyle} value={tipoContratacao} onChange={(e) => setTipoContratacao(e.target.value)}>
                  <option value="CLT">CLT</option>
                  <option value="PJ_HORAS_FIXAS">PJ</option>
                  <option value="PJ_HORAS_VARIAVEIS">PJ/HORA</option>
                </select>
              </div>
            </div>

            <div className={styles.botoes}>
              <button className={styles.cancelar} onClick={() => setModalCadastro(false)}>Cancel</button>
              <button className={styles.confirmar} onClick={handleClick}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {modalAtualizar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalConteudo}>
            <button className={styles.botaoFecharModal} onClick={() => setModalAtualizar(false)}>×</button>
            <h2 className={styles.tituloModal}>Atualizar Usuário</h2>

            <div className={styles.inputWrapper}>
              <label>Nome</label>
              <input className={styles.inputStyle} type="text" value={nomeEdit} onChange={(e) => setNomeEdit(e.target.value)} />
            </div>

            <div className={styles.inputWrapper}>
              <label>Email</label>
              <input className={styles.inputStyle} type="email" value={emailEdit} onChange={(e) => setEmailEdit(e.target.value)} />
            </div>

            <div className={styles.inputWrapper}>
              <label>Senha</label>
              <input className={styles.inputStyle} type="password" placeholder="******" value={senhaEdit} onChange={(e) => setSenhaEdit(e.target.value)} />
            </div>

            <div className={styles.row}>
              <div className={styles.inputWrapper}>
                <label>Valor Custo/Hora</label>
                <input className={styles.inputStyle} type="number" value={salarioEdit} placeholder="R$" onChange={(e) => setSalarioEdit(e.target.value)} />
              </div>

              <div className={styles.inputWrapper}>
                <label>Cargo</label>
                <select className={styles.selectStyle} value={cargoEdit} onChange={(e) => setCargoEdit(e.target.value)}>
                  <option value="ROLE_GESTOR">Gestor</option>
                  <option value="ROLE_FINANCEIRO">Financeiro</option>
                  <option value="ROLE_PROFISSIONAL">Profissional</option>
                </select>
              </div>

              <div className={styles.inputWrapper}>
                <label>Tipo de Contrato</label>
                <select className={styles.selectStyle} value={tipoContratacaoEdit} onChange={(e) => setTipoContratacaoEdit(e.target.value)}>
                  <option value="CLT">CLT</option>
                  <option value="PJ_HORAS_FIXAS">PJ</option>
                  <option value="PJ_HORAS_VARIAVEIS">PJ/HORA</option>
                </select>
              </div>
            </div>

            <div className={styles.botoes}>
              <button className={styles.cancelar} onClick={() => setModalAtualizar(false)}>Cancel</button>
              <button className={styles.confirmar} onClick={atualizarUsuario}>Confirm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
