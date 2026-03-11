"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./aiInfo.module.css";

export default function AiInfoPage() {
  const [aiInfo, setAiInfo] = useState(null);
  const [dailyUsage, setDailyUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedModel, setSelectedModel] = useState("default");
  const [savingModel, setSavingModel] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(true);

  useEffect(() => {
    // Preuzmi korisničke podatke iz localStorage
    const storedRole = localStorage.getItem("rola");
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken")

    setUserRole(parseInt(storedRole));
    setUserId(userId);

    const fetchData = async () => {
      try {
        // Fetch AI info iz Xano
        const aiInfoResponse = await fetch(
            `https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/ai/info/${userId}`,
            {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            }
        );

        if (!aiInfoResponse.ok) {
          throw new Error("Greška pri učitavanju AI info");
        }

        const aiInfoData = await aiInfoResponse.json();
        setAiInfo(aiInfoData);
        // Čita llm-switch iz ugježdene ai_info strukture
        const llmSwitch = aiInfoData.ai_info?.["llm-switch"] || "default";
        setSelectedModel(llmSwitch);

        // Fetch dnevne podatke o korišćenju
        const today = new Date().toISOString().split("T")[0];
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mojtermin.site';
        const dailyUsageResponse = await fetch(
          `${apiUrl}/api/aiUsage?owner_id=${userId}&date=${today}`
        );

        const dailyUsageData = await dailyUsageResponse.json();
        setDailyUsage(dailyUsageData);

        // Mesečni podaci se ne učitavaju - samo prikazujemo procenu
      } catch (err) {
        console.error("Greška pri učitavanju podataka:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setLoadingScreen(false);
      }
    };

    fetchData();
  }, []);

  const handleModelChange = async (newModel) => {
    setSelectedModel(newModel);
    setSavingModel(true);

    try {
      // Dohvati authToken iz localStorage
      const authToken = localStorage.getItem("authToken");
      
      // Kreiraj kopiju ai_info sa novom vrednostima llm-switch
      const updatedAiInfo = {
        ...aiInfo.ai_info,
        "llm-switch": newModel,
      };

      const response = await fetch(
        `https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/ai/info/${userId}`,
        {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            ai_info: updatedAiInfo,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Greška pri čuvanju preference");
      }

      console.log("✅ Preferenca modela uspešno sačuvana");
    } catch (err) {
      console.error("Greška pri čuvanju preference:", err);
      setError("Greška pri čuvanju preference modela");
      // Vrati na prethodnu vrednost
      const previousModel = aiInfo.ai_info?.["llm-switch"] || "default";
      setSelectedModel(previousModel);
    } finally {
      setSavingModel(false);
    }
  };

  const ProgressBar = ({ current, limit, label }) => {
    const percentage = limit > 0 ? (current / limit) * 100 : 0;
    const colorClass =
      percentage < 25 ? styles.low : percentage < 75 ? styles.medium : styles.high;

    return (
      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>{label}</span>
          <span className={styles.progressCount}>
            {current} / {limit}
          </span>
        </div>
        <div className={styles.progressBarContainer}>
          <div
            className={`${styles.progressBar} ${colorClass}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <div className={styles.percentage}>{Math.round(percentage)}%</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${styles.loadingScreen} ${loadingScreen ? '' : styles.ucitano}`}>
        <span className="spinner"></span>
      </div>
    );
  }

  if (error) {
    return <div className={styles.container}>{error}</div>;
  }

  if (!aiInfo) {
    return <div className={styles.container}>AI info nije pronađen</div>;
  }

  const isOwner = userRole === 1;
  // Čita limits iz ugježdene ai_info strukture
  const limits = aiInfo.ai_info?.limits || aiInfo.limits || {};
  const paket = aiInfo.paket || "Nepoznat";
  // Ako nema paketa, korisnik je zaposlenik
  const isEmployee = !aiInfo.paket;
  
  const todayUsage = dailyUsage || {
    owner: { llama3: 0, llama4: 0 },
    employees: { llama3: 0, llama4: 0 },
    bookings: { llama3: 0, llama4: 0 },
  };

  return (
    <div className={styles.container}>
      {/* Status Box */}
      <div className={styles.statusBox}>
        <h1>📊 AI ASISTENT STATUS</h1>
        <div className={styles.statusContent}>
          <div className={styles.statusItem}>
            <span>Paket:</span>
            <strong>{isEmployee ? "👨‍💼 Zaposlenik" : paket}</strong>
          </div>
          <div className={styles.statusItem}>
            <span>Cool-down:</span>
            <strong>0 sekundi</strong>
          </div>
          <div className={styles.statusItem}>
            <span>Status:</span>
            <strong className={styles.statusAvailable}>✅ DOSTUPNO</strong>
          </div>
        </div>
      </div>

      {/* Dnevni Limit */}
      <div className={styles.card}>
        <h2>📅 DANAS</h2>

        {isOwner && (
          <>
            {/* Vlasnik */}
            <div className={styles.userGroup}>
              <h4 className={styles.groupTitle}>👤 Vlasnik</h4>
              <div className={styles.modelSection}>
                <ProgressBar
                  current={todayUsage.owner.llama3}
                  limit={limits.owner.llama3}
                  label="Osnovan model"
                />
              </div>
              <div className={styles.modelSection}>
                <ProgressBar
                  current={todayUsage.owner.llama4}
                  limit={limits.owner.llama4}
                  label="Napredni model"
                />
              </div>
            </div>

            {/* Zaposleni */}
            <div className={styles.userGroup}>
              <h4 className={styles.groupTitle}>👥 Zaposleni</h4>
              <div className={styles.modelSection}>
                <ProgressBar
                  current={todayUsage.employees.llama3}
                  limit={limits.employees.llama3}
                  label="Osnovan model"
                />
              </div>
              <div className={styles.modelSection}>
                <ProgressBar
                  current={todayUsage.employees.llama4}
                  limit={limits.employees.llama4}
                  label="Napredni model"
                />
              </div>
            </div>

            {/* Klijenti */}
            <div className={styles.userGroup}>
              <h4 className={styles.groupTitle}>🛒 Klijenti</h4>
              <div className={styles.modelSection}>
                <ProgressBar
                  current={todayUsage.bookings.llama3}
                  limit={limits.bookings.llama3}
                  label="Osnovan model"
                />
              </div>
              <div className={styles.modelSection}>
                <ProgressBar
                  current={todayUsage.bookings.llama4}
                  limit={limits.bookings.llama4}
                  label="Napredni model"
                />
              </div>
            </div>
          </>
        )}

        {!isOwner && (
          <div className={styles.employeeMessage}>
            <p className={styles.dailyQuotaText}>
              📌 <strong>Imate 20 pitanja dnevno</strong>
            </p>
          </div>
        )}
      </div>

      {/* Model Preference & Assistant Info */}
      {isOwner && (
        <div className={styles.card}>
          {/* PREFERENCIJA MODELA */}
          <h2>🤖 PREFERENCIJA MODELA</h2>

          <div className={styles.preferenceContent}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="llmSwitch"
                value="default"
                checked={selectedModel === "default"}
                onChange={() => handleModelChange("default")}
                disabled={savingModel}
              />
              <span>Automatski switch (preporuka)</span>
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="llmSwitch"
                value="jeftin"
                checked={selectedModel === "jeftin"}
                onChange={() => handleModelChange("jeftin")}
                disabled={savingModel}
              />
              <span>Prioritet: Osnovan model</span>
            </label>

            {savingModel && <p className={styles.savingText}>Čuvanje...</p>}
          </div>

          <div className={styles.info}>
            <strong>ℹ️ Kako funkcioniše:</strong>
            <ul>
              <li>
                <strong>Automatski switch:</strong> Koristi napredni model dok je dostupan, zatim osnovan
              </li>
              <li>
                <strong>Prioritet osnovan:</strong> Koristi osnovan model, kako bi uštedeo napredni model
              </li>
            </ul>
          </div>

          <div style={{marginTop:'15px', padding:'0px 8px'}}>
            <p>
              Odabrana preferenca se koristi za sve vaše zaposlene i klijente. Svako od njih ima svoja dnevna ograničenja.
            </p>
          </div>

          {/* Separator */}
          <div className={styles.divider}></div>

          {/* O ASISTENTU */}
          <h2>ℹ️ O ASISTENTU</h2>

          <div className={styles.assistantInfo}>
            <div className={styles.infoRow}>
              <span>Verzija:</span>
              <strong>MT 1.5 agent (beta)</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Tip:</span>
              <strong>Business Analytics AI</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Dostupnost:</span>
              <strong>24/7</strong>
            </div>

            <div className={styles.separator}></div>

            <div className={styles.infoSection}>
              <h4>Model za analizu:</h4>
              <ul>
                <li>Osnovan: Mistral-Small-24B</li>
                <li>Napredni: Llama-4-Maverick</li>
              </ul>
            </div>

            <div className={styles.infoSection}>
              <h4>Mogućnosti:</h4>
              <ul>
                <li>✓ Analiza termina</li>
                <li>✓ Preporuke optimizacije</li>
                <li>✓ Financijski izveštaji</li>
                <li>✓ Grafici i vizuelizacija</li>
                <li>✓ Upravljanje terminima</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {!isOwner && (
        <div className={styles.card}>
          <h2>ℹ️ O ASISTENTU</h2>

          <div className={styles.assistantInfo}>
            <div className={styles.infoRow}>
              <span>Verzija:</span>
              <strong>MT 1.5 agent (beta)</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Tip:</span>
              <strong>Business Analytics AI</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Dostupnost:</span>
              <strong>24/7</strong>
            </div>

            <div className={styles.separator}></div>

            <div className={styles.infoSection}>
              <h4>Model za analizu:</h4>
              <ul>
                <li>Osnovan: Mistral-Small-24B</li>
                <li>Napredni: Llama-4-Maverick</li>
              </ul>
            </div>

            <div className={styles.infoSection}>
              <h4>Mogućnosti:</h4>
              <ul>
                <li>✓ Analiza termina</li>
                <li>✓ Preporuke optimizacije</li>
                <li>✓ Financijski izveštaji</li>
                <li>✓ Grafici i vizuelizacija</li>
                <li>✓ Upravljanje terminima</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
