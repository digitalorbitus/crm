"use client"

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          My CRM
        </h1>

        <p className="mb-6 text-gray-500">
          Connect your Zoom account to get started.
        </p>

        <a
          href="/api/zoom/auth"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
        >
          Connect Zoom
        </a>
        
      </div>
    </main>
  );
}