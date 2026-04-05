'use client';

import React, { useState, useEffect } from 'react';
import styles from './navegationBar.module.css';
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

type Submenu = {
  id: string;
  title: string;
  route: string;
  iconInactive: string;
  iconActive: string;
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

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  const menus: Menu[] = [
    {
      id: "home",
      title: "Home",
      route: "/home",
      iconInactive: "/images/Casa.svg",
      iconActive: "/images/CasaAzul.svg",
    },
    {
      id: "projetos",
      title: "Projetos",
      iconInactive: "/images/projetosIcon.svg",
      iconActive: "/images/projetosIconAzul.svg",
      submenus: [
        {
          id: "registro-projeto",
          title: "Registro de Projeto",
          route: "/registro-projeto",
          iconInactive: "/images/iconRegistroProjeto.svg",
          iconActive: "/images/iconRegistroProjetoAzul.svg"
        },
        {
          id: "projetos-view",
          title: "Visualizar projetos",
          route: "/projetos-view",
          iconInactive: "/images/iconProjetosView.svg",
          iconActive: "/images/iconProjetosViewAzul.svg"
        }
      ]
    },
    {
      id: "tarefas",
      title: "Tarefas",
      route: "/tarefas",
      iconInactive: "/images/tarefasIcon.svg",
      iconActive: "/images/tarefasIconAzul.svg",
    },
    {
      id: "horas",
      title: "Horas",
      route: "/controleHoras/entrada-saida",
      iconInactive: "/images/horasIcon.svg",
      iconActive: "/images/horasIconAzul.svg",
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
                        <Image
                          src={subActive ? sub.iconActive : sub.iconInactive}
                          width={20}
                          height={20}
                          alt={sub.title}
                        />
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

      <div className={styles.user}>
        <span>Miguel nonaka</span>
      </div>

    </div>
  );
}