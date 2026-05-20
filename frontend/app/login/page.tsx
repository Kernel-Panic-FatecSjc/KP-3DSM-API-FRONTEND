'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './App.module.css';

export default function Page() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // LGPD
  const [showModal, setShowModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [declined, setDeclined] = useState(false);

  const router = useRouter();

  const handleClick = async () => {
    if (!email || !senha) {
      return alert('Preencha todos os campos');
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        const erro = await response.text();

        console.error('Status:', response.status);
        console.error('Resposta:', erro);

        throw new Error('Login inválido');
      }

      const data = await response.json();

      localStorage.setItem('token', data.token);
      localStorage.setItem('cargo', data.cargo);
      localStorage.setItem('email', data.email);
      localStorage.setItem('nome', data.nome);
      localStorage.setItem('usuarioId', String(data.id));

      const lgpdAceito = localStorage.getItem('lgpdAceito');
      if (lgpdAceito) {
        const cargo = localStorage.getItem('cargo');
        if (cargo === 'ROLE_PROFISSIONAL') router.push('/controleHoras/entrada-saida');
        else if (cargo === 'ROLE_GESTOR') router.push('/gestao-tarefas-gestor');
        else if (cargo === 'ROLE_FINANCEIRO') router.push('/');
      } else {
        setShowModal(true);
      }

    } catch (error) {
      console.error('Erro:', error);
      alert('Falha no login: Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptLGPD = () => {
    setShowModal(false);
    localStorage.setItem('lgpdAceito', 'true');
    const cargo = localStorage.getItem('cargo');
    if (cargo === 'ROLE_PROFISSIONAL') {
      router.push('/controleHoras/entrada-saida');
    } else if (cargo === 'ROLE_GESTOR') {
      router.push('/gestao-tarefas-gestor');
    } else if (cargo === 'ROLE_FINANCEIRO') {
      router.push('/');
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.containerSide}>
        <img
          src="/images/logoGSW.svg"
          alt="logoGSW"
          className={styles.logoGSW}
          loading="eager"
        />

        <div className={styles.content}>
          <h1 className={styles.title}>Bem vindo de volta!</h1>

          <p className={styles.text}>
            Acesse sua conta agora mesmo
          </p>
        </div>
      </div>

      <div className={styles.containerRight}>
        <h2 className={styles.tituloLogin}>Login</h2>

        <div className={styles.inputWrapper}>
          <img
            src="/images/usuario.svg"
            className={styles.iconInput}
            alt="user icon"
          />

          <input
            className={styles.inputStyle}
            type="email"
            placeholder="Digite seu email:"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.inputWrapper}>
          <img
            src="/images/cadeado.svg"
            className={styles.iconInput}
            alt="lock icon"
          />

          <input
            className={styles.inputStyle}
            type={mostrarSenha ? 'text' : 'password'}
            placeholder="Digite sua senha:"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <img
            src={
              mostrarSenha
                ? '/images/olhoFechado.svg'
                : '/images/olho.svg'
            }
            className={styles.iconInputRight}
            alt="eye icon"
            onClick={() => setMostrarSenha(!mostrarSenha)}
          />
        </div>

        <button
          className={styles.ButtonStyle}
          type="button"
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
      </div>

      {/* LGPD */}
      {showModal && (
        <div className={styles.lgpdOverlay}>
          <div className={styles.lgpdModal}>
            <div className={styles.lgpdHeader}>
              <div className={styles.lgpdBadge}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>

                LGPD — Lei nº 13.709/2018
              </div>

              <div className={styles.lgpdTitle}>
                Termo de Consentimento
                <br />
                e Privacidade de Dados
              </div>

              <div className={styles.lgpdSubtitle}>
                Leia atentamente antes de acessar o sistema
              </div>
            </div>

            <div className={styles.lgpdBody}>
              <div className={styles.lgpdSection}>
                <div className={styles.lgpdSectionTitle}>
                  Finalidade
                </div>

                <p>
                  O sistema de Controle de Apontamento de Horas da
                  GSW Soluções Integradas coleta e trata seus dados
                  pessoais com a finalidade exclusiva de registrar e
                  gerenciar o esforço de trabalho por projeto,
                  calcular custos internos e gerar base para
                  faturamento.
                </p>
              </div>

              <div className={styles.lgpdSection}>
                <div className={styles.lgpdSectionTitle}>
                  Dados coletados
                </div>

                <ul className={styles.lgpdDataList}>
                  <li>Nome completo e e-mail cadastrado</li>
                  <li>Horas trabalhadas por projeto e tipo de atividade</li>
                  <li>Valor/hora e custo gerado por projeto</li>
                  <li>Histórico de lançamentos e alterações realizadas</li>
                  <li>Data e hora de acesso ao sistema</li>
                </ul>
              </div>

              <div className={styles.lgpdSection}>
                <div className={styles.lgpdSectionTitle}>
                  Quem acessa seus dados
                </div>

                <ul className={styles.lgpdDataList}>
                  <li>
                    Gestor responsável pelo projeto ao qual você está
                    alocado
                  </li>

                  <li>
                    Perfil Financeiro, para fins de controle de custo
                    e faturamento
                  </li>
                </ul>
              </div>

              <div className={styles.lgpdSection}>
                <div className={styles.lgpdSectionTitle}>
                  Seus direitos
                </div>

                <div className={styles.lgpdHighlightBox}>
                  Conforme a LGPD, você tem direito de solicitar
                  acesso, correção ou exclusão dos seus dados pessoais
                  a qualquer momento, entrando em contato com o
                  responsável pelo sistema na GSW Soluções Integradas.
                </div>
              </div>
            </div>

            <div className={styles.lgpdFooter}>
              <label className={styles.lgpdCheckboxRow}>
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) =>
                    setConsentChecked(e.target.checked)
                  }
                />

                <span className={styles.lgpdCheckboxLabel}>
                  Li e compreendi os termos acima. Concordo com o
                  tratamento dos meus dados pessoais conforme
                  descrito, em conformidade com a{' '}
                  <strong>
                    Lei Geral de Proteção de Dados
                    (Lei nº 13.709/2018)
                  </strong>.
                </span>
              </label>

              <button
                className={`${styles.lgpdBtnAccept} ${consentChecked
                  ? styles.lgpdBtnAcceptActive
                  : ''
                  }`}
                onClick={handleAcceptLGPD}
                disabled={!consentChecked}
              >
                Concordo e quero acessar o sistema
              </button>

              {!declined && (
                <button
                  className={styles.lgpdBtnDecline}
                  onClick={() => setDeclined(true)}
                >
                  Não concordo — sair do sistema
                </button>
              )}

              {declined && (
                <div
                  className={`${styles.lgpdBlockedNotice} ${styles.lgpdBlockedNoticeVisible}`}
                >
                  Sem o aceite dos termos não é possível acessar o
                  sistema.
                  <br />
                  Entre em contato com o Gestor responsável.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
