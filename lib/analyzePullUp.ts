// import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

// export type PullUpPhase = "up" | "down" | "unknown";

// export type AnalysisResult = {
//   phase: PullUpPhase;
// };

// // ランドマーク配列を受け取ってフェーズを返す純粋関数
// export const analyzePullUp = (
//   landmarks: NormalizedLandmark[]
// ): AnalysisResult => {
//   // TODO: ランドマーク座標からフェーズを判定するロジックを実装する
//   return { phase: "unknown" };
// };

// lib/analyzePullUp.ts
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { calcAngle } from "@/lib/calcAngle";

export const analyzePullUp = (lm: NormalizedLandmark[]) => {
  const L_SHOULDER = 11;
  const R_SHOULDER = 12;
  const L_ELBOW = 13;
  const R_ELBOW = 14;
  const L_WRIST = 15;
  const R_WRIST = 16;

  const leftAngle = calcAngle(
    lm[L_SHOULDER],
    lm[L_ELBOW],
    lm[L_WRIST]
  );

  const rightAngle = calcAngle(
    lm[R_SHOULDER],
    lm[R_ELBOW],
    lm[R_WRIST]
  );

  const elbowAngle = (leftAngle + rightAngle) / 2;

  const shoulderY =
    (lm[L_SHOULDER].y + lm[R_SHOULDER].y) / 2;

  return {
    elbowAngle,
    shoulderY,
  };
};