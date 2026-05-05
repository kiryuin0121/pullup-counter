"use client";

import { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { usePoseLandmarker } from "@/hooks/usePoseLandmarker";
import { drawPose } from "@/lib/drawPose";
import { usePullUpStore } from "@/store/pullUpStore";
import { analyzePullUp } from "@/lib/analyzePullUp";

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  facingMode: "user",
};

const MIRROR_STYLE = { transform: "scaleX(-1)" } as const;

const PoseDetector = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const { poseLandmarkerRef, isReady } = usePoseLandmarker();
  const update = usePullUpStore(state=>state.update);

  const detect = useCallback(() => {
    const scheduleNext = () => {
      animationFrameIdRef.current = requestAnimationFrame(detect); //ここのエラーは放置でok
    };

    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const poseLandmarker = poseLandmarkerRef.current;

    // 必要なリソースが揃っていなければ次フレームで再試行
    if (
      !video ||
      !canvas ||
      !ctx ||
      !poseLandmarker ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      /* 
      readyState
      HAVE_NOTHING(0)      : データなし
      HAVE_METADATA(1)     : duration・サイズは判明
      HAVE_CURRENT_DATA(2) : 現在フレームのみあり
      HAVE_FUTURE_DATA(3)  : 次フレームも再生可能
      HAVE_ENOUGH_DATA(4)  : 十分なバッファがある
    */
      scheduleNext();
      return;
    }

    // Canvas の内部解像度を video の実際の解像度に合わせる
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    //Mediapipe(PoseLandmarker)による人体の関節位置の推論結果を取得する
    const result = poseLandmarker.detectForVideo(video, performance.now()); 

    // 推論結果に基づいてcanvasに描画処理を行う
    if (result.landmarks.length > 0) {
      // 骨格、関節を描画
      drawPose(ctx, result.landmarks, canvas.width, canvas.height);
      update(analyzePullUp(result.landmarks[0]));
    } else {
      // 人体が検出されなかった場合はcanvas全体をリフレッシュ
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    scheduleNext();
  }, [poseLandmarkerRef]);

  useEffect(() => {
    // MediaPipe の準備ができてからループを開始する
    if (!isReady) return;

    animationFrameIdRef.current = requestAnimationFrame(detect);

    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isReady, detect]);

  return (
    <div className="relative inline-block">
      {/* Webカメラで撮影している映像 */}
      <Webcam
        ref={webcamRef}
        videoConstraints={VIDEO_CONSTRAINTS}
        mirrored
        className="block rounded-lg"
      />

      {/* 人体の骨格、間接を描画するためのcanvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
        style={MIRROR_STYLE}
      />

      {/* ローディング */}
      {!isReady && (
        <div className="absolute inset-0 w-screen h-screen flex items-center justify-center bg-black/60 rounded-lg">
          <p className="text-white text-sm font-medium animate-pulse">
            Now loading...
          </p>
        </div>
      )}
    </div>
  );
};
export default PoseDetector;
