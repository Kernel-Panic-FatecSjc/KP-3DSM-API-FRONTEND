'use client';
import React, { useState } from 'react';
import styles from './App.module.css';

export default function Page() {
  const handleClick = () => {
    console.log("Entrando");
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
          placeholder='Digite seu usuário:'
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
          />
        </div>
        <button className={styles.ButtonStyle} type="submit" onClick={handleClick}>Entrar</button>
      </div>
    </div>
  );
}