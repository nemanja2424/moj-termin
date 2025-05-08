"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import styles from "./panel.module.css";

export default function PanelLayout({ children }) {
  const [rasirenSidebar, setRasirenSidebar] = useState(false);

  return (
    <main className={styles.screen}>
      <Sidebar rasirenSidebar={rasirenSidebar} setRasirenSidebar={setRasirenSidebar} />
      <div className={`${styles.content} ${!rasirenSidebar ? styles.skupljen : ''}`}>
        {children}
      </div>
    </main>
  );
}
