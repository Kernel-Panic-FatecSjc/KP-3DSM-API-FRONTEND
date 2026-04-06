'use client';
import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

export default function Page() {

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('CLT');
  const [valorHora, setValorHora] = useState('');
  const [ativo, setAtivo] = useState('');

  const [nomeEdit, setNomeEdit] = useState('');
  const [emailEdit, setEmailEdit] = useState('');
  const [senhaEdit, setSenhaEdit] = useState('');
  const [cargoEdit, setCargoEdit] = useState('');
  const [salarioEdit, setSalarioEdit] = useState('');


  const token = localStorage.getItem('token'); 

  const handleClick = async () => {
  try {
    console.log({
      nome,
      email,
      senha,
      cargo,
      salario: valorHora,
    });

    const response = await fetch('http://localhost:8080/usuario/cadastro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
        cargo,
        salario: valorHora,
        ativo: ativo === 'true'
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao cadastrar');
    }

    console.log('Usuário salvo com sucesso');

    setModalCadastro(false);
    fetchUsuarios();

  } catch (error) {
    console.error(error);
  }
};

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:8080/usuario/todos');
      const data = await response.json();
      setUsuarios(data);
      console.log(data);
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const atualizarUsuario = async () => {
    if (!usuarioSelecionado) return;

    try {
      const response = await fetch(`http://localhost:8080/usuario/${usuarioSelecionado.id}/atualizacao`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: nomeEdit,
          email: emailEdit,
          senha: senhaEdit,
          cargo: cargoEdit,
          salario: salarioEdit
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar');
      }

      console.log('Usuário atualizado com sucesso');

      setModalAtualizar(false);
      fetchUsuarios();

    } catch (error) {
      console.error(error);
    }
  };

  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalAtualizar, setModalAtualizar] = useState(false);
  const [filtroNome, setFiltroNome] = useState('');
  const [cargoSelecionado, setCargoSelecionado] = useState('');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  
  type Usuario = {
    id: number,
    nome: string;
    email: string;
    cargo: string;
    salario: string;
    ativo: boolean;
    senha: string;
  };

  const usuariosFiltrados = (Array.isArray(usuarios) ? usuarios : []).filter((usuario) => {
    const nomeOk = usuario.nome.toLowerCase().includes(filtroNome.toLowerCase());

    const cargoOk =
      cargoSelecionado === '' || usuario.cargo === cargoSelecionado;

    return nomeOk && cargoOk;
  });

  const deletarUsuario = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/usuario/${id}`, {
        method: 'DELETE',
        headers:{
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar usuário');
      }

      console.log('Usuário deletado com sucesso');

      fetchUsuarios();

    } catch (error) {
      console.error(error);
    }
  };

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
          <option value="">Todos os contratos</option>
          <option value="CLT">CLT</option>
          <option value="PJ">PJ</option>
          <option value="PJ/Hora">PJ/Hora</option>
        </select>

      </div>
    <div className={styles.tabelaContainer}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Valor/Hora</th>
            <th>Tipo de Contrato</th>
            <th>Ativo/Não ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((usuario, index) => (
            <tr key={index}>
              <td>{usuario.nome}</td>
              <td>{usuario.email}</td>
              <td>{usuario.salario}</td>
              <td>{usuario.cargo}</td>
              <td>
                <span className={styles.ativo}>
                  Ativo
                </span>
              </td>
              <td className={styles.acoes}>
                  <button className={styles.botaoAbrirEdicao} onClick={() => {
                    setUsuarioSelecionado(usuario);

                    setNomeEdit(usuario.nome);
                    setEmailEdit(usuario.email);
                    setCargoEdit(usuario.cargo);
                    setSalarioEdit(usuario.salario);

                    setModalAtualizar(true);
                  }}>
                  <img
                      src="/images/atualizar.svg"
                      className={styles.imagemBotao}
                      alt="Recusar Horas"
                    />  
                </button>
                <button className={styles.botaoExcluir}
                  onClick={() => deletarUsuario(usuario.id)}
                >
                  <img
                      src="/images/deletar.svg"
                      className={styles.imagemBotao}
                      alt="Recusar Horas"
                    />  
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <button className={styles.botaoAbrirModal} onClick={() => setModalCadastro(true)}>+</button>

    {modalCadastro && (
      <div className={styles.modalOverlay}>
        <div className={styles.modalConteudo}>
          <button className={styles.botaoFecharModal} onClick={() => setModalCadastro(false)}>×</button>

          <h2 className={styles.tituloModal}>Cadastro de Usuários</h2>

          <div className={styles.inputWrapper}>
            <label>Nome</label>
            <input 
            className={styles.inputStyle} 
            type="text" 
            value={nome}
            placeholder="Nome" 
            onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label>Email</label>
            <input 
            className={styles.inputStyle} 
            type="email" 
            value={email}
            placeholder="nome@gmail.com" 
            onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label>Senha</label>
            <input 
            className={styles.inputStyle} 
            type="password" 
            value={senha}
            placeholder="***" 
            onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <label>Valor Custo por Hora</label>
              <input 
              className={styles.inputStyle} 
              type="number" 
              value={valorHora}
              placeholder="R$" 
              onChange={(e) => setValorHora(e.target.value)}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label>Tipo de Contrato</label>
              <select
                className={styles.selectStyle}
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="PJ/Hora">PJ/Hora</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <label>Status</label>
              <select
                className={styles.selectStyle}
                value={ativo}
                onChange={(e) => setAtivo(e.target.value)}
              >
                <option value="true">Ativo</option>
                <option value="false">Não Ativo</option>
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
            
            <input
              className={styles.inputStyle}
              type="text"
              value={nomeEdit}
              onChange={(e) => setNomeEdit(e.target.value)}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label>Email</label>
            <input
            className={styles.inputStyle}
            type="email"
            value={emailEdit}
            onChange={(e) => setEmailEdit(e.target.value)}
          />
          </div>

          <div className={styles.inputWrapper}>
            <label>Senha</label>
            <input 
            className={styles.inputStyle} 
            type="password" 
            placeholder="***" 
            value={senhaEdit}
            onChange={(e) => setSenhaEdit(e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <label>Valor Custo por Hora</label>
              <input
                className={styles.inputStyle}
                type="text"
                value={salarioEdit}
                onChange={(e) => setSalarioEdit(e.target.value)}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label>Tipo de Contrato</label>
              <select
                className={styles.selectStyle}
                value={cargoEdit}
                onChange={(e) => setCargoEdit(e.target.value)}
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="PJ/Hora">PJ/Hora</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            
            <div className={styles.inputWrapper}>
              <label>Status</label>
              <select
                className={styles.selectStyle}
              >
                <option value="true">Ativo</option>
                <option value="false">Não Ativo</option>
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