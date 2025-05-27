"use client";
import { useState } from "react";
import Header from "./components/Header";
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
