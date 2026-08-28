"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { diagnosticSteps, statusStages } from "./bootConfig";
import { motion } from "@/animations/motion.config";

export interface DiagnosticRowState {
  label: string;
  value: string;
  done: boolean;
  active: boolean;
  flash: boolean;
}

export interface BootSequence {
  progress: number;
  statusText: string;
  estimatedSeconds: number;
  diagnostics: DiagnosticRowState[];
  runtimeActive: boolean;
  bootComplete: boolean;
  restart: () => void;
}

function createInitialDiagnostics(): DiagnosticRowState[] {
  return diagnosticSteps.map((step) => ({
    label: step.label,
    value: "WAIT",
    done: false,
    active: false,
    flash: false,
  }));
}

// Mirrors the original app.js easing curve: an irregular ramp feels more like a real boot sequence
// than a linear progress bar.
function calculateProgress(elapsed: number): number {
  const normalized = Math.min(elapsed / motion.boot.total, 1);

  if (normalized < 0.1) return (normalized / 0.1) * 8;
  if (normalized < 0.25) return 8 + ((normalized - 0.1) / 0.15) * 17;
  if (normalized < 0.48) return 25 + ((normalized - 0.25) / 0.23) * 25;
  if (normalized < 0.7) return 50 + ((normalized - 0.48) / 0.22) * 25;
  if (normalized < 0.9) return 75 + ((normalized - 0.7) / 0.2) * 18;
  return 93 + ((normalized - 0.9) / 0.1) * 7;
}

function statusForProgress(progress: number): string {
  const stage = statusStages.find((candidate) => progress <= candidate.max);
  return stage ? stage.text : statusStages[statusStages.length - 1].text;
}

// React-hook rewrite of the old startBoot/bootLoop/finishBoot trio: state lives in React instead
// of being written directly onto DOM nodes.
export function useBootSequence(): BootSequence {
  const [progress, setProgress] = useState(0);
  const [diagnostics, setDiagnostics] = useState<DiagnosticRowState[]>(createInitialDiagnostics);
  const [runtimeActive, setRuntimeActive] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);

  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const flashTimeoutsRef = useRef<number[]>([]);

  const clearFlashTimeouts = useCallback(() => {
    flashTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    flashTimeoutsRef.current = [];
  }, []);

  const applyProgress = useCallback((value: number) => {
    const rounded = Math.min(100, Math.floor(value));
    setProgress(rounded);
    if (rounded >= 63) setRuntimeActive(true);

    setDiagnostics((previous) =>
      previous.map((row, index) => {
        const step = diagnosticSteps[index];
        if (rounded < step.trigger || row.done) return row;

        const timeoutId = window.setTimeout(() => {
          setDiagnostics((current) =>
            current.map((current_row, i) => (i === index ? { ...current_row, flash: false } : current_row)),
          );
        }, 380);
        flashTimeoutsRef.current.push(timeoutId);

        return { ...row, done: true, active: true, flash: true, value: step.value };
      }),
    );
  }, []);

  const finishBoot = useCallback(() => {
    setBootComplete(true);
    setProgress(100);
    setRuntimeActive(true);
    setDiagnostics((previous) => previous.map((row) => ({ ...row, active: true })));
  }, []);

  const runLoop = useCallback(
    function loop(timestamp: number) {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const value = calculateProgress(elapsed);

      applyProgress(value);

      if (value >= 100) {
        finishBoot();
        return;
      }
      frameRef.current = requestAnimationFrame(loop);
    },
    [applyProgress, finishBoot],
  );

  const start = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    clearFlashTimeouts();

    startTimeRef.current = null;
    setBootComplete(false);
    setRuntimeActive(false);
    setProgress(0);
    setDiagnostics(createInitialDiagnostics());

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      applyProgress(100);
      finishBoot();
      return;
    }

    frameRef.current = requestAnimationFrame(runLoop);
  }, [applyProgress, clearFlashTimeouts, finishBoot, runLoop]);

  useEffect(() => {
    start();
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      clearFlashTimeouts();
    };
    // Runs once on mount only — `start` is intentionally not re-invoked on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estimatedSeconds = Math.max(
    0,
    Math.ceil((motion.boot.total * (1 - progress / 100)) / 1000),
  );

  return {
    progress,
    statusText: bootComplete ? "SYSTEM READY." : statusForProgress(progress),
    estimatedSeconds,
    diagnostics,
    runtimeActive,
    bootComplete,
    restart: start,
  };
}
