import React, { useEffect, useRef, useState } from "react";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

const MeditationTimer = ({ onTimerComplete }) => {
  const [duration, setDuration] = useState(10 * 60);
  const [remaining, setRemaining] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const [localAudioUrl, setLocalAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const [streamingUrl, setStreamingUrl] = useState("");
  const [showStreamingPlayer, setShowStreamingPlayer] = useState(false);

  const chimeRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsRunning(false);

            if (chimeRef.current) {
              chimeRef.current.currentTime = 0;
              chimeRef.current.play().catch(() => {});
            }

            if (audioRef.current) {
              audioRef.current.pause();
            }

            if (onTimerComplete) {
              onTimerComplete();
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, onTimerComplete]);

  const handlePreset = (min) => {
    const sec = min * 60;
    setDuration(sec);
    setRemaining(sec);
    setIsRunning(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleStartPause = () => {
    setIsRunning((prev) => {
      const next = !prev;

      if (!prev && next && audioRef.current && localAudioUrl) {
        audioRef.current.play().catch(() => {});
      }

      if (prev && !next && audioRef.current) {
        audioRef.current.pause();
      }

      return next;
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(duration);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleLocalAudioChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLocalAudioUrl(url);
  };

  const handleStreamingUrlApply = () => {
    setShowStreamingPlayer(Boolean(streamingUrl.trim()));
  };

  return (
    <div className="
      max-w-md w-full mx-auto rounded-2xl border 
      bg-[#f3e8ff] border-[#d8c7f5] 
      shadow-md p-6 space-y-6
    ">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-700">Meditation Timer</h2>
        <p className="text-5xl font-mono font-bold text-gray-800">
          {formatTime(remaining)}
        </p>
      </div>

      {/* Presets + Custom */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {[5, 10, 15, 20, 30].map((m) => (
            <button
              key={m}
              onClick={() => handlePreset(m)}
              className="
                px-3 py-1.5 text-sm rounded-full 
                border border-[#d8c7f5] 
                text-gray-700 
                hover:bg-[#e9d9ff] 
                transition
              "
            >
              {m} min
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
          <span>Custom:</span>
          <input
            type="number"
            min="1"
            max="120"
            onChange={(e) => {
              const minutes = Number(e.target.value) || 0;
              const sec = minutes * 60;
              setDuration(sec);
              setRemaining(sec);
              setIsRunning(false);
            }}
            className="
              w-20 px-2 py-1 
              border border-[#d8c7f5] rounded-md
              bg-white/80 
              focus:outline-none focus:ring-2 focus:ring-purple-300
            "
            placeholder={Math.floor(duration / 60).toString()}
          />
          <span>min</span>
        </div>
      </div>

      {/* Start / Reset */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleStartPause}
          className={`
            px-5 py-2 rounded-full text-white text-sm font-medium
            transition
            ${isRunning 
              ? "bg-purple-400 hover:bg-purple-500" 
              : "bg-purple-500 hover:bg-purple-600"
            }
          `}
        >
          {isRunning ? "Pause" : "Start"}
        </button>

        <button
          onClick={handleReset}
          className="
            px-5 py-2 rounded-full 
            border border-[#d8c7f5] 
            text-gray-700 
            hover:bg-[#e9d9ff]
          "
        >
          Reset
        </button>
      </div>

      {/* Local Audio */}
      <div className="border-t border-[#d8c7f5] pt-4 space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Local Audio
        </p>

        {/* Custom Choose File Button */}
        <label
          htmlFor="local-audio-upload"
          className="
            inline-block 
            px-4 py-2 
            rounded-full 
            bg-white 
            border border-[#d8c7f5]
            text-gray-700 
            text-sm 
            cursor-pointer 
            shadow-sm
            hover:bg-[#e9d9ff] 
            transition
          "
        >
          Choose Audio File
        </label>

        <input
          id="local-audio-upload"
          type="file"
          accept="audio/*"
          onChange={handleLocalAudioChange}
          className="hidden"
        />

        {localAudioUrl && (
          <audio ref={audioRef} src={localAudioUrl} controls className="w-full mt-2" />
        )}
      </div>

      {/* Streaming */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Spotify / Apple / Pandora
        </p>

        <input
          type="url"
          value={streamingUrl}
          onChange={(e) => setStreamingUrl(e.target.value)}
          placeholder="Paste a music URL"
          className="
            w-full px-3 py-2 text-sm 
            rounded-md 
            border border-[#d8c7f5] 
            bg-white/80 
            focus:outline-none focus:ring-2 focus:ring-purple-300
          "
        />

        <button
          onClick={handleStreamingUrlApply}
          className="
            px-3 py-1.5 text-xs 
            rounded-full border border-[#d8c7f5] 
            text-gray-700 
            hover:bg-[#e9d9ff]
          "
        >
          Show Player
        </button>

        {showStreamingPlayer && streamingUrl && (
          <iframe
            src={streamingUrl}
            className="w-full mt-2 rounded-lg border border-[#d8c7f5]"
            style={{ minHeight: "80px" }}
            allow="autoplay; encrypted-media"
            title="Meditation music"
          />
        )}
      </div>

      <audio ref={chimeRef} src="/sounds/meditation-chime.mp3" preload="auto" />
    </div>
  );
};

export default MeditationTimer;
