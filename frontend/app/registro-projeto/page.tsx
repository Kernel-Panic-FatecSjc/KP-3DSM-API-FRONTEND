'use client';
import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

function Page() {
    const [nomeProjeto, setNomeProjeto] = useState('');
    const [nomeCliente, setNomeCliente] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [cnpjError, setCnpjError] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataFinal, setDataFinal] = useState('');
    const [valorContratado, setValorContratado] = useState('');

    const [usuarios, setUsuarios] = useState([]);
    const [usuariosCarregados, setUsuariosCarregados] = useState(false);
    const [responsavelId, setResponsavelId] = useState('');
    const [devsIds, setDevsIds] = useState<string[]>([]);
    const [projetos, setProjetos] = useState([]);
    const [projetosCarregados, setProjetosCarregados] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({ 
        message: '', 
        type: 'success', 
        visible: false 
    });

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

        const fetchProjetos = async () => {
            try {
                const response = await fetch('http://localhost:8082/projeto/todos');
                const data = await response.json();
                setProjetos(Array.isArray(data) ? data : data.content ?? data.projetos ?? []);
            } catch (error) {
                console.error("Erro ao buscar projetos:", error);
            } finally {
                setProjetosCarregados(true);
            }
        };

        fetchUsuarios();
        fetchProjetos();
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

    const projetoJaExiste = (nome: string, cnpjDigitos: string): boolean => {
        return projetos.some((projeto: any) => 
            projeto.nome.toLowerCase() === nome.toLowerCase() && 
            projeto.cnpj === cnpjDigitos
        );
    };

    const limparFormulario = () => {
        setNomeProjeto('');
        setNomeCliente('');
        setCnpj('');
        setCnpjError('');
        setDescricao('');
        setDataFinal('');
        setValorContratado('');
        setResponsavelId('');
        setDevsIds([]);
    };

    const mostrarToast = (message: string, type: 'success' | 'error' = 'success', duracao: number = 4000) => {
        setToast({ message, type, visible: true });
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, duracao);
    };

    const validateCNPJ = (cnpjValue: string): boolean => {
        const cnpjDigitos = cnpjValue.replace(/\D/g, '');

        if (cnpjDigitos.length !== 14) {
            setCnpjError('CNPJ deve conter 14 dígitos');
            return false;
        }

        if (/^(\d)\1{13}$/.test(cnpjDigitos)) {
            setCnpjError('CNPJ inválido');
            return false;
        }

        let tamanho = cnpjDigitos.length - 2;
        let numeros = cnpjDigitos.substring(0, tamanho);
        let digitos = cnpjDigitos.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(0))) {
            setCnpjError('CNPJ inválido');
            return false;
        }

        tamanho = tamanho - 1;
        numeros = cnpjDigitos.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
            if (pos < 2) pos = 9;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(1))) {
            setCnpjError('CNPJ inválido');
            return false;
        }

        setCnpjError('');
        return true;
    };

    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        setCnpj(valor);
        if (valor) {
            validateCNPJ(valor);
        } else {
            setCnpjError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCNPJ(cnpj)) {
            return;
        }

        const cnpjDigitos = cnpj.replace(/\D/g, '');

        if (projetoJaExiste(nomeProjeto, cnpjDigitos)) {
            mostrarToast('Este projeto já existe! Verifique o nome e CNPJ.', 'error');
            return;
        }

        const payload = {
            nome: nomeProjeto,
            cnpj: cnpjDigitos,
            descricao: `Cliente: ${nomeCliente} | ${descricao}`.substring(0, 300),
            status: "EM_PLANEJAMENTO",
            prazo: dataFinal ? `${dataFinal}T18:00` : null,
            valorContratado: valorContratado ? parseFloat(valorContratado) : null,
            responsavelId: responsavelId || null,
            profissionaisIds: devsIds
        };

        try {
            const response = await fetch('http://localhost:8082/projeto/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                mostrarToast('Projeto criado com sucesso!', 'success');
                limparFormulario();
            } else {
                const erro = await response.json();
                console.error('Erro do back-end:', erro);
                mostrarToast(`Erro ${response.status}: ${JSON.stringify(erro)}`, 'error');
            }
        } catch (error) {
            console.error("Erro:", error);
            mostrarToast("Erro de conexão com o back-end.", 'error');
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
                    <p>CNPJ:</p>
                    <input
                        className={styles.inputStyle}
                        value={cnpj}
                        onChange={handleCnpjChange}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        required
                    />
                    {cnpjError && (
                        <p style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>
                            {cnpjError}
                        </p>
                    )}
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
                        min={new Date().toISOString().slice(0, 10)}
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

            {toast.visible && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '16px 24px',
                    borderRadius: '10px',
                    backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '14px',
                    boxShadow: '0 10px 30px rgba(1, 38, 67, 0.15)',
                    animation: 'slideIn 0.3s ease',
                    zIndex: 10000,
                    maxWidth: '400px',
                    wordWrap: 'break-word'
                }}>
                    {toast.message}
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}

export default Page;