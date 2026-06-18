'use client';

import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

type Usuario = {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  cargo: string;
  tipoContratacao: string;
  salario: string;
  ativo: boolean;
  senha: string;
};

type Toast = {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
};

const formatarCpf = (valor: string) => {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  return digitos
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
};

const cpfValido = (valor: string) => {
  const cpf = valor.replace(/\D/g, '');

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calcularDigito = (tamanho: number) => {
    let soma = 0;

    for (let i = 0; i < tamanho; i++) {
      soma += Number(cpf[i]) * (tamanho + 1 - i);
    }

    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(9) === Number(cpf[9]) &&
    calcularDigito(10) === Number(cpf[10]);
};

export default function Page() {

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('ROLE_PROFISSIONAL');
  const [tipoContratacao, setTipoContratacao] = useState('CLT');
  const [valorHora, setValorHora] = useState('');
  const [ativo, setAtivo] = useState('true');

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  const [nomeEdit, setNomeEdit] = useState('');
  const [cpfEdit, setCpfEdit] = useState('');
  const [emailEdit, setEmailEdit] = useState('');
  const [senhaEdit, setSenhaEdit] = useState('');
  const [cargoEdit, setCargoEdit] = useState('');
  const [tipoContratacaoEdit, setTipoContratacaoEdit] = useState('');
  const [salarioEdit, setSalarioEdit] = useState('');
  const [ativoEdit, setAtivoEdit] = useState('');

  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalAtualizar, setModalAtualizar] = useState(false);
  const [toast, setToast] = useState<Toast>({
    message: '',
    type: 'success',
    visible: false
  });

  const [filtroNome, setFiltroNome] = useState('');
  const [cargoSelecionado, setCargoSelecionado] = useState('');
  const [contratoSelecionado, setContratoSelecionado] = useState('');
  const [cpfExiste, setCpfExiste] = useState(false);
  const [cpfInvalido, setCpfInvalido] = useState(false);
  const [cpfExisteEdit, setCpfExisteEdit] = useState(false);
  const [cpfInvalidoEdit, setCpfInvalidoEdit] = useState(false);

  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);

  const mostrarToast = (message: string, type: 'success' | 'error' = 'success', duracao: number = 4000) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, duracao);
  };

  const apenasNumeros = (valor: string) => valor.replace(/\D/g, '');

  const formatarMensagemErro = (mensagem: string) => {
    const texto = mensagem.toLowerCase();

    if (texto.includes('cpf') && (texto.includes('invalid') || texto.includes('inval'))) {
      return 'Cpf invalido';
    }

    if (texto.includes('cpf') && (texto.includes('cadastrado') || texto.includes('existe') || texto.includes('duplic'))) {
      return 'Cpf ja cadastrado';
    }

    if (texto.includes('senha') && (texto.includes('6') || texto.includes('seis') || texto.includes('caracter'))) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }

    return mensagem;
  };

  const mensagemErroApi = (texto: string, fallback: string) => {
    const textoLimpo = texto.trim();

    if (!textoLimpo) {
      return fallback;
    }

    try {
      const erro = JSON.parse(textoLimpo);
      return formatarMensagemErro(erro.message ?? erro.mensagem ?? erro.error ?? textoLimpo);
    } catch {
      return formatarMensagemErro(textoLimpo);
    }
  };

  const verificarCpf = (valor: string) => {
    const cpfFormatado = formatarCpf(valor);
    setCpf(cpfFormatado);

    const existe = cpfFormatado.length > 0 && usuarios.some(
      usuario => apenasNumeros(usuario.cpf ?? '') === apenasNumeros(cpfFormatado)
    );

    setCpfExiste(existe);
    setCpfInvalido(cpfFormatado.length > 0 && !cpfValido(cpfFormatado));
  };

  const verificarCpfEdit = (valor: string) => {
    const cpfFormatado = formatarCpf(valor);
    setCpfEdit(cpfFormatado);

    const existe = cpfFormatado.length > 0 && usuarios.some(
      usuario =>
        apenasNumeros(usuario.cpf ?? '') === apenasNumeros(cpfFormatado) &&
        usuario.id !== usuarioSelecionado?.id
    );

    setCpfExisteEdit(existe);
    setCpfInvalidoEdit(cpfFormatado.length > 0 && !cpfValido(cpfFormatado));
  };

  const limparFormularioCadastro = () => {
    setNome('');
    setCpf('');
    setEmail('');
    setSenha('');
    setCargo('ROLE_PROFISSIONAL');
    setTipoContratacao('CLT');
    setValorHora('');
    setAtivo('true');
    setCpfExiste(false);
    setCpfInvalido(false);
  };

  const limparFormularioEdicao = () => {
    setUsuarioSelecionado(null);
    setNomeEdit('');
    setCpfEdit('');
    setEmailEdit('');
    setSenhaEdit('');
    setCargoEdit('');
    setTipoContratacaoEdit('');
    setSalarioEdit('');
    setAtivoEdit('');
    setCpfExisteEdit(false);
    setCpfInvalidoEdit(false);
  };

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
    if (cpfExiste || cpfInvalido || !cpfValido(cpf)) {
      mostrarToast(cpfExiste ? 'Cpf ja cadastrado' : 'Cpf invalido', 'error');
      setCpfInvalido(!cpfExiste);
      return;
    }

    try {
      const body = {
        nome,
        cpf: apenasNumeros(cpf),
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
        throw new Error(mensagemErroApi(texto, 'Erro ao cadastrar usuario.'));
      }

      setModalCadastro(false);
      mostrarToast('Usuario cadastrado com sucesso!', 'success');
      limparFormularioCadastro();
      fetchUsuarios();

    } catch (error) {
      console.error('ERRO:', error);
      mostrarToast(error instanceof Error ? error.message : 'Erro ao cadastrar usuario.', 'error');
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

    if (senhaEdit && senhaEdit.length < 6) {
      mostrarToast('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    if (cpfExisteEdit || cpfInvalidoEdit || !cpfValido(cpfEdit)) {
      mostrarToast(cpfExisteEdit ? 'Cpf ja cadastrado' : 'Cpf invalido', 'error');
      setCpfInvalidoEdit(!cpfExisteEdit);
      return;
    }

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
            cpf: apenasNumeros(cpfEdit),
            email: emailEdit,
            senha: senhaEdit,
            cargo: cargoEdit,
            salario: salarioEdit,
            tipoContratacao: tipoContratacaoEdit,
            ativo: ativoEdit === 'true'
          })
        }
      );

      const texto = await response.text();

      if (!response.ok) {
        throw new Error(mensagemErroApi(texto, 'Erro ao atualizar usuario.'));
      }

      const usuarioLogadoId = localStorage.getItem('usuarioId');

      if (usuarioLogadoId === String(usuarioSelecionado.id)) {
        localStorage.setItem('nome', nomeEdit);
        localStorage.setItem('cargo', cargoEdit);
        window.dispatchEvent(new Event('usuarioAtualizado'));
      }

      const usuarioLogadoId = localStorage.getItem('usuarioId');

      if (usuarioLogadoId === String(usuarioSelecionado.id)) {
        localStorage.setItem('nome', nomeEdit);
        localStorage.setItem('cargo', cargoEdit);
        window.dispatchEvent(new Event('usuarioAtualizado'));
      }

      setModalAtualizar(false);
      mostrarToast('Usuario atualizado com sucesso!', 'success');
      limparFormularioEdicao();
      fetchUsuarios();

    } catch (error) {
      console.error(error);
      mostrarToast(error instanceof Error ? error.message : 'Erro ao atualizar usuario.', 'error');
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

      mostrarToast('Usuario deletado com sucesso!', 'success');
      fetchUsuarios();

    } catch (error) {
      console.error(error);
      mostrarToast('Erro ao deletar usuario.', 'error');
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const nomeOk = usuario.nome.toLowerCase().includes(filtroNome.toLowerCase());
    const cpfOk = usuario.cpf?.includes(filtroNome) || apenasNumeros(usuario.cpf ?? '').includes(apenasNumeros(filtroNome));
    const cargoOk = cargoSelecionado === '' || usuario.cargo === cargoSelecionado;
    const contratoOk = contratoSelecionado === '' || usuario.tipoContratacao === contratoSelecionado;
    return (nomeOk || cpfOk) && cargoOk && contratoOk;
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
          placeholder="Buscar por nome ou CPF..."
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
              <th>CPF</th>
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
                <td>{usuario.cpf ? formatarCpf(usuario.cpf) : '-'}</td>
                <td>{usuario.email}</td>
                <td>{getCargoLabel(usuario.cargo)}</td>
                <td>{getContratoLabel(usuario.tipoContratacao)}</td>
                <td className={styles.acoes}>
                  <button
                    className={styles.botaoAbrirEdicao}
                    onClick={() => {
                      setUsuarioSelecionado(usuario);
                      setNomeEdit(usuario.nome);
                      setCpfEdit(formatarCpf(usuario.cpf ?? ''));
                      setEmailEdit(usuario.email);
                      setCargoEdit(usuario.cargo);
                      setTipoContratacaoEdit(usuario.tipoContratacao);
                      setSalarioEdit(usuario.salario);
                      setAtivoEdit(usuario.ativo ? 'true' : 'false');
                      setCpfExisteEdit(false);
                      setCpfInvalidoEdit(!cpfValido(usuario.cpf ?? ''));
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
            <button className={styles.botaoFecharModal} onClick={() => {
              setModalCadastro(false);
              limparFormularioCadastro();
            }}>×</button>
            <h2 className={styles.tituloModal}>Cadastro de Usuários</h2>

            <div className={styles.inputWrapper}>
              <label>Nome</label>
              <input className={styles.inputStyle} type="text" value={nome} placeholder="Nome" onChange={(e) => setNome(e.target.value)} />
            </div>

            <div className={styles.inputWrapper}>
              <label>CPF</label>
              <input
                className={`${styles.inputStyle} ${cpfExiste || cpfInvalido ? styles.inputErro : ''}`}
                type="text"
                value={cpf}
                placeholder="000.000.000-00"
                maxLength={14}
                onChange={(e) => verificarCpf(e.target.value)}
              />
              {cpfExiste && <span className={styles.erroTexto}>Este CPF ja esta cadastrado.</span>}
              {cpfInvalido && !cpfExiste && <span className={styles.erroTexto}>Cpf invalido.</span>}
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
              <button className={styles.cancelar} onClick={() => {
                setModalCadastro(false);
                limparFormularioCadastro();
              }}>Cancel</button>
              <button className={styles.confirmar} onClick={handleClick}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {modalAtualizar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalConteudo}>
            <button className={styles.botaoFecharModal} onClick={() => {
              setModalAtualizar(false);
              limparFormularioEdicao();
            }}>×</button>
            <h2 className={styles.tituloModal}>Atualizar Usuário</h2>

            <div className={styles.inputWrapper}>
              <label>Nome</label>
              <input className={styles.inputStyle} type="text" value={nomeEdit} onChange={(e) => setNomeEdit(e.target.value)} />
            </div>

            <div className={styles.inputWrapper}>
              <label>CPF</label>
              <input
                className={`${styles.inputStyle} ${cpfExisteEdit || cpfInvalidoEdit ? styles.inputErro : ''}`}
                type="text"
                value={cpfEdit}
                placeholder="000.000.000-00"
                maxLength={14}
                onChange={(e) => verificarCpfEdit(e.target.value)}
              />
              {cpfExisteEdit && <span className={styles.erroTexto}>Este CPF ja esta cadastrado.</span>}
              {cpfInvalidoEdit && !cpfExisteEdit && <span className={styles.erroTexto}>Cpf invalido.</span>}
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
              <button className={styles.cancelar} onClick={() => {
                setModalAtualizar(false);
                limparFormularioEdicao();
              }}>Cancel</button>
              <button className={styles.confirmar} onClick={atualizarUsuario}>Confirm</button>
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
