'use client';
import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import dynamic from 'next/dynamic'; // tem que ter isso pq ta dando bug no react select por conta do SSR

const Select = dynamic(() => import('react-select'), {
    ssr: false
});

function Page() {
    const [nomeProjeto, setNomeProjeto] = useState('');
    const [nomeCliente, setNomeCliente] = useState('');
    const [dataKickOff, setDataKickOff] = useState('');
    const [dataFinal, setDataFinal] = useState('');

    const [usuarios, setUsuarios] = useState([]);
    const [responsavelId, setResponsavelId] = useState('');
    const [devsIds, setDevsIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await fetch('http://localhost:8080/usuarios/todos');
                const data = await response.json();
                setUsuarios(data);
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            }
        };

        fetchUsuarios();
    }, []);

    const usuariosOptions = usuarios.map((user: any) => ({
        value: user.id,
        label: user.nome
    }));

    const customStyles = {
      control: (base: any, state: any) => ({
            ...base,
            height: 42,
            minHeight: 42,
            borderRadius: 8,
            borderColor: state.isFocused ? '#94a3b8' : '#cbd5e1',
            boxShadow: 'none',
            outline: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: '#94a3b8'
            }
        }),
        valueContainer: (base: any) => ({
            ...base,
            padding: '0 12px'
        }),
        input: (base: any) => ({
            ...base,
            margin: 0,
            padding: 0
        }),
        placeholder: (base: any) => ({
            ...base,
            color: '#94a3b8'
        }),
        singleValue: (base: any) => ({
            ...base,
            color: '#012643'
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: '#012643',
            borderRadius: 6
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: '#fff'
        }),
        multiValueRemove: (base: any) => ({
            ...base,
            color: '#fff',
        }),
        indicatorsContainer: (base: any) => ({
            ...base,
            height: 42
        }),
        indicatorSeparator: (base: any) => ({
            ...base,
            display: 'none'
        }),
        menu: (base: any) => ({
            ...base,
            zIndex: 9999
        })
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            nome: nomeProjeto,
            status: "EM_PLANEJAMENTO",
            descricao: `Cliente: ${nomeCliente} | Kick-off: ${dataKickOff}`.substring(0, 300),
            prazo: dataFinal ? `${dataFinal} 18:00` : null,
            responsavelId: responsavelId,
            desenvolvedoresIds: devsIds
        };

        try {
            const response = await fetch('http://localhost:8080/projeto/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Projeto enviado com sucesso!');
            } else {
                const erro = await response.json();
                alert(`Erro: ${erro.mensagem}`);
            }
        } catch (error) {
            console.error("Erro:", error);
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
                        value={nomeProjeto}
                        onChange={(e) => setNomeProjeto(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.containerInput}>
                    <p>Nome do cliente:</p>
                    <input
                        className={styles.inputStyle}
                        value={nomeCliente}
                        onChange={(e) => setNomeCliente(e.target.value)}
                    />
                </div>

                <div className={styles.containerInput}>
                    <p>Responsável:</p>
                    <Select
                        options={usuariosOptions}
                        styles={customStyles}
                        placeholder="Selecione um responsável"
                        onChange={(selected: any) => setResponsavelId(selected?.value)}
                    />
                </div>

                <div className={styles.containerInputTop}>
                    <p>Desenvolvedores:</p>
                    <Select
                        isMulti
                        options={usuariosOptions}
                        styles={customStyles}
                        placeholder="Selecione os desenvolvedores"
                        onChange={(selected: any) => {
                            const ids = selected ? selected.map((item: any) => item.value) : [];
                            setDevsIds(ids);
                        }}
                    />
                </div>

                <div className={styles.containerInput}>
                    <p>Data kick-off:</p>
                    <input
                        className={styles.inputStyle}
                        placeholder="dd/MM/yyyy"
                        value={dataKickOff}
                        onChange={(e) => setDataKickOff(e.target.value)}
                    />
                </div>

                <div className={styles.containerInput}>
                    <p>Data final:</p>
                    <input
                        className={styles.inputStyle}
                        placeholder="dd/MM/yyyy"
                        value={dataFinal}
                        onChange={(e) => setDataFinal(e.target.value)}
                    />
                </div>

                <div className={styles.buttonWrapper}>
                    <button className={styles.ButtonStyle}>
                        Adicionar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Page;