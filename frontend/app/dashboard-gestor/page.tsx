"use client";
import styles from './App.module.css';
import { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";

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
    const [filtro, setFiltro] = useState("semana");
    return (
        <div className={styles.container}>
            <h1 className={styles.titulo}>Dashboard do Gestor</h1>
            <div className={styles.filtros}>
                <select className={styles.selectFiltro}>
                    <option>Projeto</option>
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
                        <tr>
                            <td>José</td>
                            <td style={{ color: 'green' }}><strong>85%</strong></td>
                            <td style={{ color: 'orange' }}><strong>10%</strong></td>
                            <td style={{ color: 'red' }}><strong>5%</strong></td>
                        </tr>
                        <tr>
                            <td>Daniele</td>
                            <td style={{ color: 'green' }}><strong>90%</strong></td>
                            <td style={{ color: 'orange' }}><strong>8%</strong></td>
                            <td style={{ color: 'red' }}><strong>2%</strong></td>
                        </tr>
                        <tr>
                            <td>Hanna</td>
                            <td style={{ color: 'green' }}><strong>70%</strong></td>
                            <td style={{ color: 'orange' }}><strong>20%</strong></td>
                            <td style={{ color: 'red' }}><strong>10%</strong></td>
                        </tr>
                        <tr>
                            <td>Frida</td>
                            <td style={{ color: 'green' }}><strong>95%</strong></td>
                            <td style={{ color: 'orange' }}><strong>5%</strong></td>
                            <td style={{ color: 'red' }}><strong>0%</strong></td>
                        </tr>
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
                <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="400px"
                    data={data}
                    options={{
                        isStacked: true,
                        legend: { position: "bottom" },
                    }}
                />
            </div>
        </div>
    );
}