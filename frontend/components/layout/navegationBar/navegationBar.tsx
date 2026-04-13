'use client';

import React, { useState, useEffect } from 'react';
import styles from './navegationBar.module.css';
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

type Submenu = {
  id: string;
  title: string;
  route: string;
};

type Menu = {
  id: string;
  title: string;
  route?: string;
  iconInactive: string;
  iconActive: string;
  submenus?: Submenu[];
};

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  const menus: Menu[] = [
    {
      id: "profissional",
      title: "Profissional",
      iconInactive: "/images/iconProfissional.svg",
      iconActive: "/images/iconProfissionalAzul.svg",
      submenus: [
        {
          id: "controleHoras",
          title: "Controle de Horas",
          route: "/controleHoras/entrada-saida",
        },
        {
          id: "tarefas",
          title: "Tarefas",
          route: "/",
        }
      ]
    },
    {
      id: "gestor",
      title: "Gestor",
      route: "/tarefas",
      iconInactive: "/images/iconGestor.svg",
      iconActive: "/images/iconGestorAzul.svg",
      submenus: [
        {
          id: "usuario",
          title: "Usuários",
          route: "/",
        },
        {
          id: "projetos",
          title: "Projetos",
          route: "/",
        },
        {
          id: "tarefas",
          title: "Tarefas",
          route: "/",
        },
        {
          id: "aprovacaoHoras",
          title: "Aprovação de horas",
          route: "/",
        },
        {
          id: "visibilidadeTime",
          title: "Visibilidade do Time",
          route: "/",
        },
        {
          id: "relatorioBloqueios",
          title: "Relatório de bloqueios",
          route: "/",
        },
        {
          id: "historicoTarefas",
          title: "Histórico de Tarefas",
          route: "/",
        }
      ]
    },
    {
      id: "financeiro",
      title: "Financeiro",
      route: "/",
      iconInactive: "/images/iconFinanceiro.svg",
      iconActive: "/images/iconFinanceiroAzul.svg",
      submenus: [
        {
          id: "painelFinanceiro",
          title: "Painel Finaceiro",
          route: "/",
        }
      ]
    },
    {
      id: "administrador",
      title: "Adminstrador",
      route: "/",
      iconInactive: "/images/iconAdm.svg",
      iconActive: "/images/iconAdmAzul.svg",
      submenus: [
        {
          id: "auditoriaLancamentos",
          title: "Auditoria de lançamentos",
          route: "/",
        }
      ]
    },
    {
      id: "dashboard",
      title: "Dashboard",
      route: "/",
      iconInactive: "/images/iconDashboard.svg",
      iconActive: "/images/iconDashboardAzul.svg",
      submenus: [
        {
          id: "dashboardProfissional",
          title: "Dashboard do Profissional",
          route: "/",
        },
        {
          id: "dashboardGestor",
          title: "Dashboard do gestor",
          route: "/",
        },
        {
          id: "dashboardFinanceiro",
          title: "Dashboard do Financeiro/Admin",
          route: "/",
        }
      ]
    }
  ];

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
        {menus.map((item) => {

          const isActive =
            item.route
              ? pathname === item.route
              : item.submenus?.some(sub => pathname === sub.route);

          return (
            <div key={item.id} className={styles.menuItem}>
              
              <div
                className={`${styles.menuButton} ${isActive ? styles.active : ""}`}
                onClick={() => {
                  if (item.submenus) {
                    setOpenMenu(openMenu === item.id ? null : item.id);
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
                  {item.submenus.map((sub) => {
                    const subActive = pathname === sub.route;

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
      <div className={styles.hamburger} onClick={() => setMobileOpen(true)}>
        ☰
      </div>
      <div className={styles.user}>
        <span>Miguel nonaka</span>
      </div>
          {mobileOpen && (
      <div 
        className={styles.overlay}
        onClick={() => setMobileOpen(false)}
      />
    )}
        <div className={`${styles.mobileMenu} ${mobileOpen ? styles.active : ""}`}>
      {menus.map((item) => (
        <div key={item.id} className={styles.mobileItem}>
          
          <div
            onClick={() => {
              if (item.route) {
                router.push(item.route);
                setMobileOpen(false);
              }
            }}
          >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              {item.submenus.map((sub) => (
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