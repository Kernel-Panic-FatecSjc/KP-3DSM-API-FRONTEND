'use client';
import { useState, useEffect } from 'react';
import styles from './App.module.css';
import { mock } from 'node:test';

const page = () => {

const [openProject,setOpenProject] = useState(false)
const [selectedProject, setSelectedProject] = useState<string | null>(null);

const mockProjects = [
    { id: "1", name: "Projeto Alpha"},
    { id: "2", name: "Projeto Beta"},
    { id: "3", name: "Projeto Gamma"}
];

  return (
    <div className={styles.container}>
      <div className={styles.projectDropdown} onClick={() => setOpenProject(!openProject)}>
        {selectedProject ? mockProjects.find(p => p.id === selectedProject)?.name: "Projetos"} ▼
      </div>
    </div>
  )
}

export default page
