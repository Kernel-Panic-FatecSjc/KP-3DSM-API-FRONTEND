'use client';
import React, { useState } from 'react';
import styles from './App.module.css';

export default function Page() {
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
        <input className={styles.inputStyle} type='text' />
        <input className={styles.inputStyle} type='text' />
        <button className={styles.ButtonStyle} type="submit">Entrar</button>
      </div>

    </div>
  );
}