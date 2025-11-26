import React, { useEffect, useRef, useState } from "react";
import supabase from "../supabaseClient";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// Figure out if we can embed the URL and how
function getEmbedConfig(rawUrl) {
  if (!rawUrl) return null;

  try {
    const trimmed = rawUrl.trim();
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    // ---------- SPOTIFY ----------
    if (host.includes("open.spotify.com")) {
      const embedPath = "/embed" + url.pathname; // /embed/track/... /embed/playlist/...
      const search = url.search || "";
      return {
        url: `https://open.spotify.com${embedPath}${search}`,
        provider: "Spotify",
      };
    }

    // ---------- APPLE MUSIC ----------
    if (host.includes("music.apple.com")) {
      const search = url.search || "";
      return {
        url: `https://embed.music.apple.com${url.pathname}${search}`,
        provider: "Apple Music",
      };
    }

    // ---------- SOUNDCLOUD ----------
    if (host.includes("soundcloud.com")) {
      const encoded = encodeURIComponent(trimmed);
      return {
        url: `https://w.soundcloud.com/player/?url=${encoded}&auto_play=false`,
        provider: "SoundCloud",
      };
    }

    // ---------- YOUTUBE / YOUTUBE MUSIC ----------
    if (
      host.includes("youtube.com") ||
      host === "youtu.be" ||
      host.includes("music.youtube.com")
    ) {
      let videoId = null;

      if (host === "youtu.be") {
        videoId = url.pathname.slice(1).split("/")[0];
      } else {
        if (url.searchParams.get("v")) {
          videoId = url.searchParams.get("v");
        } else if (url.pathname.startsWith("/embed/")) {
          videoId = url.pathname.split("/")[2];
        } else if (url.pathname.startsWith("/shorts/")) {
          videoId = url.pathname.split("/")[2];
        }
      }

      if (videoId) {
        let embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const list = url.searchParams.get("list");
        if (list) {
          embedUrl += `?list=${list}`;
        }
        return {
          url: embedUrl,
          provider: "YouTube",
        };
      }
    }

    // Anything else: we don't know how to embed
    return null;
  } catch (e) {
    console.warn("Bad streaming URL:", rawUrl);
    return null;
  }
}

const MeditationTimer = ({ onTimerComplete, userId }) => {
  const [duration, setDuration] = useState(10 * 60);
  const [remaining, setRemaining] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const [localAudioUrl, setLocalAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const [streamingUrl, setStreamingUrl] = useState("");
  const [showStreamingPlayer, setShowStreamingPlayer] = useState(false);
  const [embedUrl, setEmbedUrl] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState("");

  // UX flags
  const [usedStreaming, setUsedStreaming] = useState(false);
  const [providerName, setProviderName] = useState("");
  const [timeUp, setTimeUp] = useState(false);

  const chimeRef = useRef(null);

  const saveMeditationSession = async (durationSeconds) => {
    if (!userId) return;
    const { error } = await supabase.from("meditation_sessions").insert([
      {
        user_id: userId,
        duration_seconds: durationSeconds,
      },
    ]);
    if (error) console.error("Error saving meditation session:", error);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsRunning(false);
            setTimeUp(true);

            // 🔔 Finishing chime
            if (chimeRef.current) {
              const chime = chimeRef.current;
              chime.currentTime = 0;
              chime.volume = 1;
              chime.play().catch(() => {});
            }

            // 📳 Optional vibration on supported devices
            if (typeof window !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate(250);
            }

            // ⏹ Pause & reset LOCAL audio we control
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }

            // 💾 Save session + notify parent
            saveMeditationSession(duration);
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
  }, [isRunning, onTimerComplete, duration, userId]);

  const handlePreset = (min) => {
    const sec = min * 60;
    setDuration(sec);
    setRemaining(sec);
    setIsRunning(false);
    setTimeUp(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleStartPause = () => {
    setIsRunning((prev) => {
      const next = !prev;

      // starting fresh → clear "time up" banner
      if (!prev && next) {
        setTimeUp(false);
      }

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
    setTimeUp(false);
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

  const handleShowStreamingPlayer = () => {
    const trimmed = streamingUrl.trim();
    if (!trimmed) return;

    const config = getEmbedConfig(trimmed);

    setUsedStreaming(true);
    setTimeUp(false); // starting a new streaming session

    if (config) {
      // We know how to embed this one
      setEmbedUrl(config.url);
      setShowStreamingPlayer(true);
      setProviderName(config.provider);
      setStreamingMessage(`Playing from ${config.provider}.`);
    } else {
      // Can't embed – open in new tab & show message
      window.open(trimmed, "_blank", "noopener,noreferrer");
      setEmbedUrl(null);
      setShowStreamingPlayer(false);
      setProviderName("");
      setStreamingMessage(
        "This site can’t be embedded here, opening in a new tab instead."
      );
    }
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-2xl border bg-[#f3e8ff] border-[#d8c7f5] shadow-md p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-700">
          Meditation Timer
        </h2>
        <p className="text-5xl font-mono font-bold text-gray-800">
          {formatTime(remaining)}
        </p>
      </div>

      {/* Presets + custom */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {[5, 10, 15, 20, 30].map((m) => (
            <button
              key={m}
              onClick={() => handlePreset(m)}
              className="px-3 py-1.5 text-sm rounded-full border border-[#d8c7f5] text-gray-700 hover:bg-[#e9d9ff] transition"
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
              setTimeUp(false);
            }}
            className="w-20 px-2 py-1 border border-[#d8c7f5] rounded-md bg-white/80 focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder={Math.floor(duration / 60).toString()}
          />
          <span>min</span>
        </div>
      </div>

      {/* Start / Reset */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleStartPause}
          className={`px-5 py-2 rounded-full text-white text-sm font-medium transition ${
            isRunning
              ? "bg-purple-400 hover:bg-purple-500"
              : "bg-purple-500 hover:bg-purple-600"
          }`}
        >
          {isRunning ? "Pause" : "Start"}
        </button>

        <button
          onClick={handleReset}
          className="px-5 py-2 rounded-full border border-[#d8c7f5] text-gray-700 hover:bg-[#e9d9ff]"
        >
          Reset
        </button>
      </div>

      {/* Local audio */}
      <div className="border-t border-[#d8c7f5] pt-4 space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Local Audio
        </p>

        <label
          htmlFor="local-audio-upload"
          className="inline-block px-4 py-2 rounded-full bg-white border border-[#d8c7f5] text-gray-700 text-sm cursor-pointer shadow-sm hover:bg-[#e9d9ff] transition"
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
          <audio
            ref={audioRef}
            src={localAudioUrl}
            controls
            className="w-full mt-2"
          />
        )}
      </div>

      {/* Streaming links */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Spotify / Apple / SoundCloud / YouTube / Others
        </p>

        <input
          type="url"
          value={streamingUrl}
          onChange={(e) => setStreamingUrl(e.target.value)}
          placeholder="Paste a music URL"
          className="w-full px-3 py-2 text-sm rounded-md border border-[#d8c7f5] bg-white/80 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />

        <button
          onClick={handleShowStreamingPlayer}
          className="px-3 py-1.5 text-xs rounded-full border border-[#d8c7f5] text-gray-700 hover:bg-[#e9d9ff]"
        >
          Show Player
        </button>

        {streamingMessage && (
          <p className="text-[11px] text-gray-600 mt-1">{streamingMessage}</p>
        )}

        {showStreamingPlayer && embedUrl && (
          <iframe
            src={embedUrl}
            className="w-full mt-2 rounded-lg border border-[#d8c7f5]"
            style={{ minHeight: "152px" }}
            allow="autoplay; encrypted-media; fullscreen; clipboard-write"
            loading="lazy"
            title="Meditation music"
          />
        )}
      </div>

      {/* Time's up helper for external music */}
      {timeUp && usedStreaming && (
        <div className="mt-3 text-xs text-purple-900 bg-purple-100 border border-purple-200 rounded-md px-3 py-2">
          Time&apos;s up — take a breath and pause your music
          {providerName ? ` in ${providerName}.` : " in your music app."}
        </div>
      )}

      {/* 🔔 Chime audio – make sure the file exists in public/sounds */}
      <audio
        ref={chimeRef}
        src="sounds/meditation-chime.mp3"
        preload="auto"
      />
    </div>
  );
};

export default MeditationTimer;
