'use client';
import React, { useState } from 'react';
import styles from './App.module.css';


export default function Page() {
  const handleClick = () => {
    console.log("Cadastrando...");
  };
  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalAtualizar, setModalAtualizar] = useState(false);

  const funcMock = [
    {nome: "Guilherme Briggs", email: "guilherme@gmail.com", nivel: "Júnior", contrato: "CLT", valorHora: "R$4,95", status: "Ativo"},
    {nome: "Guilherme Briggs", email: "guilherme@gmail.com", nivel: "Júnior", contrato: "CLT", valorHora: "R$4,95", status: "Nao Ativo"}
  ]


  return (
    <div className={styles.container}>
    <h1 className={styles.titulo}>Página de Usuários</h1>
    <div className={styles.tabelaContainer}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Valor/Hora</th>
            <th>Tipo de Contrato</th>
            <th>Nível de Experiência</th>
            <th>Ativo/Não ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcMock.map((usuario, index) => (
            <tr key={index}>
              <td>{usuario.nome}</td>
              <td>{usuario.email}</td>
              <td>{usuario.valorHora}</td>
              <td>{usuario.contrato}</td>
              <td>{usuario.nivel}</td>
              <td>
                <span className={usuario.status === "Ativo" ? styles.ativo : styles.inativo}>
                  {usuario.status}
                </span>
              </td>
              <td className={styles.acoes}>
                <button className={styles.botaoAbrirEdicao} onClick={() => setModalAtualizar(true)}>+</button>
                <button className={styles.botaoExcluir} onClick={() => setModalCadastro(true)}>+</button>
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
            <input className={styles.inputStyle} type="text" placeholder="Nome" />
          </div>

          <div className={styles.inputWrapper}>
            <label>Email</label>
            <input className={styles.inputStyle} type="email" placeholder="nome@gmail.com" />
          </div>

          <div className={styles.inputWrapper}>
            <label>Senha</label>
            <input className={styles.inputStyle} type="password" placeholder="***" />
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <label>Valor Custo por Hora</label>
              <input className={styles.inputStyle} type="number" placeholder="R$" />
            </div>

            <div className={styles.inputWrapper}>
              <label>Tipo de Contrato</label>
              <select className={styles.selectStyle}>
                <option>CLT</option>
                <option>PJ</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <label>Nível de Experiência</label>
              <select className={styles.selectStyle}>
                <option>Júnior</option>
                <option>Pleno</option>
                <option>Senior</option>
              </select>
            </div>

            <div className={styles.inputWrapper}>
              <label>Status</label>
              <select className={styles.selectStyle}>
                <option>Ativo</option>
                <option>Não Ativo</option>
              </select>
            </div>
          </div>

          <div className={styles.botoes}>
            <button className={styles.cancelar} onClick={() => setModalCadastro(false)}>Cancel</button>
            <button className={styles.confirmar}>Confirm</button>
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
            <input className={styles.inputStyle} type="text" placeholder="Nome" />
          </div>

          <div className={styles.inputWrapper}>
            <label>Email</label>
            <input className={styles.inputStyle} type="email" placeholder="nome@gmail.com" />
          </div>

          <div className={styles.inputWrapper}>
            <label>Senha</label>
            <input className={styles.inputStyle} type="password" placeholder="***" />
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <label>Valor Custo por Hora</label>
              <input className={styles.inputStyle} type="number" placeholder="R$" />
            </div>

            <div className={styles.inputWrapper}>
              <label>Tipo de Contrato</label>
              <select className={styles.selectStyle}>
                <option>CLT</option>
                <option>PJ</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <label>Nível de Experiência</label>
              <select className={styles.selectStyle}>
                <option>Júnior</option>
                <option>Pleno</option>
                <option>Senior</option>
              </select>
            </div>

            <div className={styles.inputWrapper}>
              <label>Status</label>
              <select className={styles.selectStyle}>
                <option>Ativo</option>
                <option>Não Ativo</option>
              </select>
            </div>
          </div>

          <div className={styles.botoes}>
            <button className={styles.cancelar} onClick={() => setModalAtualizar(false)}>Cancel</button>
            <button className={styles.confirmar}>Confirm</button>
          </div>
        </div>
      </div>
      )}   
      </div>
  );
}
