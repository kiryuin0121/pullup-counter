// store/pullUpStore.ts
import { create } from "zustand";

type Phase = "IDLE" | "DOWN" | "UP" | "TOP";

type AnalyzeResult = {
  shoulderY: number;
  elbowAngle: number;
};

type State = {
  count: number;
  phase: Phase;
  lastShoulderY: number | null;
  isRunning: boolean;

  update: (data: AnalyzeResult) => void;
  start: () => void;
  stop: () => void;
  reset: () => void;
};

export const usePullUpStore = create<State>((set, get) => ({
  count: 0,
  phase: "IDLE",
  lastShoulderY: null,
  isRunning: false,

  start: () => set({ isRunning: true }),
  stop: () => set({ isRunning: false }),

  reset: () =>
    set({
      count: 0,
      phase: "IDLE",
      lastShoulderY: null,
      isRunning: false,
    }),

  update: ({ shoulderY, elbowAngle }) => {
    const { isRunning } = get();
    if (!isRunning) return; // ← 計測中のみ動かす

    const { phase, count, lastShoulderY } = get();

    if (lastShoulderY === null) {
      set({ lastShoulderY: shoulderY });
      return;
    }

    const goingUp = shoulderY < lastShoulderY;
    const goingDown = shoulderY > lastShoulderY;

    let nextPhase = phase;
    let nextCount = count;

    switch (phase) {
      case "IDLE":
        if (elbowAngle > 160) nextPhase = "DOWN";
        break;

      case "DOWN":
        if (goingUp && elbowAngle < 140) nextPhase = "UP";
        break;

      case "UP":
        if (elbowAngle < 70) nextPhase = "TOP";
        break;

      case "TOP":
        if (goingDown && elbowAngle > 150) {
          nextPhase = "DOWN";
          nextCount += 1;
        }
        break;
    }

    set({
      count: nextCount,
      phase: nextPhase,
      lastShoulderY: shoulderY,
    });
  },
}));