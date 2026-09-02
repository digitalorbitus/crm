"use client";

import { MessageCircle } from "lucide-react";

export default function CRMLoader({
  subtitle = "",
  message = "",
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center">

        {/* Icon */}
        <div className="relative w-16 h-16 mb-5">
          <div className="absolute inset-0 rounded-2xl bg-blue-600/20 animate-ping" />

          <div className="relative w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <MessageCircle
              size={28}
              className="text-white animate-pulse"
            />
          </div>
        </div>

        {/* CRM */}
        <h2 className="text-xl font-black tracking-tight text-slate-900">
          CRM
        </h2>

        {/* Subtitle */}
        <p className="mt-1 text-sm font-medium text-slate-500">
          {subtitle}
        </p>

        {/* Dots */}
        <div className="mt-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />

          <span
            className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />

          <span
            className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>

        {/* Loading text */}
        <p className="mt-3 text-xs text-slate-400">
          {message}
        </p>

      </div>
    </div>
  );
}