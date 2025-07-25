"use client";
import Footer from "@/components/Footer";
import styles from "./pomoc.module.css";

export default function PomocLayout({ children }) {

  return (
    <main className={styles.screen}>
        <div>
            {children}
        </div>
        <Footer />
    </main>
  );
}
