import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { PoseLandmarker } from "@mediapipe/tasks-vision";

const DRAW_STYLE = {
  joint: {
    radius: 6,
    fillColor: "#ff1493",    // ピンク
    strokeColor: "#003B00",  // 関節点の輪郭色
    lineWidth: 1.5,
  },
  bone: {
    color: "#00bfff",        // 水色
    lineWidth: 2.5,
    lineCap: "round" as CanvasLineCap,
  },
} as const;

/**
 * Mediapipeが推論した各関節の座標(x,y,z)データに基づいて骨格と関節を描画する
*/
export const drawPose = (
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[][], // 検出された人物ごとの関節の座標データ配列
  canvasWidth: number,
  canvasHeight: number
): void => {
  // キャンバス全体をリフレッシュする
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Mediapipeが推論した各関節データに基づいて骨格と関節を描画する
  for (const poseLandmarks of landmarks) {
    ctx.strokeStyle = DRAW_STYLE.bone.color;
    ctx.lineWidth = DRAW_STYLE.bone.lineWidth;
    ctx.lineCap = DRAW_STYLE.bone.lineCap;

    /* 
      対応する間接同士を線をつなぐことで骨格を描画する
      POSE_CONNECTIONS: 関節同士の連結対応リスト
    */
    for (const { start, end } of PoseLandmarker.POSE_CONNECTIONS) {
      const startLandmark = poseLandmarks[start];
      const endLandmark = poseLandmarks[end];

      /* 
        関節が画面外にある場合は描画をスキップする
        visibility: その関節が映像内に映っているかの信頼度（0〜1）
      */
      if (
        !startLandmark ||
        !endLandmark ||
        (startLandmark.visibility ?? 1) < 0.3 ||
        (endLandmark.visibility ?? 1) < 0.3
      ) {
        continue;
      }

      // Mediapipeが推論した間接の座標データ(x,y,z)をCanvas上のピクセル座標(x,y)へ変換する
      // 始点(x,y)
      const startX = startLandmark.x * canvasWidth;
      const startY = startLandmark.y * canvasHeight;
      // 終点(x,y)
      const endX = endLandmark.x * canvasWidth;
      const endY = endLandmark.y* canvasHeight;

      // 直線を描画する
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // 関節を描画する
    for (const landmark of poseLandmarks) {
      // 関節が画面外にある場合は描画をスキップ
      if ((landmark.visibility ?? 1) < 0.3) continue;

      // Mediapipeが推論した間接の座標データをCanvas上のピクセル座標へ変換する
      const x = landmark.x * canvasWidth;
      const y = landmark.y * canvasHeight;

      // 円を描画する
      ctx.beginPath();
      ctx.arc(x, y, DRAW_STYLE.joint.radius, 0, 2 * Math.PI);
      ctx.fillStyle = DRAW_STYLE.joint.fillColor;
      ctx.fill();
      ctx.strokeStyle = DRAW_STYLE.joint.strokeColor;
      ctx.lineWidth = DRAW_STYLE.joint.lineWidth;
      ctx.stroke();
    }
  }
};