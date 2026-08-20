"use client";

import dynamic from "next/dynamic";

const CinematicScene = dynamic(
  () => import("./cinematic-scene").then((module) => module.CinematicScene),
  {
    ssr: false,
    loading: () => (
      <>
        <div className="cinematic-fallback" aria-hidden="true" />
        <div className="cinematic-loader is-visible" aria-hidden="true">
          <div className="loader-copy">
            <span>FILMM/FORHER</span>
            <strong>000</strong>
          </div>
          <div className="loader-exposure" />
        </div>
      </>
    ),
  },
);

export function CinematicStage() {
  return <CinematicScene />;
}
