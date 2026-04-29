"use client";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
const WASM_CDN_URL =
"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
/* 
  Mediapipe(PoseLandmarker)インスタンスの初期化・管理を行う
 */
export const usePoseLandmarker = () => {
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        // 画像、動画処理向けのWebAssembly(WASM)バイナリをロードする。
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN_URL);
        // PoseLandmarkerインスタンスを生成する。(学習済みモデルのURLと画像・映像処理に関する設定を指定する)
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL, //画像・動画処理を行うための学習済みモデルを指定
            delegate: "GPU", // 推論処理にGPUを使用する
          },
          runningMode: "VIDEO", //連続フレームを推論する
          numPoses: 1, // 検出する人数(最大値)

          // 推論処理にまつわる信頼度スコアの閾値（0.0〜1.0）←ぶっちゃけよくわかんない
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        if (!cancelled) {
          poseLandmarkerRef.current = poseLandmarker;
          setIsReady(true);
        }
      } catch (error) {
        console.error("PoseLandmarkerの初期化に失敗しました", error);
      }
    };
    init();
    return () => {
      cancelled = true;
      poseLandmarkerRef.current?.close(); //ロードしたWASMバイナリのメモリを解放する
      poseLandmarkerRef.current = null;
    };
  }, []);

  return { poseLandmarkerRef, isReady };
};
