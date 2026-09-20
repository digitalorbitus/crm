import React from "react";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn">
      <div className="flex flex-col items-center justify-center">
        {/* Animated Spinner */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          {/* Outer Glow Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-[#ec3737]/20 animate-ping" />

          {/* Spinning Ring */}
          <div className="h-12 w-12 rounded-full border-4 border-[#ec3737]/20 border-t-[#ec3737] animate-spin" />
        </div>

        {/* Loading Text */}
        {/* {text && (
          <p className="mt-4 text-sm font-semibold tracking-wide text-white drop-shadow">
            {text}
          </p>
        )} */}
      </div>
    </div>
  );
}