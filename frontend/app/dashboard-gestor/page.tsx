"use client";
import styles from './App.module.css';
import { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";

type Usuario = {
    id: number,
    nome: string;
};

type Projeto = {
  id: number;
  nome: string;
};

type ResumoUsuario = {
    usuarioId: number;

    percentualAprovado: number;
    percentualRejeitado: number;
    percentualAguardando: number;

    horasPorAtividade: {
        DESENVOLVIMENTO?: string;
        TESTES?: string;
        ANALISE?: string;
        CORRECAO_BUG?: string;
    };
};

export const data = [
  [
    "Nome",
    "Desenvolvimento",
    { role: "style" },
    "Testes",
    { role: "style" },
    "Análise",
    { role: "style" },
    "Correção de Bug",
    { role: "style" }
  ],

  ["José", 20, "#1565C0", 10, "#2E7D32", 5, "#F9A825", 5, "#C62828"],
  ["Daniele", 20, "#1565C0", 10, "#2E7D32", 5, "#F9A825", 5, "#C62828"],
  ["Hanna", 20, "#1565C0", 10, "#2E7D32", 5, "#F9A825", 5, "#C62828"],
  ["Frida", 20, "#1565C0", 10, "#2E7D32", 5, "#F9A825", 5, "#C62828"],
];

export default function Page() {

    const obterPeriodo = () => {

        const hoje = new Date();

        let dataInicio = new Date();

        if (filtro === "semana") {

            dataInicio.setDate(hoje.getDate() - 7);

        } else {

            dataInicio.setMonth(hoje.getMonth() - 1);
        }

        return {
            dataInicio: dataInicio.toISOString().split("T")[0],
            dataFim: hoje.toISOString().split("T")[0]
        };
    };

    const converterDurationParaHoras = (
        duration?: string
    ) => {

        if (!duration) return 0;

        const match = duration.match(/PT(\d+)H/);

        return match ? Number(match[1]) : 0;
    };

    const hoje = new Date();

    const mes = hoje.getMonth() + 1;
    const ano = hoje.getFullYear();

    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [projetoSelecionado, setProjetoSelecionado] = useState('');

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    const [resumos, setResumos] = useState<ResumoUsuario[]>([]);

    const dataGrafico = [
        [
            "Nome",
            "Desenvolvimento",
            { role: "style" },

            "Testes",
            { role: "style" },

            "Análise",
            { role: "style" },

            "Correção de Bug",
            { role: "style" }
        ],

        ...usuarios.map((usuario) => {

            const resumo = resumos.find(
                r => r.usuarioId === usuario.id
            );

            return [

                usuario.nome,

                converterDurationParaHoras(
                    resumo?.horasPorAtividade?.DESENVOLVIMENTO
                ),
                "#1565C0",

                converterDurationParaHoras(
                    resumo?.horasPorAtividade?.TESTES
                ),
                "#2E7D32",

                converterDurationParaHoras(
                    resumo?.horasPorAtividade?.ANALISE
                ),
                "#F9A825",

                converterDurationParaHoras(
                    resumo?.horasPorAtividade?.CORRECAO_BUG
                ),
                "#C62828"
            ];
        })
    ];

    const fetchProjetos = async () => {
        try {
          const response = await fetch('http://localhost:8082/projeto');
    
          const data = await response.json();
    
          setProjetos(data);
    
        } catch (error) {
          console.error('Erro ao buscar projetos:', error);
        }
      };
    
      useEffect(() => {
        fetchProjetos();
    }, []);

    const buscarUsuariosProjeto = async (projetoId: string) => {
        try {
            const responseProjeto = await fetch(
                `http://localhost:8082/projeto/${projetoId}`
            );

            const projeto = await responseProjeto.json();

            const responseUsuarios = await fetch(
                "http://localhost:8083/usuario/todos"
            );

            const todosUsuarios = await responseUsuarios.json();

            const usuariosProjeto = todosUsuarios.filter(
                (usuario: Usuario) =>
                    projeto.profissionaisIds.includes(usuario.id)
            );

            setUsuarios(usuariosProjeto);

            const resumosUsuarios = await Promise.all(

            usuariosProjeto.map(async (usuario: Usuario) => {

                const periodo = obterPeriodo();

                const response = await fetch(
                    `http://localhost:8084/horas/resumo/${usuario.id}` +
                    `?dataInicio=${periodo.dataInicio}` +
                    `&dataFim=${periodo.dataFim}`
                );

                return await response.json();
            })
        );

        setResumos(resumosUsuarios);

        } catch (error) {
            console.error("Erro ao buscar usuários do projeto:", error);
        }
    };

    

    const [filtro, setFiltro] = useState("semana");

    // Busca/atualiza os dados sempre que o projeto OU o filtro (semana/mês) mudam.
    // Antes, o fetch era disparado no mesmo clique que chamava setFiltro(...), então
    // obterPeriodo() lia o `filtro` ANTERIOR (estado ainda não re-renderizado) — por isso
    // os dados só "apareciam" depois de alternar mês/semana. Com o efeito, o fetch roda
    // após o re-render, já com o filtro correto.
    useEffect(() => {
        if (!projetoSelecionado) {
            setUsuarios([]);
            setResumos([]);
            return;
        }
        buscarUsuariosProjeto(projetoSelecionado);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtro, projetoSelecionado]);

    return (
        <div className={styles.container}>
            <h1 className={styles.titulo}>Dashboard do Gestor</h1>
            <div className={styles.filtros}>
                <select
                    className={styles.selectFiltro}
                    value={projetoSelecionado}
                    onChange={(e) => setProjetoSelecionado(e.target.value)}
                >
                    <option value="">
                        Selecione um projeto
                    </option>

                    {projetos.map((projeto) => (
                        <option
                        key={projeto.id}
                        value={projeto.id}
                        >
                        {projeto.nome}
                        </option>
                    ))}
                    </select>
            </div>
            <div className={styles.containerTaxas}>
                <h3 className={styles.subTitulo}>TAXA DE APROVAÇÃO DE LANÇAMENTOS</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Profissional</th>
                            <th>Aprovados</th>
                            <th>Aguardando</th>
                            <th>Rejeitados</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((usuario) => {

                            const resumo = resumos.find(
                                r => r.usuarioId === usuario.id
                            );

                            return (
                                <tr key={usuario.id}>
                                    <td>{usuario.nome}</td>

                                    <td style={{ color: 'green' }}>
                                        <strong>
                                            {(resumo?.percentualAprovado ?? 0).toFixed(1)}%
                                        </strong>
                                    </td>

                                    <td style={{ color: 'orange' }}>
                                        <strong>
                                            {resumo?.percentualAguardando?.toFixed(1) ?? 0}%
                                        </strong>
                                    </td>

                                    <td style={{ color: 'red' }}>
                                        <strong>
                                            {resumo?.percentualRejeitado?.toFixed(1) ?? 0}%
                                        </strong>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className={styles.containerGrafico}>
                <h3 className={styles.subTitulo}>HORAS POR TIPO DE ATIVIDADE POR PROFISSIONAL</h3>
                <div className={styles.buttonFiltro}>
                    <button
                        onClick={() => setFiltro("semana")}
                        
                        style={{
                        backgroundColor:
                            filtro === "semana" ? "#0b2341" : "white",

                        color:
                            filtro === "semana" ? "white" : "black",

                        padding: "10px 14px",
                        border: "1px solid #c9d3e0",
                        borderRadius: "6px",
                        cursor: "pointer",
                        width: "100px",
                        }}
                    >
                        Semana
                    </button>

                    <button
                        onClick={() => setFiltro("mes")}
                        style={{
                        backgroundColor:
                            filtro === "mes" ? "#0b2341" : "white",

                        color:
                            filtro === "mes" ? "white" : "black",

                        padding: "10px 14px",
                        border: "1px solid #c9d3e0",
                        borderRadius: "6px",
                        cursor: "pointer",
                        width: "100px",
                        }}
                    >
                        Mês
                    </button>
                </div>
                {usuarios.length > 0 ? (
                    <Chart
                        chartType="ColumnChart"
                        width="100%"
                        height="400px"
                        data={dataGrafico}
                        options={{
                            isStacked: true,
                            legend: { position: "bottom" },
                        }}
                    />
                ) : (
                    <div className={styles.semDados}>
                        Nenhum usuário encontrado para este projeto.
                    </div>
                )}
            </div>
        </div>
    );
}