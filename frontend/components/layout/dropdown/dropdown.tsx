"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./dropdown.module.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const resolveApiBaseUrl = (path: string) => API_BASE_URL ? `${API_BASE_URL}${path.replace(/^\/api/, "")}` : path;

interface DropdownProps {
  label: string;
  icon?: string;
  items: { label: string; value: string }[];
  onSelect?: (value: string) => void;
  loading?: boolean;
}

function Dropdown({ label, icon, items = [], onSelect, loading = false }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (value: string, itemLabel: string) => {
    setSelected(itemLabel);
    setOpen(false);
    onSelect?.(value);
  };

  const handleClear = () => {
    setSelected(null);
    setOpen(false);
    onSelect?.("");
  };

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        className={`${styles.btn} ${open ? styles.btnOpen : ""} ${selected ? styles.btnActive : ""}`}
        onClick={() => setOpen((v) => !v)}
        type="button"
        disabled={loading}
      >
        {icon && <i className={`ti ti-${icon} ${styles.btnIcon}`} aria-hidden="true" />}
        <span>
          {loading ? "Carregando..." : (selected ?? label)}
        </span>
        <i className={`ti ti-chevron-down ${styles.chevron} ${open ? styles.chevronOpen : ""}`} aria-hidden="true" />
      </button>

      {open && !loading && (
        <div className={styles.menu} role="listbox">
          <p className={styles.sectionLabel}>Filtrar por</p>

          {items.length === 0 ? (
            <div className={styles.emptyMessage}>Nenhum item disponível</div>
          ) : (
            items.map((item) => (
              <div
                key={item.value}
                role="option"
                aria-selected={selected === item.label}
                className={`${styles.item} ${selected === item.label ? styles.itemSelected : ""}`}
                onClick={() => handleSelect(item.value, item.label)}
              >
                {icon && <i className={`ti ti-${icon}`} aria-hidden="true" />}
                {item.label}
                {selected === item.label && (
                  <i className={`ti ti-check ${styles.checkIcon}`} aria-hidden="true" />
                )}
              </div>
            ))
          )}

          {selected && items.length > 0 && (
            <>
              <div className={styles.divider} />
              <div className={styles.item} onClick={handleClear}>
                <i className="ti ti-x" aria-hidden="true" />
                Limpar filtro
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function DropdownProfissional({
  onSelect,
  token,
}: {
  onSelect?: (v: string) => void;
  token?: string;
}) {
  const [profissionais, setProfissionais] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchProfissionais = async () => {
      setLoading(true);
      try {
        const url = resolveApiBaseUrl('/api/usuario/todos');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); 
        

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const items = data.map((user: any) => ({
            label: user.nome,
            value: user.id.toString(),
          }));
          setProfissionais(items);
        } else {
          console.error("Falha ao carregar profissionais:", response.status, response.statusText, url);
          setProfissionais([]);
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.error("Timeout ao carregar profissionais (5s):", { apiBaseUrl: API_BASE_URL });
        } else {
          console.error("Erro ao carregar profissionais:", error, { apiBaseUrl: API_BASE_URL });
        }
        setProfissionais([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfissionais();
  }, [token]);

  return (
    <Dropdown
      label="Profissional"
      icon="user"
      items={profissionais}
      onSelect={onSelect}
      loading={loading}
    />
  );
}

export function DropdownProjeto({
  onSelect,
  token,
  profissionalId,
}: {
  onSelect?: (v: string) => void;
  token?: string;
  profissionalId?: string;
}) {
  const [projetos, setProjetos] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchProjetos = async () => {
      setLoading(true);
      try {
        const urls = profissionalId
          ? [
              resolveApiBaseUrl(`/api/projeto/profissional/${profissionalId}`),
              resolveApiBaseUrl(`/api/projetos/profissional/${profissionalId}`),
              resolveApiBaseUrl('/api/projeto'),
            ]
          : [resolveApiBaseUrl('/api/projeto')];

        let response: Response | null = null;
        for (const url of urls) {
          try {
            response = await fetch(url, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            if (response.ok) {
              const data = await response.json();
              const items = Array.isArray(data)
                ? data.map((projeto: any) => ({
                    label: projeto.nome,
                    value: projeto.id.toString(),
                  }))
                : [];
              if (items.length > 0) {
                setProjetos(items);
                return;
              }
            }
          } catch (e) {
            console.warn(`Tentativa falhada para ${url}:`, e);
          }
        }

        console.error("Nenhum endpoint de projetos respondeu corretamente");
        setProjetos([]);
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);
        setProjetos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjetos();
  }, [token, profissionalId]);

  return (
    <Dropdown
      label="Projeto"
      icon="folder"
      items={projetos}
      onSelect={onSelect}
      loading={loading}
    />
  );
}

export function DropdownStatus({ onSelect }: { onSelect?: (v: string) => void }) {
  const statusItems = [
    { label: "Todos",        value: "todos" },
    { label: "Em andamento", value: "em_andamento" },
    { label: "Concluído",    value: "concluido" },
    { label: "Atrasado",     value: "atrasado" },
  ];

  return (
    <Dropdown
      label="Status"
      icon="progress-check"
      items={statusItems}
      onSelect={onSelect}
    />
  );
}

export function DropdownPrioridade({ onSelect }: { onSelect?: (v: string) => void }) {
  const prioridadeItems = [
    { label: "Todas",   value: "todas" },
    { label: "Alta",    value: "alta" },
    { label: "Média",   value: "media" },
    { label: "Baixa",   value: "baixa" },
    { label: "Urgente", value: "urgente" },
  ];

  return (
    <Dropdown
      label="Prioridade"
      icon="flag"
      items={prioridadeItems}
      onSelect={onSelect}
    />
  );
}

export default Dropdown;