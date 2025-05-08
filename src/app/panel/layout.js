"use client";
import Sidebar from "@/components/Sidebar";
import styles from "./panel.module.css";

export default function PanelLayout({ children }) {
  return (
    <main className={styles.screen}>
      <Sidebar />
      <div className="content">
        {children}
      </div>
    </main>
  );
}
