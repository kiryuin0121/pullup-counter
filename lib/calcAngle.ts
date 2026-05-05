import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export const calcAngle = (
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
) => {
  const ab = [a.x - b.x, a.y - b.y];
  const cb = [c.x - b.x, c.y - b.y];

  const dot = ab[0] * cb[0] + ab[1] * cb[1];
  const magAB = Math.hypot(ab[0], ab[1]);
  const magCB = Math.hypot(cb[0], cb[1]);

  const angle = Math.acos(dot / (magAB * magCB));
  return (angle * 180) / Math.PI;
};