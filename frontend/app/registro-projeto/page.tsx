'use client';
import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

function Page() {
    const [nomeProjeto, setNomeProjeto] = useState('');
    const [nomeCliente, setNomeCliente] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataFinal, setDataFinal] = useState('');
    const [valorContratado, setValorContratado] = useState('');

    const [usuarios, setUsuarios] = useState([]);
    const [usuariosCarregados, setUsuariosCarregados] = useState(false);
    const [responsavelId, setResponsavelId] = useState('');
    const [devsIds, setDevsIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await fetch('http://localhost:8083/usuario/todos');
                const data = await response.json();
                setUsuarios(Array.isArray(data) ? data : data.content ?? data.usuarios ?? []);
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            } finally {
                setUsuariosCarregados(true);
            }
        };

        fetchUsuarios();
    }, []);

    const responsaveisOptions = usuarios
        .filter((user: any) => user.cargo === 'ROLE_GESTOR')
        .map((user: any) => ({ value: user.id, label: user.nome }));

    const desenvolvedoresOptions = usuarios
        .filter((user: any) => user.cargo === 'ROLE_PROFISSIONAL')
        .map((user: any) => ({ value: user.id, label: user.nome }));

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
            '&:hover': { borderColor: '#94a3b8' }
        }),
        valueContainer: (base: any) => ({ ...base, padding: '0 12px' }),
        input: (base: any) => ({ ...base, margin: 0, padding: 0 }),
        placeholder: (base: any) => ({ ...base, color: '#94a3b8' }),
        singleValue: (base: any) => ({ ...base, color: '#012643' }),
        multiValue: (base: any) => ({ ...base, backgroundColor: '#012643', borderRadius: 6 }),
        multiValueLabel: (base: any) => ({ ...base, color: '#fff' }),
        multiValueRemove: (base: any) => ({ ...base, color: '#fff' }),
        indicatorsContainer: (base: any) => ({ ...base, height: 42 }),
        indicatorSeparator: (base: any) => ({ ...base, display: 'none' }),
        menu: (base: any) => ({ ...base, zIndex: 9999 })
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            nome: nomeProjeto,
            descricao: `Cliente: ${nomeCliente} | ${descricao}`.substring(0, 300),
            status: "EM_PLANEJAMENTO",
            prazo: dataFinal ? `${dataFinal}T18:00` : null,
            valorContratado: valorContratado ? parseFloat(valorContratado) : null,
            responsavelId: responsavelId || null,
            desenvolvedoresIds: devsIds
        };

        try {
            const response = await fetch('http://localhost:8082/projeto/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Projeto criado com sucesso!');
            } else {
                const erro = await response.json();
                console.error('Erro do back-end:', erro);
                alert(`Erro ${response.status}: ${JSON.stringify(erro)}`);
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
                        required
                    />
                </div>

                <div className={styles.containerInput}>
                    <p>Descrição:</p>
                    <input
                        className={styles.inputStyle}
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        maxLength={300}
                        required
                    />
                </div>

                <div className={styles.containerInput}>
                    <p>Responsável:</p>
                    <Select
                        options={responsaveisOptions}
                        styles={customStyles}
                        placeholder="Selecione um responsável"
                        onChange={(selected: any) => setResponsavelId(selected?.value)}
                        required
                    />
                </div>

                <div className={styles.containerInputTop}>
                    <p>Desenvolvedores:</p>
                    <Select
                        isMulti
                        options={desenvolvedoresOptions}
                        styles={customStyles}
                        placeholder="Selecione os desenvolvedores"
                        onChange={(selected: any) => {
                            const ids = selected ? selected.map((item: any) => item.value) : [];
                            setDevsIds(ids);
                        }}
                        required
                    />
                </div>

                {usuariosCarregados && usuarios.length === 0 && (
                    <p style={{ color: '#ef4444', fontSize: 13, marginTop: -8 }}>
                        Nenhum usuário encontrado. Cadastre usuários antes de criar um projeto.
                    </p>
                )}

                <div className={styles.containerInput}>
                    <p>Data final (prazo):</p>
                    <input
                        className={styles.inputStyle}
                        type="date"
                        value={dataFinal}
                        onChange={(e) => setDataFinal(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.containerInput}>
                    <p>Valor contratado (R$):</p>
                    <input
                        className={styles.inputStyle}
                        type="number"
                        step="0.01"
                        min="0"
                        value={valorContratado}
                        onChange={(e) => setValorContratado(e.target.value)}
                        placeholder="0,00"
                        required
                    />
                </div>

                <div className={styles.buttonWrapper}>
                    <button className={styles.ButtonStyle} type="submit">
                        Adicionar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Page;