
'use client';
import React, { useState } from 'react';
import styles from './App.module.css';

function Page() {
    // Estados independentes para capturar todos os dados da tela
    const [nomeProjeto, setNomeProjeto] = useState('');
    const [nomeCliente, setNomeCliente] = useState('');
    const [responsavel, setResponsavel] = useState('');
    const [dataKickOff, setDataKickOff] = useState('');
    const [dataFinal, setDataFinal] = useState('');
    const [devs, setDevs] = useState(['']);

    const addInput = () => setDevs([...devs, '']);
    
    const removerInput = (index: number) => {
        const novosDevs = devs.filter((_, i) => i !== index);
        setDevs(novosDevs);
    };

    const alterarValorDev = (index: number, value: string) => {
        const novosDevs = [...devs];
        novosDevs[index] = value;
        setDevs(novosDevs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Aglutinando campos extras na string de descrição
        // Como o banco aceita 300 caracteres (conforme seu Projeto.java), 
        // tomamos cuidado para não estourar esse limite.
        const descricaoComposta = `Cliente: ${nomeCliente} | Resp: ${responsavel} | Kick-off: ${dataKickOff} | Devs: ${devs.filter(d => d !== '').join(', ')}`;

        // Montagem do DTO exatamente como o back-end espera
        const payload = {
            nome: nomeProjeto,
            status: "EM_PLANEJAMENTO", // Valor fixo ou vindo de um select
            descricao: descricaoComposta.substring(0, 300), // Garante o limite do banco
            prazo: dataFinal ? `${dataFinal} 18:00` : null // Formato dd/MM/yyyy HH:mm
        };

        try {
            const response = await fetch('http://localhost:8080/projeto/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Projeto enviado com sucesso!');
            } else {
                const erro = await response.json();
                alert(`Erro do servidor: ${erro.mensagem}`);
            }
        } catch (error) {
            console.error("Erro ao conectar:", error);
            alert("Erro de conexão com o back-end.");
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.content} onSubmit={handleSubmit}>
                <h2 className={styles.title}>Dados para identificação do projeto</h2>
                
                <div className={styles.containerInput}>
                    <p>Nome do projeto:</p>
                    <input
                        className={styles.inputStyle}
                        type='text'
                        value={nomeProjeto}
                        onChange={(e) => setNomeProjeto(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.containerInput}>
                    <p>Nome do cliente:</p>
                    <input 
                        className={styles.inputStyle}
                        type='text'
                        value={nomeCliente}
                        onChange={(e) => setNomeCliente(e.target.value)}
                    />
                </div>

                <div className={styles.containerInput}>
                    <p>Responsável pelo projeto:</p>
                    <input 
                        className={styles.inputStyle}
                        type='text'
                        value={responsavel}
                        onChange={(e) => setResponsavel(e.target.value)}
                    />
                </div>

                <div className={styles.containerInputTop}>
                    <p>Desenvolvedores:</p>
                    <div className={styles.devWrapper}>
                        {devs.map((dev, index) => (
                            <div key={index} className={styles.inputWrapper}>
                                <input
                                    className={styles.inputStyle}
                                    type="text"
                                    value={dev}
                                    onChange={(e) => alterarValorDev(index, e.target.value)}
                                />
                                {index > 0 && (
                                    <img
                                        src="/images/iconLixeira.svg"
                                        className={styles.iconLeft}
                                        alt="Remover"
                                        onClick={() => removerInput(index)}
                                    />
                                )}
                                {index === devs.length - 1 && (
                                    <img
                                        src="/images/iconMais.svg"
                                        className={styles.iconRight}
                                        alt="Adicionar"
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
                        placeholder="dd/MM/yyyy"
                        value={dataKickOff}
                        onChange={(e) => setDataKickOff(e.target.value)}
                    />
                </div>

                <div className={styles.containerInput}>
                    <p>Data final para conclusão:</p>
                    <input 
                        className={styles.inputStyle}
                        type='text'
                        placeholder="dd/MM/yyyy"
                        value={dataFinal}
                        onChange={(e) => setDataFinal(e.target.value)}
                    />
                </div>

                <div className={styles.buttonWrapper}>
                    <button type='submit' className={styles.ButtonStyle}>
                        Adicionar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Page;

