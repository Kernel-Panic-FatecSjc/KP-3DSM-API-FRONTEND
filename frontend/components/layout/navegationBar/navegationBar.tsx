'use client';

import React, { useState, useEffect } from 'react';
import styles from './navegationBar.module.css';
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

type Submenu = {
  id: string;
  title: string;
  route: string;
  cargos?: string[];
};

type Menu = {
  id: string;
  title: string;
  route?: string;
  iconInactive: string;
  iconActive: string;
  cargos: string[];
  submenus?: Submenu[];
};

const PERMISSOES: Record<string, string[]> = {
  profissional: ["profissional"],
  gestor: ["gestor"],
  financeiro: ["financeiro", "gestor"],
  dashboard: ["profissional", "financeiro", "gestor"],
};

export default function NavigationBar() {

  const router = useRouter();
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [user, setUser] = useState<{
    name: string;
    role: string;
  } | null>(null);

  const [cargo, setCargo] = useState<string>('');

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {

    const nome = localStorage.getItem('nome');
    const cargoStorage = localStorage.getItem('cargo');

    if (nome && cargoStorage) {

      const cargoFormatado = cargoStorage
        .toLowerCase()
        .replace('role_', '');

      setUser({
        name: nome,
        role: cargoFormatado
      });

      setCargo(cargoFormatado);
    }

  }, []);

  const logout = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    localStorage.removeItem('cargo');

    router.push('/login');
  };

  const menus: Menu[] = [
    {
      id: "profissional",
      title: "Profissional",
      iconInactive: "/images/iconProfissional.svg",
      iconActive: "/images/iconProfissionalAzul.svg",
      cargos: PERMISSOES.profissional,
      submenus: [
        {
          id: "apontamentos",
          title: "Apontamentos",
          route: "/controleHoras/entrada-saida"
        },
        {
          id: "bloqueioAtividades",
          title: "Bloqueio de atividades",
          route: "/bloqueioTarefas"
        }
      ]
    },
    {
      id: "gestor",
      title: "Gestor",
      iconInactive: "/images/iconGestor.svg",
      iconActive: "/images/iconGestorAzul.svg",
      cargos: PERMISSOES.gestor,
      submenus: [
        {
          id: "usuario",
          title: "Usuários",
          route: "/cadastro_usuario"
        },
        {
          id: "clientes",
          title: "Clientes",
          route: "/cadastro_clientes"
        },
        {
          id: "projetos",
          title: "Projetos",
          route: "/projetos"
        },
        {
          id: "registroProjetos",
          title: "Registro de Projetos",
          route: "/registro-projeto"
        },
        {
          id: "atividades",
          title: "Atividades",
          route: "/gestao-tarefas-gestor"
        },
        {
          id: "aprovacaoHoras",
          title: "Aprovação de horas",
          route: "/aprovacao-horas"
        },
        {
          id: "visibilidadeTime",
          title: "Visibilidade do Time",
          route: "/visualizacaoTime"
        },
        {
          id: "relatorioBloqueios",
          title: "Relatório de bloqueios",
          route: "/historico_bloqueio"
        }
      ]
    },
    {
      id: "financeiro",
      title: "Financeiro",
      iconInactive: "/images/iconFinanceiro.svg",
      iconActive: "/images/iconFinanceiroAzul.svg",
      cargos: PERMISSOES.financeiro,
      submenus: [
        {
          id: "auditoriaLancamentos",
          title: "Auditoria de lançamentos",
          route: "/painel-auditoria"
        },
        {
          id: "painelFinanceiro",
          title: "Painel Financeiro",
          route: "/dashboard-Financeiro-Cliente"
        }
      ]
    },
    {
      id: "painelFinanceiro",
      title: "Painel Financeiro",
      route: "/dashboard-Financeiro-Cliente"
    }
  ]
},
    {
      id: "dashboard",
      title: "Dashboard",
      iconInactive: "/images/iconDashboard.svg",
      iconActive: "/images/iconDashboardAzul.svg",
      cargos: PERMISSOES.dashboard,
      submenus: [
        {
          id: "dashboardProfissional",
          title: "Dashboard do Profissional",
          route: "/dashboardProfissional",
          cargos: ["profissional", "gestor"]
        },
        {
          id: "dashboardGestor",
          title: "Dashboard do gestor",
          route: "/dashboard-gestor",
          cargos: ["gestor"]
        },
        {
          id: "dashboardFinanceiro",
          title: "Dashboard do Financeiro/Admin",
          route: "/dashboardFinanceiro",
          cargos: ["financeiro", "gestor"]
        }
      ]
    }
  ];

  const menusFiltrados = menus.filter(item =>
    item.cargos.includes(cargo)
  );

  return (
    <div className={styles.container}>

      <div className={styles.logo}>
        <Image
          src="/images/logoGSW.svg"
          width={120}
          height={40}
          alt="Logo GSW"
          priority
        />
      </div>

      <div className={styles.menu}>

        {menusFiltrados.map((item) => {

          const isActive =
            item.route
              ? pathname === item.route
              : item.submenus?.some(
                sub => pathname === sub.route
              );

          return (
            <div
              key={item.id}
              className={styles.menuItem}
            >

              <div
                className={`${styles.menuButton} ${isActive ? styles.active : ""}`}
                onClick={() => {

                  if (item.submenus) {

                    setOpenMenu(
                      openMenu === item.id
                        ? null
                        : item.id
                    );

                  } else if (item.route) {

                    router.push(item.route);
                  }
                }}
              >

                <Image
                  src={isActive ? item.iconActive : item.iconInactive}
                  width={24}
                  height={24}
                  alt={item.title}
                />

                <span>{item.title}</span>

              </div>

              {item.submenus && openMenu === item.id && (

                <div className={styles.dropdown}>

                  {item.submenus.filter(sub => !sub.cargos || sub.cargos.includes(cargo)).map((sub) => {

                    const subActive =
                      pathname === sub.route;

                    return (
                      <div
                        key={sub.id}
                        className={`${styles.dropdownItem} ${subActive ? styles.activeDropdown : ""}`}
                        onClick={() => {

                          router.push(sub.route);

                          setOpenMenu(null);
                        }}
                      >

                        <span>{sub.title}</span>

                      </div>
                    );
                  })}

                </div>

              )}

            </div>
          );
        })}

      </div>

      <div
        className={styles.hamburger}
        onClick={() => setMobileOpen(true)}
      >
        ☰
      </div>

      <div className={styles.user}>
        {user ? (
          <div className={styles.userInfo}>
            <span>{user.name} ({user.role})</span>

            <img
              src="/images/iconSair.svg"
              alt="Sair"
              className={styles.logoutIcon}
              onClick={logout}
            />
          </div>
        ) : (
          <span>Carregando...</span>
        )}
      </div>

      {mobileOpen && (

        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
        />

      )}

      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.active : ""}`}>

        {menusFiltrados.map((item) => (

          <div
            key={item.id}
            className={styles.mobileItem}
          >

            <div
              onClick={() => {

                if (item.route) {

                  router.push(item.route);

                  setMobileOpen(false);
                }
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >

                <Image
                  src={item.iconInactive}
                  width={20}
                  height={20}
                  alt={item.title}
                />

                <span>{item.title}</span>

              </div>

            </div>

            {item.submenus && (

              <div className={styles.mobileSubmenu}>

                {item.submenus.filter(sub => !sub.cargos || sub.cargos.includes(cargo)).map((sub) => (
                  <div
                    key={sub.id}
                    className={styles.mobileSubItem}
                    onClick={() => {

                      router.push(sub.route);

                      setMobileOpen(false);
                    }}
                  >

                    {sub.title}

                  </div>

                ))}

              </div>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}