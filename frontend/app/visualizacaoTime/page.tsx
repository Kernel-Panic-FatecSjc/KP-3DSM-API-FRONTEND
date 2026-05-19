"use client";
import React, { useEffect, useState, useRef } from "react";
import styles from "./App.module.css";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

type TaskStatus = "todo" | "doing" | "done" | "blocked";

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  projectId: string;
  responsibleId?: string | null;
};

type Project = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
};

function normalizeStatus(value: unknown): TaskStatus {
  const status = String(value ?? "").toUpperCase();
  if (status === "TODO") return "todo";
  if (status === "DOING") return "doing";
  if (status === "DONE") return "done";
  return "todo";
}

function normalizeApiTask(task: any): Task {
  const responsibleId =
    Array.isArray(task.idResponsaveis) && task.idResponsaveis.length > 0
      ? String(task.idResponsaveis[0])
      : null;
  return {
    id: String(task.id),
    title: task.nome ?? "Sem nome",
    status: task.bloqueada ? "blocked" : normalizeStatus(task.status ?? task.statusTarefa),
    projectId: String(task.idProjeto),
    responsibleId,
  };
}

function mapStatusToBackend(status: TaskStatus) {
  if (status === "todo") return "TO_DO";
  if (status === "doing") return "DOING";
  if (status === "done") return "DONE";
  return "BLOCKED";
}

function TaskCard({ task, responsibleName, isDragging }: { task: Task; responsibleName: string; isDragging: boolean; }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef } = useDraggable({ id: task.id });
  return (
    <div ref={setNodeRef} className={`${styles.card} ${isDragging ? styles.dragging : ""}`}>
      <div ref={setActivatorNodeRef} {...listeners} {...attributes} style={{ cursor: "grab" }}>
        <strong>{task.title}</strong>
        <p>{responsibleName}</p>
      </div>
    </div>
  );
}

function Column({ title, status, tasks, getResponsibleName, activeTaskId, isBlocked }: {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  getResponsibleName: (task: Task) => string;
  activeTaskId: string | null;
  isBlocked?: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} className={isBlocked ? styles.columnBlocked : styles.column}>
      <h3>{title}</h3>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} responsibleName={getResponsibleName(task)} isDragging={activeTaskId === task.id} />
      ))}
    </div>
  );
}

export default function Page() {
  const [openProject, setOpenProject] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [filterMode, setFilterMode] = useState<'none' | 'project' | 'user'>('none');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const prevTasksRef = useRef<Task[]>([]);


  const fetchProjects = async () => {
    try {
      const res = await axios.get(`http://localhost:8082/projeto`);
      const mapped: Project[] = (res.data ?? []).map((p: any) => ({ id: String(p.id), name: p.nome ?? p.name ?? `Projeto ${p.id}` }));
      setProjects(mapped);
    } catch (e) { setProjects([]); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:8083/usuario/todos`);
      const mapped: User[] = (res.data ?? []).map((u: any) => ({ id: String(u.id), name: u.nome ?? u.name ?? `Usuario ${u.id}` }));
      setUsers(mapped);
    } catch (e) { setUsers([]); }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let url = `http://localhost:8085/tarefas`;
      if (filterMode === 'project' && selectedProject) {
        url = `http://localhost:8085/tarefas/projeto/${selectedProject}`;
      } else if (filterMode === 'user' && selectedUser) {
        url = `http://localhost:8085/tarefas/funcionario/${selectedUser}`;
      }
      const res = await axios.get(url);
      const newTasks = (res.data ?? []).map(normalizeApiTask);
      setTasks(newTasks);
    } catch (e) { setTasks([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); fetchUsers(); }, []);

  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        let url = `http://localhost:8085/tarefas`;
        if (filterMode === 'project' && selectedProject) {
          url = `http://localhost:8085/tarefas/projeto/${selectedProject}`;
        } else if (filterMode === 'user' && selectedUser) {
          url = `http://localhost:8085/tarefas/funcionario/${selectedUser}`;
        }
        const res = await axios.get(url);
        const newTasks = (res.data ?? []).map(normalizeApiTask);
        const prev = prevTasksRef.current;
        newTasks.forEach((t: Task) => {
          const old = prev.find(p => p.id === t.id);
          if (old && old.status !== "blocked" && t.status === "blocked") {
            setNotification(`Tarefa "${t.title}" foi bloqueada!`);
            setTimeout(() => setNotification(null), 3000);
          }
        });
        prevTasksRef.current = newTasks;
        setTasks(newTasks);
      } catch { }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [selectedProject, selectedUser, filterMode]);
  useEffect(() => { fetchTasks(); }, [selectedProject, selectedUser, filterMode]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        let url = `http://localhost:8085/tarefas`;
        if (filterMode === 'project' && selectedProject) {
          url = `http://localhost:8085/tarefas/projeto/${selectedProject}`;
        } else if (filterMode === 'user' && selectedUser) {
          url = `http://localhost:8085/tarefas/funcionario/${selectedUser}`;
        }
        const res = await axios.get(url);
        const newTasks = (res.data ?? []).map(normalizeApiTask);
        const prev = prevTasksRef.current;
        newTasks.forEach((t: Task) => {
          const old = prev.find(p => p.id === t.id);
          if (old && old.status !== "blocked" && t.status === "blocked") {
            setNotification(`Tarefa "${t.title}" foi bloqueada!`);
            setTimeout(() => setNotification(null), 3000);
          }
        });
        prevTasksRef.current = newTasks;
        setTasks(newTasks);
      } catch { }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedProject, selectedUser, filterMode]);

  const getResponsibleName = (task: Task) => {
    if (!task.responsibleId) return "Sem responsavel";
    const user = users.find((u) => u.id === task.responsibleId);
    return user ? user.name : "Sem responsavel";
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === String(event.active.id));
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    const taskId = String(active.id);
    setTasks((prev) => prev.map((task) => task.id === taskId ? { ...task, status: newStatus } : task));
    try {
      await axios.patch(`http://localhost:8085/tarefas/${taskId}`, { statusTarefa: mapStatusToBackend(newStatus) });
    } catch { fetchTasks(); }
  };

  return (
    <div className={styles.container}>
      {notification && <div className={styles.notification}>{notification}</div>}

      <div className={styles.dropdownWrapper}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={() => { setFilterMode('none'); setSelectedProject(null); setSelectedUser(null); }}
            style={{
              padding: '8px 16px',
              backgroundColor: filterMode === 'none' ? '#007bff' : '#ccc',
              color: filterMode === 'none' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: filterMode === 'none' ? 'bold' : 'normal'
            }}
          >
            Todos os Projetos
          </button>
          <button
            onClick={() => { setFilterMode('project'); setSelectedUser(null); }}
            style={{
              padding: '8px 16px',
              backgroundColor: filterMode === 'project' ? '#007bff' : '#ccc',
              color: filterMode === 'project' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: filterMode === 'project' ? 'bold' : 'normal'
            }}
          >
            Filtrar por Projeto
          </button>
          <button
            onClick={() => { setFilterMode('user'); setSelectedProject(null); }}
            style={{
              padding: '8px 16px',
              backgroundColor: filterMode === 'user' ? '#007bff' : '#ccc',
              color: filterMode === 'user' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: filterMode === 'user' ? 'bold' : 'normal'
            }}
          >
            Filtrar por Usuário
          </button>
        </div>

        {filterMode === 'project' && (
          <div className={styles.projectDropdown} onClick={() => setOpenProject(!openProject)}>
            {selectedProject ? projects.find((p) => p.id === selectedProject)?.name : "Selecione um Projeto"}
            {openProject && (
              <div className={styles.dropdownMenu}>
                {projects.map((project) => (
                  <div key={project.id} className={styles.dropdownItem} onClick={() => { setSelectedProject(project.id); setOpenProject(false); }}>{project.name}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {filterMode === 'user' && (
          <div className={styles.projectDropdown} onClick={() => setOpenUser(!openUser)}>
            {selectedUser ? users.find((u) => u.id === selectedUser)?.name : "Selecione um Usuário"}
            {openUser && (
              <div className={styles.dropdownMenu}>
                {users.map((user) => (
                  <div key={user.id} className={styles.dropdownItem} onClick={() => { setSelectedUser(user.id); setOpenUser(false); }}>{user.name}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? <div>Carregando...</div> : (
        <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className={styles.kanban}>
            <Column title="TO DO" status="todo" tasks={getTasksByStatus("todo")} getResponsibleName={getResponsibleName} activeTaskId={activeTask?.id ?? null} />
            <Column title="DOING" status="doing" tasks={getTasksByStatus("doing")} getResponsibleName={getResponsibleName} activeTaskId={activeTask?.id ?? null} />
            <Column title="DONE" status="done" tasks={getTasksByStatus("done")} getResponsibleName={getResponsibleName} activeTaskId={activeTask?.id ?? null} />
            <Column title="BLOQUEADA" status="blocked" tasks={getTasksByStatus("blocked")} getResponsibleName={getResponsibleName} activeTaskId={activeTask?.id ?? null} isBlocked={true} />
          </div>
          <DragOverlay>
            {activeTask ? (<div className={styles.cardOverlay}><strong>{activeTask.title}</strong><p>{getResponsibleName(activeTask)}</p></div>) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}