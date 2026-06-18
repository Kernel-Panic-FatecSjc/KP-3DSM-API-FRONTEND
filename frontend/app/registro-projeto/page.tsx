'use client';
import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

type Cliente = {
    id: number;
    nome: string;
    cnpj: string;
    ativo: boolean;
    projetoIds?: number[];
};

type Usuario = {
    id: number;
    nome: string;
    cargo: string;
};

type Projeto = {
    id: number;
    nome: string;
};

type SelectOption = {
    value: string | number;
    label: string;
};

function Page() {
    const [nomeProjeto, setNomeProjeto] = useState('');
    const [clienteId, setClienteId] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataFinal, setDataFinal] = useState('');
    const [valorContratado, setValorContratado] = useState('');

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [usuariosCarregados, setUsuariosCarregados] = useState(false);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [clientesCarregados, setClientesCarregados] = useState(false);
    const [responsavelId, setResponsavelId] = useState('');
    const [devsIds, setDevsIds] = useState<number[]>([]);
    const [projetos, setProjetos] = useState<Projeto[]>([]);
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
                console.error('Erro ao buscar usuários:', error);
            } finally {
                setUsuariosCarregados(true);
            }
        };

        const fetchClientes = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:8083/clientes', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const data = await response.json();
                setClientes(Array.isArray(data) ? data : data.content ?? data.clientes ?? []);
            } catch (error) {
                console.error('Erro ao buscar clientes:', error);
            } finally {
                setClientesCarregados(true);
            }
        };

        const fetchProjetos = async () => {
            try {
                const response = await fetch('http://localhost:8082/projeto/todos');
                const data = await response.json();
                setProjetos(Array.isArray(data) ? data : data.content ?? data.projetos ?? []);
            } catch (error) {
                console.error('Erro ao buscar projetos:', error);
            } finally {
                // Projetos carregados somente para validacao local de duplicidade.
            }
        };

        fetchUsuarios();
        fetchClientes();
        fetchProjetos();
    }, []);

    const clientesOptions = clientes
        .filter((cliente) => cliente.ativo !== false)
        .map((cliente) => ({ value: String(cliente.id), label: `${cliente.nome} - ${cliente.cnpj}` }));

    const clienteSelecionado = clientes.find((cliente) => String(cliente.id) === String(clienteId));

    const responsaveisOptions = usuarios
        .filter((user) => user.cargo === 'ROLE_GESTOR')
        .map((user) => ({ value: user.id, label: user.nome }));

    const desenvolvedoresOptions = usuarios
        .filter((user) => user.cargo === 'ROLE_PROFISSIONAL')
        .map((user) => ({ value: user.id, label: user.nome }));

    const customStyles = {
        control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
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
        valueContainer: (base: Record<string, unknown>) => ({ ...base, padding: '0 12px' }),
        input: (base: Record<string, unknown>) => ({ ...base, margin: 0, padding: 0 }),
        placeholder: (base: Record<string, unknown>) => ({ ...base, color: '#94a3b8' }),
        singleValue: (base: Record<string, unknown>) => ({ ...base, color: '#012643' }),
        multiValue: (base: Record<string, unknown>) => ({ ...base, backgroundColor: '#012643', borderRadius: 6 }),
        multiValueLabel: (base: Record<string, unknown>) => ({ ...base, color: '#fff' }),
        multiValueRemove: (base: Record<string, unknown>) => ({ ...base, color: '#fff' }),
        indicatorsContainer: (base: Record<string, unknown>) => ({ ...base, height: 42 }),
        indicatorSeparator: (base: Record<string, unknown>) => ({ ...base, display: 'none' }),
        menu: (base: Record<string, unknown>) => ({ ...base, zIndex: 9999 })
    };

    const projetoJaExiste = (nome: string, cliente: Cliente): boolean => {
        return projetos.some((projeto) =>
            projeto.nome.toLowerCase() === nome.toLowerCase() &&
            cliente.projetoIds?.includes(Number(projeto.id))
        );
    };

    const limparFormulario = () => {
        setNomeProjeto('');
        setClienteId('');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clienteSelecionado) {
            mostrarToast('Selecione um cliente cadastrado antes de criar o projeto.', 'error');
            return;
        }

        if (projetoJaExiste(nomeProjeto, clienteSelecionado)) {
            mostrarToast('Este projeto já existe para o cliente selecionado.', 'error');
            return;
        }

        const payload = {
            nome: nomeProjeto,
            descricao,
            status: 'EM_PLANEJAMENTO',
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
                const projetoCriado = await response.json();
                const token = localStorage.getItem('token');
                const vinculoResponse = await fetch(`http://localhost:8083/clientes/${clienteSelecionado.id}/projetos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ projetoIds: [projetoCriado.id] })
                });

                if (!vinculoResponse.ok) {
                    const erro = await vinculoResponse.json().catch(() => null);
                    mostrarToast(`Projeto criado, mas houve erro ao vincular cliente: ${JSON.stringify(erro)}`, 'error');
                    return;
                }

                mostrarToast('Projeto criado com sucesso!', 'success');
                limparFormulario();
            } else {
                const erro = await response.json();
                console.error('Erro do back-end:', erro);
                mostrarToast(`Erro ${response.status}: ${JSON.stringify(erro)}`, 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarToast('Erro de conexão com o back-end.', 'error');
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
                    <p>Cliente:</p>
                    <Select
                        options={clientesOptions}
                        styles={customStyles}
                        placeholder="Selecione um cliente cadastrado"
                        value={clientesOptions.find((option) => option.value === clienteId) ?? null}
                        onChange={(selected: unknown) => setClienteId(String((selected as SelectOption | null)?.value ?? ''))}
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
                        onChange={(selected: unknown) => setResponsavelId(String((selected as SelectOption | null)?.value ?? ''))}
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
                        onChange={(selected: unknown) => {
                            const ids = Array.isArray(selected)
                                ? selected.map((item) => Number((item as SelectOption).value))
                                : [];
                            setDevsIds(ids);
                        }}
                        required
                    />
                </div>

                {usuariosCarregados && usuarios.length === 0 && (
                    <p style={{ color: '#ef4444', fontSize: 13, marginTop: -8 }}>
                        Nenhum usu�rio encontrado. Cadastre usu�rios antes de criar um projeto.
                    </p>
                )}

                {clientesCarregados && clientes.length === 0 && (
                    <p style={{ color: '#ef4444', fontSize: 13, marginTop: -8 }}>
                        Nenhum cliente encontrado. Cadastre clientes antes de criar um projeto.
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