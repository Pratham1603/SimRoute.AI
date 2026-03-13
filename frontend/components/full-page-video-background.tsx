"use client";

import { useState } from "react";

/** Your autonomous vehicle perception video - place in frontend/public/ */
const VIDEO_SRCS = [
  "/Create_a_cinematic_AI_visualization_video_of_an_autonomous_vehicle_perception_system.____Scene_descr_seed2434143456.mp4",
  "/hero-perception.mp4", // fallback if you rename the file
];

/**
 * Full-page video background for SimRouteAI dashboard.
 * Fixed position, covers entire viewport, loops seamlessly.
 * Fallback gradient if video fails to load.
 */
export default function FullPageVideoBackground() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [srcIdx, setSrcIdx] = useState(0);
  const videoSrc = VIDEO_SRCS[srcIdx];

  const handleError = () => {
    if (srcIdx < VIDEO_SRCS.length - 1) {
      setSrcIdx((i) => i + 1);
    } else {
      setError(true);
    }
  };

  if (error) {
    return (
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-cyan-950/30 to-slate-950"
        aria-hidden
      />
    );
  }

  return (
    <>
      {/* Fallback gradient while loading */}
      <div
        className={`fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950 transition-opacity duration-1000 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      />
      {/* Video layer */}
      <div
        className={`fixed inset-0 -z-10 transition-opacity duration-1000 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <video
          key={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={() => setLoaded(true)}
          onError={handleError}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        {/* Dark overlay for readability */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950/80"
          aria-hidden
        />
        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)",
          }}
          aria-hidden
        />
      </div>
    </>
  );
}
