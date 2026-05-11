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
  const { attributes, listeners, setNodeRef } = useDraggable({ id: task.id });
  return (
    <div ref={setNodeRef} className={`${styles.card} ${isDragging ? styles.dragging : ""}`} {...listeners} {...attributes}>
      <strong>{task.title}</strong>
      <p>{responsibleName}</p>
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
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const prevTasksRef = useRef<Task[]>([]);

  const API = "http://localhost:8080";

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API}/projeto`);
      const mapped: Project[] = (res.data ?? []).map((p: any) => ({ id: String(p.id), name: p.nome ?? p.name ?? `Projeto ${p.id}` }));
      setProjects(mapped);
    } catch(e) { setProjects([]); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/usuario/todos`);
      const mapped: User[] = (res.data ?? []).map((u: any) => ({ id: String(u.id), name: u.nome ?? u.name ?? `Usuario ${u.id}` }));
      setUsers(mapped);
    } catch(e) { setUsers([]); }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const url = selectedProject ? `${API}/tarefas/projeto/${selectedProject}` : `${API}/tarefas`;
      const res = await axios.get(url);
      const newTasks = (res.data ?? []).map(normalizeApiTask);
      setTasks(newTasks);
    } catch(e) { setTasks([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); fetchUsers(); }, []);

  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const url = selectedProject ? `${API}/tarefas/projeto/${selectedProject}` : `${API}/tarefas`;
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
      } catch {}
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [selectedProject]);
  useEffect(() => { fetchTasks(); }, [selectedProject]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const url = selectedProject ? `${API}/tarefas/projeto/${selectedProject}` : `${API}/tarefas`;
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
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedProject]);

  const getResponsibleName = (task: Task) => {
    if (!task.responsibleId) return "Sem responsavel";
    const user = users.find((u) => u.id === task.responsibleId);
    return user ? user.name : "Sem responsavel";
  };

  const getTasksByStatus = (status: TaskStatus) => {
    const scopedTasks = selectedProject ? tasks.filter((task) => task.projectId === selectedProject) : tasks;
    return scopedTasks.filter((task) => task.status === status);
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
      await axios.patch(`${API}/tarefas/${taskId}`, { statusTarefa: mapStatusToBackend(newStatus) });
    } catch { fetchTasks(); }
  };

  return (
    <div className={styles.container}>
      {notification && <div className={styles.notification}>{notification}</div>}

      <div className={styles.dropdownWrapper}>
        <div className={styles.projectDropdown} onClick={() => setOpenProject(!openProject)}>
          {selectedProject ? projects.find((p) => p.id === selectedProject)?.name : "Todos os Projetos"} ?
        </div>
        {openProject && (
          <div className={styles.dropdownMenu}>
            <div className={styles.dropdownItem} onClick={() => { setSelectedProject(null); setOpenProject(false); }}>Todos os Projetos</div>
            {projects.map((project) => (
              <div key={project.id} className={styles.dropdownItem} onClick={() => { setSelectedProject(project.id); setOpenProject(false); }}>{project.name}</div>
            ))}
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