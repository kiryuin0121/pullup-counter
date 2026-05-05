"use client";

import { useEffect, useRef } from "react";
import { usePullUpStore } from "@/store/pullUpStore";
import { AnimatePresence, motion } from "motion/react";
import { countdown, speak } from "@/lib/counter";

const UI = () => {
  const { count, start, reset, isRunning } = usePullUpStore();
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (count === 0) return;
    if (count !== prevCountRef.current) {
      speak(count.toString());
      prevCountRef.current = count;
    }
  }, [count]);

  const handleStart = async () => {
    if (isRunning) return;
    await countdown();
    start();
  };

  const handleReset = () => {
    reset();
    prevCountRef.current = 0;
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.03, cursor: "grabbing" }}
      className="absolute top-12 right-10  origin-top-left z-11 cursor-grab scale-110"
    >
      <div className="relative inline-block group">
  
        <div className="relative z-10 bg-sky-400 text-white px-8 pt-6 pb-5 rounded-[45px] shadow-xl min-w-60 border-[3px] border-sky-300 select-none">


          <div className="relative h-15 flex items-center justify-center overflow-hidden text-[#1a2e1a] bg-[#568746] rounded-2xl mb-4 border-2 border-[#4a723c]">
           
            <div
              className="absolute inset-0 pointer-events-none z-20 opacity-30"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px)",
              }}
            />

            <div className="absolute text-4xl font-digital opacity-50" style={{ color: "#3d6030" }}>
              88
            </div>

            <AnimatePresence mode="popLayout">
              <motion.div
                key={count}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.05 }}
                className="translate-x-1/2 relative text-4xl font-digital z-10 drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]"
              >
                {count}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-3 relative z-20 font-mPlus">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="cursor-pointer flex-1 p-3 bg-blue-50 text-sky-600 text-xs rounded-xl transition-all duration-75 relative border-b-2 border-slate-300 active:translate-y-0.5 active:border-b-0 active:shadow-inner disabled:opacity-50 disabled:translate-y-0.5 disabled:border-b-0 disabled:shadow-inner disabled:cursor-default"
            >
              スタート
            </button>

            <button
              onClick={handleReset}
              className="cursor-pointer flex-1 p-3 bg-sky-700/80 text-blue-50 text-xs rounded-xl transition-all duration-75 border-b-2 border-sky-900/50  active:translate-y-0.5 active:border-b-0 active:shadow-inner"
            >
              リセット
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UI;