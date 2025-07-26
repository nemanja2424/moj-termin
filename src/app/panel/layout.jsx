"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import styles from "./panel.module.css";
import useLogout from "@/hooks/useLogout";

export default function PanelLayout({ children }) {
  const logout = useLogout();

  const [rasirenSidebar, setRasirenSidebar] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      logout();
      return;
    }
  }, []);

  return (
    <main className={styles.screen}>
      <Sidebar rasirenSidebar={rasirenSidebar} setRasirenSidebar={setRasirenSidebar} />
      <div className={`${styles.content} ${!rasirenSidebar ? styles.skupljen : ''}`}>
        {children}
      </div>
    </main>
  );
}
