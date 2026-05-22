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

        ...usuarios.map((usuario) => [
            usuario.nome,
            20, "#1565C0",
            10, "#2E7D32",
            5, "#F9A825",
            5, "#C62828"
        ])
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

                const response = await fetch(
                    `http://localhost:8084/hora/resumo/${usuario.id}?mes=${mes}&ano=${ano}`
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
    return (
        <div className={styles.container}>
            <h1 className={styles.titulo}>Dashboard do Gestor</h1>
            <div className={styles.filtros}>
                <select
                    className={styles.selectFiltro}
                    value={projetoSelecionado}
                    onChange={(e) => {
                        const value = e.target.value;

                        setProjetoSelecionado(value);

                        if (!value) {
                            setUsuarios([]);
                            return;
                        }

                        buscarUsuariosProjeto(value);
                    }}
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
                <select className={styles.selectFiltro}>
                    <option>Período</option>
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
                                            {resumo?.percentualAprovado?.toFixed(1) ?? 0}%
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