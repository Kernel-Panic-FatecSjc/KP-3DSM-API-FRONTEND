'use client';
import React, { useState } from 'react';
import styles from './navegationBar.module.css';
import { useRouter } from "next/navigation";
import Image from "next/image";

type Menu = {
  id: string;
  title: string;
  route: string;
  iconInactive: string;
  iconActive: string;
};

export default function NavigationBar() {
  const router = useRouter();
  const [active, setActive] = useState("home");

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
      route: "/projetos",
      iconInactive: "/images/projetosIcon.svg",
      iconActive: "/images/projetosIconAzul.svg",
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
      route: "/horas",
      iconInactive: "/images/horasIcon.svg",
      iconActive: "/images/horasIconAzul.svg",
    }
  ];

  const handleClick = (menu: Menu) => {
    setActive(menu.id);
    router.push(menu.route);
  };

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
          const isActive = active === item.id;

          return (
            <div
              key={item.id}
              className={`${styles.menuItem} ${isActive ? styles.active : ""}`}
              onClick={() => handleClick(item)}
            >
              <Image
                src={isActive ? item.iconActive : item.iconInactive}
                width={20}
                height={20}
                alt={item.title}
              />
              <span>{item.title}</span>
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