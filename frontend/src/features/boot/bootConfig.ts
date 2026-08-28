// Ported 1:1 from the original assets/scripts/app.js diagnostic/status tables.
export interface DiagnosticStep {
  label: string;
  value: string;
  trigger: number;
}

export const diagnosticSteps: DiagnosticStep[] = [
  { label: "CORE", value: "OK", trigger: 8 },
  { label: "MEMORY", value: "OK", trigger: 20 },
  { label: "GEARBOX", value: "OK", trigger: 34 },
  { label: "PROJECTS", value: "028", trigger: 48 },
  { label: "SANITY", value: "UNKNOWN", trigger: 61 },
];

export interface StatusStage {
  max: number;
  text: string;
}

export const statusStages: StatusStage[] = [
  { max: 10, text: "VERIFYING BOOT SECTOR..." },
  { max: 22, text: "CHECKING MEMORY BANKS..." },
  { max: 36, text: "ENGAGING GEARBOX..." },
  { max: 50, text: "MOUNTING PROJECT REGISTRY..." },
  { max: 63, text: "RUNNING SANITY PROTOCOL..." },
  { max: 76, text: "INITIALIZING MODULE INTERFACE..." },
  { max: 88, text: "LINKING CORE SERVICES..." },
  { max: 96, text: "FINAL SYSTEM CHECK..." },
  { max: 100, text: "SYSTEM READY." },
];
