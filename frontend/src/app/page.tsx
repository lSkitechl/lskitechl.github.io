"use client";

import { useEffect, useState } from "react";
import { BootScreen } from "@/features/boot/BootScreen";
import { useBootSequence } from "@/features/boot/useBootSequence";
import { modules } from "@/lib/config/modules";
import { motion } from "@/animations/motion.config";
import styles from "./page.module.css";

// Drives the boot -> flash -> main page reveal sequence once the boot hook reports completion.
function useMainPageReveal(bootComplete: boolean) {
  const [flashActive, setFlashActive] = useState(false);
  const [mainVisible, setMainVisible] = useState(false);
  const [trackedBootComplete, setTrackedBootComplete] = useState(bootComplete);

  // Reset the reveal state as soon as a restart flips bootComplete back to false — done during
  // render (React's sanctioned way to adjust state on prop change) rather than in an effect.
  if (bootComplete !== trackedBootComplete) {
    setTrackedBootComplete(bootComplete);
    if (!bootComplete) {
      setFlashActive(false);
      setMainVisible(false);
    }
  }

  useEffect(() => {
    if (!bootComplete) return;

    const flashTimer = window.setTimeout(
      () => setFlashActive(true),
      motion.boot.fadeOut + motion.boot.flashGap,
    );
    const mainTimer = window.setTimeout(() => setMainVisible(true), motion.boot.mainPageDelay);

    return () => {
      window.clearTimeout(flashTimer);
      window.clearTimeout(mainTimer);
    };
  }, [bootComplete]);

  return { flashActive, mainVisible };
}

export default function HomePage() {
  const boot = useBootSequence();
  const { flashActive, mainVisible } = useMainPageReveal(boot.bootComplete);
  const visibleModules = modules.filter((module) => module.enabled || module.id === "lab");

  return (
    <div className="site-shell">
      <BootScreen boot={boot} />

      <main className={`${styles.mainPage} ${mainVisible ? styles.mainPageVisible : ""}`}>
        <div className={styles.pageFrame}>
          <nav className={styles.mainNav}>
            <div>SKITECH OS / CORE</div>
            <div className={styles.mainNavRight}>
              <span>
                <span className={styles.systemDot} />
                ONLINE
              </span>
              <button className={styles.replay} type="button" onClick={boot.restart}>
                REPLAY BOOT
              </button>
              <span>EN</span>
            </div>
          </nav>

          <section className={styles.hero}>
            <div>
              <p className={styles.heroKicker}>PERSONAL SYSTEM / BUILD 001</p>
              <h2 className={styles.heroTitle}>SKITECH</h2>

              <p className={styles.heroDescription}>
                Software, automation, tools, experiments and everything built somewhere between
                curiosity and controlled chaos.
              </p>

              <div className={styles.heroActions}>
                <button className={styles.systemButton} type="button">
                  PROJECTS
                </button>
                <button className={styles.systemButton} type="button">
                  TOOLS
                </button>
                <button className={styles.systemButton} type="button">
                  GAMING
                </button>
              </div>
            </div>

            <aside className={styles.modulePanel}>
              <p className={styles.modulePanelTitle}>AVAILABLE MODULES</p>
              {visibleModules.map((module) => (
                <div className={styles.moduleItem} key={module.id}>
                  <span className={styles.moduleNumber}>{String(module.order / 10).padStart(2, "0")}</span>
                  <span>{module.title}</span>
                  <span className={styles.moduleStatus}>{module.enabled ? "ONLINE" : "STANDBY"}</span>
                </div>
              ))}
            </aside>
          </section>
        </div>
      </main>

      <div className="noise" />
      <div className="scanlines" />
      <div className="vignette" />
      <div className={`screen-flash ${flashActive ? "is-active" : ""}`} />
    </div>
  );
}
