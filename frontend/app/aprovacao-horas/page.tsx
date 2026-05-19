'use client';
import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

const BASE_URL = 'http://localhost:8080';
const PROJETO_URL = 'http://localhost:8082';
const TASK_URL = 'http://localhost:8085';
const USUARIO_URL = 'http://localhost:8083';

type EstadoHora = 'PENDENTE' | 'AGUARDANDO_APROVACAO' | 'APROVADO' | 'REJEITADO';

interface HorasExibirDTO {
    id: number;
    tarefaId: number | null;
    usuarioId: number;
    tituloSessao: string;
    tipoAtividade: string;
    descricao: string | null;
    dataLancamento: string;
    inicio: string;
    fim: string;
    justificativa: string | null;
    motivoRejeicao: string | null;
    estado: EstadoHora;
    dataCriacao: string;
}

interface Sessao {
    id: number;
    nomeProjeto: string;
    tituloSessao: string;
    descricao: string;
    responsavel: string;
    usuarioId: number;
    tarefaId: number | null;
    inicio: string;
    fim: string;
    dataLancamento: string;
    justificativa: string | null;
    estado: EstadoHora;
}

async function filtrarHoras(estado: EstadoHora): Promise<HorasExibirDTO[]> {
    const res = await fetch(`${BASE_URL}/horas/filtrar?estado=${estado}`);
    if (!res.ok) throw new Error('Erro ao buscar horas');
    return res.json();
}

async function aprovarHora(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/horas/${id}/aprovar`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Erro ao aprovar');
}

async function rejeitarHora(id: number, motivoRejeicao: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/horas/rejeitar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, motivoRejeicao }),
    });
    if (!res.ok) throw new Error('Erro ao rejeitar');
}

function calcularHoras(inicio: string, fim: string): string {
    if (!inicio || !fim) return '0h';
    const [hI, mI] = inicio.substring(0, 5).split(':').map(Number);
    const [hF, mF] = fim.substring(0, 5).split(':').map(Number);
    const diff = (hF * 60 + mF) - (hI * 60 + mI);
    if (diff <= 0) return '0h';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h${m > 0 ? ` ${m}min` : ''}`;
}

function formatarData(data: string): string {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

export default function Page() {
    const [abaAtiva, setAbaAtiva] = useState<'aguardando' | 'aprovados' | 'reprovados' | 'historico'>('aguardando');
    const [sessoes, setSessoes] = useState<Sessao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const [profissionaisSelecionados, setProfissionaisSelecionados] = useState<string[]>([]);
    const [projetosSelecionados, setProjetosSelecionados] = useState<string[]>([]);
    const [abrirProfissionais, setAbrirProfissionais] = useState(false);
    const [abrirProjetos, setAbrirProjetos] = useState(false);
    const [abrirPeriodo, setAbrirPeriodo] = useState(false);

    const [usuarioSelecionado, setUsuarioSelecionado] = useState<Sessao | null>(null);
    const [modalInformacao, setModalInformacao] = useState(false);
    const [modalJustificativa, setModalJustificativa] = useState(false);
    const [modalJustificativaLote, setModalJustificativaLote] = useState(false);
    const [justificativa, setJustificativa] = useState('');

    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 5;

    const [modoLote, setModoLote] = useState<'aprovar' | 'reprovar' | null>(null);
    const [selecionados, setSelecionados] = useState<number[]>([]);

    const estadoPorAba: Record<string, EstadoHora> = {
        aguardando: 'AGUARDANDO_APROVACAO',
        aprovados: 'APROVADO',
        reprovados: 'REJEITADO',
        historico: 'APROVADO',
    };

    const carregarSessoes = async (aba: string) => {
        try {
            setCarregando(true);
            setErro(null);
            const estado = estadoPorAba[aba];
            const dados = await filtrarHoras(estado);

            const [projetos, usuarios] = await Promise.all([
                fetch(`${PROJETO_URL}/projeto`).then(r => r.json()).catch(() => []),
                fetch(`${USUARIO_URL}/usuario/todos`).then(r => r.json()).catch(() => []),
            ]);

            const tarefaIds = [...new Set(dados.filter(h => h.tarefaId).map(h => h.tarefaId as number))];
            const tarefas: any[] = [];
            for (const tid of tarefaIds) {
                try {
                    const t = await fetch(`${TASK_URL}/tarefas/${tid}`).then(r => r.json());
                    tarefas.push(t);
                } catch { }
            }

            const mapeado: Sessao[] = dados.map(h => {
                const tarefa = tarefas.find(t => t.id === h.tarefaId);
                const projeto = tarefa ? projetos.find((p: any) => p.id === tarefa.idProjeto) : null;
                const usuario = usuarios.find((u: any) => u.id === h.usuarioId);
                return {
                    id: h.id,
                    nomeProjeto: projeto?.nome ?? '-',
                    tituloSessao: h.tituloSessao,
                    descricao: h.descricao ?? '',
                    responsavel: usuario?.nome ?? String(h.usuarioId),
                    usuarioId: h.usuarioId,
                    tarefaId: h.tarefaId,
                    inicio: h.inicio.substring(0, 5),
                    fim: h.fim.substring(0, 5),
                    dataLancamento: h.dataLancamento,
                    justificativa: h.justificativa,
                    estado: h.estado,
                };
            });
            setSessoes(mapeado);
        } catch {
            setErro('Não foi possível carregar os registros.');
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarSessoes(abaAtiva);
        setPaginaAtual(1);
        setSelecionados([]);
        setModoLote(null);
    }, [abaAtiva]);

    const handleAprovar = async (id: number) => {
        try {
            await aprovarHora(id);
            carregarSessoes(abaAtiva);
        } catch {
            alert('Erro ao aprovar.');
        }
    };

    const handleRejeitar = async () => {
        if (!usuarioSelecionado || !justificativa.trim()) return;
        try {
            await rejeitarHora(usuarioSelecionado.id, justificativa);
            setModalJustificativa(false);
            setModalInformacao(false);
            setJustificativa('');
            carregarSessoes(abaAtiva);
        } catch {
            alert('Erro ao rejeitar.');
        }
    };

    const handleRejeitarLote = async () => {
        if (!justificativa.trim() || selecionados.length === 0) return;
        try {
            await Promise.all(selecionados.map(id => rejeitarHora(id, justificativa)));
            setModalJustificativaLote(false);
            setJustificativa('');
            cancelarModoLote();
            carregarSessoes(abaAtiva);
        } catch {
            alert('Erro ao rejeitar em lote.');
        }
    };

    const handleAprovarLote = async () => {
        if (selecionados.length === 0) return;
        try {
            await Promise.all(selecionados.map(id => aprovarHora(id)));
            cancelarModoLote();
            carregarSessoes(abaAtiva);
        } catch {
            alert('Erro ao aprovar em lote.');
        }
    };

    const toggleProfissional = (nome: string) => {
        setProfissionaisSelecionados(prev =>
            prev.includes(nome) ? prev.filter(i => i !== nome) : [...prev, nome]
        );
    };

    const toggleProjeto = (nome: string) => {
        setProjetosSelecionados(prev =>
            prev.includes(nome) ? prev.filter(i => i !== nome) : [...prev, nome]
        );
    };

    const sessoesFiltradas = sessoes.filter(s => {
        const profOk = profissionaisSelecionados.length === 0 || profissionaisSelecionados.includes(s.responsavel);
        const projOk = projetosSelecionados.length === 0 || projetosSelecionados.includes(s.nomeProjeto);
        return profOk && projOk;
    });

    const indiceUltimoItem = paginaAtual * itensPorPagina;
    const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
    const sessoesPagina = sessoesFiltradas.slice(indicePrimeiroItem, indiceUltimoItem);
    const totalPaginas = Math.ceil(sessoesFiltradas.length / itensPorPagina);

    const profissionais = [...new Set(sessoes.map(s => s.responsavel))];
    const projetos = [...new Set(sessoes.map(s => s.nomeProjeto))];

    const toggleSelecionado = (id: number) => {
        setSelecionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelecionarTodos = () => {
        const ids = sessoesPagina.map(s => s.id);
        const todos = ids.every(id => selecionados.includes(id));
        if (todos) {
            setSelecionados(prev => prev.filter(id => !ids.includes(id)));
        } else {
            setSelecionados(prev => [...new Set([...prev, ...ids])]);
        }
    };

    const cancelarModoLote = () => {
        setModoLote(null);
        setSelecionados([]);
    };

    const confirmarLote = () => {
        if (selecionados.length === 0) return;
        if (modoLote === 'reprovar') {
            setModalJustificativaLote(true);
        } else {
            handleAprovarLote();
        }
    };

    const abas = [
        { key: 'aguardando', label: 'Aguardando Aprovação' },
        { key: 'aprovados', label: 'Aprovados' },
        { key: 'reprovados', label: 'Reprovados' },
        { key: 'historico', label: 'Histórico' },
    ] as const;

    return (
        <div className={styles.container}>
            <div className={styles.abas}>
                {abas.map(aba => (
                    <button
                        key={aba.key}
                        className={abaAtiva === aba.key ? styles.abaAtiva : styles.aba}
                        onClick={() => setAbaAtiva(aba.key)}
                    >
                        {aba.label}
                    </button>
                ))}
            </div>

            <div className={styles.menuContainer}>
                <div className={styles.dropDownMenu}>
                    <button className={styles.filtros} onClick={() => { setAbrirProfissionais(!abrirProfissionais); setAbrirProjetos(false); setAbrirPeriodo(false); }}>
                        Profissional <span><img src="/images/seta.svg" className={styles.imagemFiltro} /></span>
                    </button>
                    {abrirProfissionais && (
                        <div className={styles.dropdownLista}>
                            <span className={styles.placeholder}>Selecione um profissional</span>
                            {profissionais.map((p, i) => (
                                <label key={i} className={styles.itemDropdown}>
                                    <input type="checkbox" checked={profissionaisSelecionados.includes(p)} onChange={() => toggleProfissional(p)} />
                                    {p}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.dropDownMenu}>
                    <button className={styles.filtros} onClick={() => { setAbrirProjetos(!abrirProjetos); setAbrirProfissionais(false); setAbrirPeriodo(false); }}>
                        Projeto <span><img src="/images/seta.svg" className={styles.imagemFiltro} /></span>
                    </button>
                    {abrirProjetos && (
                        <div className={styles.dropdownLista}>
                            <span className={styles.placeholder}>Selecione um projeto</span>
                            {projetos.map((p, i) => (
                                <label key={i} className={styles.itemDropdown}>
                                    <input type="checkbox" checked={projetosSelecionados.includes(p)} onChange={() => toggleProjeto(p)} />
                                    {p}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.dropDownMenu}>
                    <button className={styles.filtrosPeriodo} onClick={() => { setAbrirPeriodo(!abrirPeriodo); setAbrirProjetos(false); setAbrirProfissionais(false); }}>
                        Período <span><img src="/images/seta.svg" className={styles.imagemFiltro} /></span>
                    </button>
                    {abrirPeriodo && (
                        <div className={styles.dropdownLista}>
                            <label className={styles.itemDropdown}><input type="checkbox" />Nos últimos 7 dias</label>
                            <label className={styles.itemDropdown}><input type="checkbox" />Esse mês</label>
                            <label className={styles.itemDropdown}><input type="checkbox" />Esse ano</label>
                        </div>
                    )}
                </div>

                <button className={styles.btnLimpar} onClick={() => { setProfissionaisSelecionados([]); setProjetosSelecionados([]); }}>Limpar</button>

                <div className={styles.botoesLote}>
                    {modoLote === 'aprovar' ? (
                        <>
                            <button className={styles.btnCancelarLote} onClick={cancelarModoLote}>Cancelar</button>
                            <button className={styles.btnAprovarLote} onClick={confirmarLote} disabled={selecionados.length === 0} style={{ opacity: selecionados.length === 0 ? 0.5 : 1 }}>
                                Confirmar aprovação {selecionados.length > 0 ? `(${selecionados.length})` : ''}
                            </button>
                        </>
                    ) : modoLote === 'reprovar' ? (
                        <>
                            <button className={styles.btnReprovarLote} onClick={confirmarLote} disabled={selecionados.length === 0} style={{ opacity: selecionados.length === 0 ? 0.5 : 1 }}>
                                Confirmar reprovação {selecionados.length > 0 ? `(${selecionados.length})` : ''}
                            </button>
                            <button className={styles.btnCancelarLote} onClick={cancelarModoLote}>Cancelar</button>
                        </>
                    ) : (
                        <>
                            <button className={styles.btnAprovarLote} onClick={() => setModoLote('aprovar')}>Aprovar em lote</button>
                            <button className={styles.btnReprovarLote} onClick={() => setModoLote('reprovar')}>Reprovar em lote</button>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.tabelaContainer}>
                {carregando && <p style={{ padding: '16px', color: '#0A4FA8' }}>Carregando...</p>}
                {erro && <p style={{ padding: '16px', color: '#C0392B' }}>{erro}</p>}
                {!carregando && !erro && sessoesFiltradas.length === 0 && (
                    <p className={styles.abaVazia}>Nenhum registro encontrado.</p>
                )}
                {!carregando && !erro && sessoesFiltradas.length > 0 && (
                    <>
                        <table className={styles.tabela}>
                            <thead>
                                <tr>
                                    <th>
                                        {modoLote && (
                                            <label className={styles.botaoSelecionarFunc}>
                                                <input type="checkbox" checked={sessoesPagina.length > 0 && sessoesPagina.every(s => selecionados.includes(s.id))} onChange={toggleSelecionarTodos} />
                                            </label>
                                        )}
                                    </th>
                                    <th></th>
                                    <th>Profissional</th>
                                    <th>Projeto</th>
                                    <th>Título da Sessão</th>
                                    <th>Data</th>
                                    <th>Total</th>
                                    {abaAtiva === 'aguardando' && <th>Ações</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {sessoesPagina.map((s, index) => (
                                    <tr key={index}>
                                        <td>
                                            {modoLote && (
                                                <label className={styles.botaoSelecionarFunc}>
                                                    <input type="checkbox" checked={selecionados.includes(s.id)} onChange={() => toggleSelecionado(s.id)} />
                                                </label>
                                            )}
                                        </td>
                                        <td>
                                            <button className={styles.botaoExpandir} onClick={() => { setUsuarioSelecionado(s); setModalInformacao(true); }}>
                                                <img src="/images/botaoExpandir.svg" className={styles.imagemBotao} alt="Mostrar informações" />
                                            </button>
                                        </td>
                                        <td>{s.responsavel}</td>
                                        <td>{s.nomeProjeto}</td>
                                        <td>{s.tituloSessao}</td>
                                        <td>{formatarData(s.dataLancamento)}</td>
                                        <td>{calcularHoras(s.inicio, s.fim)}</td>
                                        {abaAtiva === 'aguardando' && (
                                            <td className={styles.acoes}>
                                                <button className={styles.botaoAprovar} onClick={() => handleAprovar(s.id)}>
                                                    <img src="/images/botaoAprovar.svg" className={styles.imagemBotao} alt="Aprovar Horas" />
                                                </button>
                                                <button className={styles.botaoRecusar} onClick={() => { setUsuarioSelecionado(s); setModalJustificativa(true); }}>
                                                    <img src="/images/botaoRecusar.svg" className={styles.imagemBotao} alt="Recusar Horas" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className={styles.paginacao}>
                            <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(paginaAtual - 1)}>{'<'}</button>
                            {[...Array(totalPaginas)].map((_, index) => (
                                <button key={index} className={paginaAtual === index + 1 ? styles.ativo : ''} onClick={() => setPaginaAtual(index + 1)}>
                                    {index + 1}
                                </button>
                            ))}
                            <button disabled={paginaAtual >= totalPaginas} onClick={() => setPaginaAtual(paginaAtual + 1)}>{'>'}</button>
                        </div>
                    </>
                )}
            </div>

            {modalInformacao && usuarioSelecionado && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalConteudo}>
                        <button className={styles.botaoFecharModal} onClick={() => setModalInformacao(false)}>×</button>
                        <h2 className={styles.tituloModal}>{usuarioSelecionado.nomeProjeto}</h2>
                        <div className={styles.infoLinha}><h3>Profissional:</h3><span>{usuarioSelecionado.responsavel}</span></div>
                        <div className={styles.infoLinha}><h3>Task/Título da sessão:</h3><span>{usuarioSelecionado.tituloSessao}</span></div>
                        <div className={styles.infoLinha}><h3>Tipo:</h3><span>{usuarioSelecionado.descricao}</span></div>
                        {usuarioSelecionado.justificativa && (
                            <div className={styles.infoLinha}><h3>Justificativa:</h3><span>{usuarioSelecionado.justificativa}</span></div>
                        )}
                        <div className={styles.horas}>
                            <div className={styles.conteudoHoras}><h3>Início</h3><div className={styles.caixaHora}>{usuarioSelecionado.inicio}</div></div>
                            <div className={styles.conteudoHoras}><h3>Fim</h3><div className={styles.caixaHora}>{usuarioSelecionado.fim}</div></div>
                            <div className={styles.conteudoHoras}><h3>Total de Horas</h3><div className={styles.caixaHora}>{calcularHoras(usuarioSelecionado.inicio, usuarioSelecionado.fim)}</div></div>
                        </div>
                        {abaAtiva === 'aguardando' && (
                            <div className={styles.botoes}>
                                <button className={styles.recusar} onClick={() => { setModalInformacao(false); setModalJustificativa(true); }}>Reprovar</button>
                                <button className={styles.aprovar} onClick={() => { handleAprovar(usuarioSelecionado.id); setModalInformacao(false); }}>Aprovar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {modalJustificativa && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalConteudo}>
                        <button className={styles.botaoFecharModal} onClick={() => { setModalJustificativa(false); setJustificativa(''); }}>×</button>
                        <h2 className={styles.tituloModal}>Justificativa</h2>
                        <div className={styles.inputJustificativa}>
                            <textarea className={styles.justificativa} placeholder="Justificativa de reprovação (obrigatório)" value={justificativa} onChange={e => setJustificativa(e.target.value)} />
                        </div>
                        <div className={styles.botoes}>
                            <button className={styles.cancelar} onClick={() => { setModalJustificativa(false); setJustificativa(''); }}>Cancelar</button>
                            <button className={styles.confirmar} disabled={justificativa.trim() === ''} style={{ opacity: justificativa.trim() === '' ? 0.5 : 1 }} onClick={handleRejeitar}>Enviar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalJustificativaLote && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalConteudo}>
                        <button className={styles.botaoFecharModal} onClick={() => { setModalJustificativaLote(false); setJustificativa(''); }}>×</button>
                        <h2 className={styles.tituloModal}>Justificativa de Reprovação em Lote</h2>
                        <p className={styles.abaVazia}>{selecionados.length} lançamento(s) selecionado(s)</p>
                        <div className={styles.inputJustificativa}>
                            <textarea className={styles.justificativa} placeholder="Justificativa de reprovação (obrigatório)" value={justificativa} onChange={e => setJustificativa(e.target.value)} />
                        </div>
                        <div className={styles.botoes}>
                            <button className={styles.cancelar} onClick={() => { setModalJustificativaLote(false); setJustificativa(''); }}>Cancelar</button>
                            <button className={styles.confirmar} disabled={justificativa.trim() === ''} style={{ opacity: justificativa.trim() === '' ? 0.5 : 1 }} onClick={handleRejeitarLote}>Enviar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
