'use client';
import React, { useState } from 'react';
import styles from './App.module.css';

export default function Page() {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleClick = async () => {
    try {
      const response = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          senha,
        }),
      });

      if (!response.ok) {
        throw new Error('Login inválido');
      }

      const data = await response.json();

      console.log(data)

      localStorage.setItem('token', data.token);
      localStorage.setItem('cargo', data.cargo);
      localStorage.setItem('email', data.email);

    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div className={styles.container}> 
      <div className={styles.containerSide}>
        <img 
            src="/images/logoGSW.svg"
            alt='logoGSW'
            className={styles.logoGSW}
          />
        <div className={styles.content}>
          <h1 className={styles.title}>Bem vindo de volta!</h1>
          <p className={styles.text}>Acesse sua conta agora mesmo</p>
        </div>
      </div>

      <div className={styles.containerRight}>
        <h2 className={styles.tituloLogin}>Login</h2>
        <div className={styles.inputWrapper}>
          <img
          src="/images/usuario.svg"
          className={styles.iconInput}
          />
          <input
            className={styles.inputStyle}
            type='text'
            placeholder='Digite seu email:'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.inputWrapper}>
          <img
          src="/images/cadeado.svg"
          className={styles.iconInput}
          />
          <input
            className={styles.inputStyle}
            type='password'
            placeholder='Digite sua senha:'
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        <button className={styles.ButtonStyle} type="submit" onClick={handleClick}>Entrar</button>
      </div>
    </div>
  );
}