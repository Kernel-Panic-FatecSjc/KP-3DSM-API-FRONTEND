'use client';
import React, { useState } from 'react';
import styles from './App.module.css'

export default function Page() {
    const funcMock = [
        {id: 1, nomeProjeto: 'Aerocode', tituloSessao: 'Ajustes de responsividade', descricao: 'frontend', responsavel: 'Daniele', inicio: '08:00', fim: '10:00'},
        {id: 2, nomeProjeto: 'Aerocode I', tituloSessao: 'Ajustes de responsividade', descricao: 'frontend', responsavel: 'Rafael', inicio: '08:00', fim: '10:00'},
        {id: 3, nomeProjeto: 'Aerocode', tituloSessao: 'Ajustes de responsividade', descricao: 'frontend', responsavel: 'Marcos', inicio: '08:00', fim: '10:00'},
        {id: 4, nomeProjeto: 'Aerocode III', tituloSessao: 'Ajustes de responsividade', descricao: 'frontend', responsavel: 'Daniele', inicio: '08:00', fim: '10:00'},
        {id: 5, nomeProjeto: 'Aerocode', tituloSessao: 'Ajustes de responsividade', descricao: 'frontend', responsavel: 'Daniele', inicio: '08:00', fim: '10:00'},
        {id: 6, nomeProjeto: 'Aerocode', tituloSessao: 'Ajustes de responsividade', descricao: 'frontend', responsavel: 'Daniele', inicio: '08:00', fim: '10:00'}
    ]

    const [profissionaisSelecionados, setProfissionaisSelecionados] = useState<string[]>([]);
    const [projetosSelecionados, setProjetosSelecionados] = useState<string[]>([]);
    const [periodosSelecionados, setPeriodosSelecionados] = useState<string[]>([]);
    
    const toggleProfissional = (nome: string) => {
        setProfissionaisSelecionados((prev) =>
            prev.includes(nome)
                ? prev.filter((item) => item !== nome)
                : [...prev, nome]
        );
    };

    const usuariosFiltrados = funcMock.filter((usuario) => {
        const profissionalOk =
            profissionaisSelecionados.length === 0 ||
            profissionaisSelecionados.includes(usuario.responsavel);

        const projetoOk =
            projetosSelecionados.length === 0 ||
            projetosSelecionados.includes(usuario.nomeProjeto);

        return profissionalOk && projetoOk;
    });

    const toggleProjeto = (nome: string) => {
        setProjetosSelecionados((prev) =>
            prev.includes(nome)
                ? prev.filter((item) => item !== nome)
                : [...prev, nome]
        );
    };

    const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);

    const [modalInformacao, setModalInformacao] = useState(false);
    const [modalJustificativa, setModalJustificativa] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 5;

    const [abrirProfissionais, setAbrirProfissionais] = useState(false);
    const [abrirProjetos, setAbrirProjetos] = useState(false);
    const [abrirPeriodo, setAbrirPeriodo] = useState(false);

    const indiceUltimoItem = paginaAtual * itensPorPagina;
    const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;

    const usuariosPaginaAtual = usuariosFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);

    const totalPaginas = Math.ceil(usuariosFiltrados.length / itensPorPagina);

    const calcularHoras = (inicio: string, fim: string) => {
        const [horaInicio, minInicio] = inicio.split(':').map(Number);
        const [horaFim, minFim] = fim.split(':').map(Number);

        const totalInicio = horaInicio * 60 + minInicio;
        const totalFim = horaFim * 60 + minFim;

        const diferencaMinutos = totalFim - totalInicio;

        const horas = Math.floor(diferencaMinutos / 60);
        const minutos = diferencaMinutos % 60;

        return `${horas}h ${minutos > 0 ? minutos + 'min' : ''}`;
    };

    const profissionais = [...new Set(funcMock.map(item => item.responsavel))];
    const projetos = [...new Set(funcMock.map(item => item.nomeProjeto))];







    return (
        <div className={styles.container}>
            <div className={styles.menuContainer}>

                <div className={styles.dropDownMenu}>
                <button
                    className={styles.filtros}
                    onClick={() => {
                    setAbrirProfissionais(!abrirProfissionais);
                    setAbrirProjetos(false);
                    setAbrirPeriodo(false);
                    }}
                >
                    Profissional
                    <span>
                        <img
                            src="/images/seta.svg"
                            className={styles.imagemFiltro}
                        />  
                    </span>
                </button>

                {abrirProfissionais && (
                    <div className={styles.dropdownLista}>
                    <span className={styles.placeholder}>Selecione um profissional</span>

                    {profissionais.map((profissional, index) => (
                        <label key={index} className={styles.itemDropdown}>
                        <input
                            type="checkbox"
                            checked={profissionaisSelecionados.includes(profissional)}
                            onChange={() => toggleProfissional(profissional)}
                        />
                        {profissional}
                        </label>
                    ))}
                    </div>
                )}
                </div>

                <div className={styles.dropDownMenu}>
                <button
                    className={styles.filtros}
                    onClick={() => {
                    setAbrirProjetos(!abrirProjetos);
                    setAbrirProfissionais(false);
                    setAbrirPeriodo(false);
                    }}
                >
                    Projeto
                    <span>
                        <img
                            src="/images/seta.svg"
                            className={styles.imagemFiltro}
                        />  
                    </span>
                </button>

                {abrirProjetos && (
                    <div className={styles.dropdownLista}>
                        <span className={styles.placeholder}>Selecione um projeto</span>

                    {projetos.map((projeto, index) => (
                        <label key={index} className={styles.itemDropdown}>
                        <input
                            type="checkbox"
                            checked={projetosSelecionados.includes(projeto)}
                            onChange={() => toggleProjeto(projeto)}
                        />
                        {projeto}
                        </label>
                    ))}
                    </div>
                )}
                </div>

                <div className={styles.dropDownMenu}>
                <button
                    className={styles.filtrosPeriodo}
                    onClick={() => {
                    setAbrirPeriodo(!abrirPeriodo);
                    setAbrirProjetos(false);
                    setAbrirProfissionais(false);
                    }}
                >
                    Período
                    <span>
                        <img
                            src="/images/seta.svg"
                            className={styles.imagemFiltro}
                        />  
                    </span>
                </button>

                {abrirPeriodo && (
                    <div className={styles.dropdownLista}>
                    <label className={styles.itemDropdown}>
                        <input type="checkbox" />
                        Nos últimos 7 dias
                    </label>

                    <label className={styles.itemDropdown}>
                        <input type="checkbox" />
                        Esse mês
                    </label>

                    <label className={styles.itemDropdown}>
                        <input type="checkbox" />
                        Esse ano
                    </label>
                    </div>
                )}
                </div>

            </div>
            <div className={styles.tabelaContainer}>
                <table className={styles.tabela}>
                    <thead>
                        <tr>
                            <th></th>
                            <th></th>
                            <th>Nome</th>
                            <th>Projeto</th>
                            <th>Data</th>
                            <th>Horas</th>
                            <th>Aprovação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosPaginaAtual.map((usuario, index) => (
                            <tr key={index}>
                                <td>
                                    <label key={index} className={styles.botaoSelecionarFunc}>
                                        <input type="checkbox" />
                                    </label>
                                </td>
                                <td>
                                    <button
                                    className={styles.botaoExpandir}
                                    onClick={() => {
                                        setUsuarioSelecionado(usuario);
                                        setModalInformacao(true);
                                    }}
                                    >
                                    <img
                                        src="/images/botaoExpandir.svg"
                                        className={styles.imagemBotao}
                                        alt="Mostrar informações"
                                    />  
                                    </button>
                                </td>
                                <td>{usuario.responsavel}</td>
                                <td>{usuario.nomeProjeto}</td>
                                <td>30/05/2026</td>
                                <td>{calcularHoras(usuario.inicio, usuario.fim)}</td>
                                <td className={styles.acoes}>
                                    <button className={styles.botaoAprovar} >
                                        <img
                                        src="/images/botaoAprovar.svg"
                                        className={styles.imagemBotao}
                                        alt="Aprovar Horas"
                                        />    
                                    </button>
                                    <button className={styles.botaoRecusar} onClick={() => setModalJustificativa(true)}>
                                        <img
                                        src="/images/botaoRecusar.svg"
                                        className={styles.imagemBotao}
                                        alt="Recusar Horas"
                                        />  
                                    </button>
                                </td>
                            </tr>
                        ))}                       
                    </tbody>
                </table>
                
                <div className={styles.paginacao}>
                    <button
                        disabled={paginaAtual === 1}
                        onClick={() => setPaginaAtual(paginaAtual - 1)}
                    >
                        {'<'}
                    </button>

                    {[...Array(totalPaginas)].map((_, index) => (
                        <button
                            key={index}
                            className={paginaAtual === index + 1 ? styles.ativo : ''}
                            onClick={() => setPaginaAtual(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        disabled={paginaAtual === totalPaginas}
                        onClick={() => setPaginaAtual(paginaAtual + 1)}
                    >
                        {'>'}
                    </button>
                </div>

                {modalInformacao && usuarioSelecionado && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalConteudo}>
                        <button
                            className={styles.botaoFecharModal}
                            onClick={() => setModalInformacao(false)}
                        >
                            ×
                        </button>

                        <h2 className={styles.tituloModal}>{usuarioSelecionado.nomeProjeto}</h2>

                        <div className={styles.infoLinha}>
                            <h3>Profissional:</h3>
                            <span>{usuarioSelecionado.responsavel}</span>
                        </div>

                        <div className={styles.infoLinha}>
                            <h3>Task/Título da sessão:</h3>
                            <span>{usuarioSelecionado.tituloSessao}</span>
                        </div>

                        <div className={styles.infoLinha}>
                            <h3>Tipo:</h3>
                            <span>{usuarioSelecionado.descricao}</span>
                        </div>

                        <div className={styles.horas}>
                            <div className={styles.conteudoHoras}>
                                <h3>Início</h3>
                                <div className={styles.caixaHora}>
                                    {usuarioSelecionado.inicio}
                                </div>
                            </div>

                            <div className={styles.conteudoHoras}>
                                <h3>Fim</h3>
                                <div className={styles.caixaHora}>
                                {usuarioSelecionado.fim}
                                </div>
                            </div>

                            <div className={styles.conteudoHoras}>
                                <h3>Total de Horas</h3>
                                <div className={styles.caixaHora}>
                                {calcularHoras(usuarioSelecionado.inicio, usuarioSelecionado.fim)}
                                </div>
                            </div>
                        </div>

                        <div className={styles.botoes}>
                            <button className={styles.recusar}>Reprovar</button>
                            <button className={styles.aprovar}>Aprovar</button>
                        </div>
                        </div>
                    </div>
                    )}

                {modalJustificativa && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalConteudo}>
                            <button className={styles.botaoFecharModal} onClick={() => setModalJustificativa(false)}>×</button>
                            <h2 className={styles.tituloModal}>Justificativa</h2>
                            <div className={styles.inputJustificativa}>
                                <textarea className={styles.justificativa} placeholder='Justificativa'></textarea>
                            </div>
                            <div className={styles.botoes}>
                                <button className={styles.cancelar} onClick={() => setModalJustificativa(false)}>Cancelar</button>
                                <button className={styles.confirmar}>Enviar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}