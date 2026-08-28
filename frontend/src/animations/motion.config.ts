// Single source of truth for animation timings/easings — no magic numbers in components.
export const motion = {
  duration: {
    instant: 120,
    fast: 180,
    normal: 260,
    slow: 350,
    slower: 700,
    slowest: 850,
  },
  easing: {
    mechanical: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    enter: "ease",
    exit: "ease-out",
  },
  boot: {
    total: 3500,
    fadeOut: 700,
    flashGap: 60,
    flashDuration: 520,
    // Delay before the homepage becomes visible after boot finishes.
    mainPageDelay: 700 + 60 + 520 + 60,
  },
} as const;
