"use client";

import { useClock } from "./useClock";
import type { BootSequence } from "./useBootSequence";
import styles from "./BootScreen.module.css";

interface BootScreenProps {
  boot: BootSequence;
}

// Visual boot sequence screen — pure presentation, all state comes from useBootSequence().
export function BootScreen({ boot }: BootScreenProps) {
  const clock = useClock();
  const secondsLeft = Math.max(0, boot.estimatedSeconds);

  return (
    <section
      className={`${styles.root} ${boot.bootComplete ? styles.rootComplete : ""}`}
      aria-label="SKITECH OS boot sequence"
    >
      <div className={styles.gearWrap} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative background asset, not optimized content */}
        <img className={styles.gearRender} src="/skitech-gear.svg" alt="" />
      </div>

      <div className={styles.mechanicalFrame}>
        <div className={styles.monitor}>
          <div className={`${styles.corner} ${styles.cornerTl}`} />
          <div className={`${styles.corner} ${styles.cornerTr}`} />
          <div className={`${styles.corner} ${styles.cornerBr}`} />
          <div className={`${styles.corner} ${styles.cornerBl}`} />

          <header className={styles.bootHeader}>
            <span>SKITECH BIOS v1.0.0</span>
            <span className={styles.clock}>{clock}</span>
          </header>

          <div className={styles.bootContent}>
            <div>
              <h1 className={styles.bootTitle}>SKITECH OS</h1>
              <p className={styles.bootSubtitle}>PERSONAL OPERATING SYSTEM</p>

              <div className={styles.diagnostics}>
                {boot.diagnostics.map((row) => (
                  <div
                    key={row.label}
                    className={`${styles.diagnosticRow} ${row.active ? styles.diagnosticRowActive : ""} ${row.flash ? styles.diagnosticRowFlash : ""}`}
                  >
                    <span>{row.label}</span>
                    <span className={styles.dots} />
                    <span className={styles.diagnosticValue}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className={`${styles.runtime} ${boot.runtimeActive ? styles.runtimeActive : ""}`}>
                {boot.bootComplete
                  ? "SYSTEM RUNTIME INITIALIZED."
                  : "INITIALIZING SYSTEM RUNTIME..."}
              </div>
            </div>

            <div className={styles.irisSection} aria-hidden="true">
              <div className={styles.irisUi}>
                <div className={styles.irisInner} />
              </div>
            </div>
          </div>

          <div className={styles.loadingSection}>
            <div>
              <div className={styles.loadingLabel}>LOADING OS</div>
              <div className={styles.percentage}>{boot.progress}%</div>
            </div>

            <div className={styles.progressWrapper}>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: `${boot.progress}%` }} />
              </div>

              <div className={styles.progressMeta}>
                <span className={styles.statusLine}>{boot.statusText}</span>
                <span className={styles.progressCount}>{boot.progress}/ 100</span>
                <span>{boot.bootComplete ? "READY" : `EST. 00:${String(secondsLeft).padStart(2, "0")}`}</span>
              </div>
            </div>
          </div>

          <footer className={styles.bootFooter}>
            {boot.bootComplete
              ? "// SKITECH OS READY. ENTERING CORE. //"
              : "// STAND BY. INITIALIZING INTERFACE. //"}
          </footer>
        </div>
      </div>
    </section>
  );
}
