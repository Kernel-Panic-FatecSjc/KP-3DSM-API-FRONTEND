'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './App.module.css';

export default function Page() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const router = useRouter();

  const handleClick = async () => {
    if (!email || !senha) return alert("Preencha todos os campos");

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        throw new Error('Login inválido');
      }

      const data = await response.json();

      localStorage.setItem('token', data.token);
      localStorage.setItem('cargo', data.cargo);
      localStorage.setItem('email', data.email);
      localStorage.setItem('usuarioId', String(data.id));

      router.push('/controleHoras/entrada-saida'); 

    } catch (error) {
      console.error('Erro:', error);
      alert("Falha no login: Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}> 
      <div className={styles.containerSide}>
        <img src="/images/logoGSW.svg" alt='logoGSW' className={styles.logoGSW} />
        <div className={styles.content}>
          <h1 className={styles.title}>Bem vindo de volta!</h1>
          <p className={styles.text}>Acesse sua conta agora mesmo</p>
        </div>
      </div>

      <div className={styles.containerRight}>
        <h2 className={styles.tituloLogin}>Login</h2>
        
        <div className={styles.inputWrapper}>
          <img src="/images/usuario.svg" className={styles.iconInput} alt="user icon" />
          <input
            className={styles.inputStyle}
            type='email' 
            placeholder='Digite seu email:'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.inputWrapper}>
          <img src="/images/cadeado.svg" className={styles.iconInput} alt="lock icon" />
          <input
            className={styles.inputStyle}
            type={mostrarSenha ? 'text' : 'password'}
            placeholder='Digite sua senha:'
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <img src={mostrarSenha ? "/images/olhoFechado.svg" : "/images/olho.svg"} className={styles.iconInputRight} alt="eye icon" onClick={() => setMostrarSenha(!mostrarSenha)}></img>
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
    </div>
  );
}