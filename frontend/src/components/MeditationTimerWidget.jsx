import React, { useState } from "react";
import MeditationTimer from "./MeditationTimer.jsx";

const MeditationTimerWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-6 right-6 
          z-[9999]
          h-20 w-20
          flex items-center justify-center
          rounded-full
          bg-transparent
          border-4 border-white
          shadow-lg
          text-5xl
          backdrop-blur-sm
          transition
          animate-pulse
          hover:scale-110
          hover:shadow-2xl
        "
      >
        🧘🏽‍♀️
      </button>

      <div
        className={`
          fixed inset-0 z-[10000] flex items-end sm:items-center justify-center
          transition
          ${open ? "pointer-events-auto" : "pointer-events-none"}
        `}
      >
        <div
          className={`
            absolute inset-0 bg-black/30 transition-opacity duration-200
            ${open ? "opacity-100" : "opacity-0"}
          `}
          onClick={() => setOpen(false)}
        />

        <div className="relative z-[10001] w-full sm:max-w-md mx-auto mb-4 sm:mb-10 px-4 sm:px-0">
          <div
            className={`
              relative transform transition-all duration-200
              ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
            `}
          >
            <button
              onClick={() => setOpen(false)}
              className="
                absolute -top-3 -right-3
                h-7 w-7 rounded-full
                bg-white shadow
                flex items-center justify-center
                text-xs font-bold text-gray-500 hover:bg-gray-100
                z-[10002]
              "
            >
              ✕
            </button>

            <MeditationTimer onTimerComplete={() => setOpen(true)} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MeditationTimerWidget;
