'use client';
import React, { useState } from 'react';
import styles from './App.module.css';

function page() {
    const [devs, setDevs] = useState(['']);

    const addInput = () => {
    setDevs([...devs, '']);
    };

    const alterarValor = (index: any , value: any) => {
        const novosDevs = [...devs];
        novosDevs[index] = value;
        setDevs(novosDevs);
  };

  return (

    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>Dados para identificação do projeto</h2>
        <div className={styles.containerInput}>
        <p>Nome do projeto:</p>
        <input
          className={styles.inputStyle}
          type='text'
        />
        </div>
        <div className={styles.containerInput}>
        <p>Nome do cliente:</p>
        <input 
          className={styles.inputStyle}
          type='text'
        />
        </div>
        <div className={styles.containerInput}>
        <p>Líder técnico responsável:</p>
        <input 
          className={styles.inputStyle}
          type='text'
        />
        </div>
        <div className={styles.containerInput}>
        <p>Desenvolvedores:</p>
        <div className={styles.devWrapper}>
            {devs.map((dev, index) => (
            <div key={index} className={styles.inputWrapper}>
                <input
                className={styles.inputStyle}
                type="text"
                value={dev}
                onChange={(e) => alterarValor(index, e.target.value)}
                />

                {index === devs.length - 1 && (
                <img
                    src="/images/iconMais.svg"
                    className={styles.iconRight}
                    onClick={addInput}
                />
                )}
            </div>
            ))}
        </div>
        </div>
        <div className={styles.containerInput}>
        <p>Data kick-off:</p>
        <input 
          className={styles.inputStyle}
          type='text'
        />
        </div>
        <div className={styles.containerInput}>
        <p>Data final para conclusão:</p>
        <input 
          className={styles.inputStyle}
          type='text'
        />
        </div>
        <p>Orçamento</p>
        <button>Adicionar</button>
      </div>
    </div>
  )
}

export default page
