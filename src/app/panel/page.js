"use client";
import styles from "./panel.module.css";
import Kalendar from "./components/Kalendar";
import { useEffect, useState } from "react";

export default function PanelPage() {

  return (
    <div className={styles.child}>
      <Kalendar />
    </div>
  );
}
