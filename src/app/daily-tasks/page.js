"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Bell,
} from "lucide-react";

export default function DailyDeskComingSoon() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 h-16 bg-[#050B1E] border-b border-slate-800 flex items-center px-5 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 p-[2px] flex items-center justify-center">
            <div className="w-full h-full bg-[#050B1E] rounded-full flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500" />
            </div>
          </div>

          <span className="font-extrabold text-xl text-white tracking-tight">
            CallCRM
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-5xl">

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          {/* Main Card */}
          <div className="bg-white border border-slate-200 rounded-[32px] shadow-xl shadow-slate-200/50 overflow-hidden">

            {/* Top Gradient */}
            <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

            <div className="p-7 sm:p-10 lg:p-14">

              {/* Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold">
                  <Sparkles size={14} />
                  COMING SOON
                </div>
              </div>

              {/* Icon */}
              <div className="flex justify-center mt-7">
                <div className="relative">

                  <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-500/25">
                    <CalendarDays
                      size={43}
                      className="text-white"
                      strokeWidth={1.7}
                    />
                  </div>

                  <div className="absolute -right-3 -bottom-3 w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-lg flex items-center justify-center">
                    <Clock3
                      size={19}
                      className="text-blue-600"
                    />
                  </div>

                </div>
              </div>

              {/* Heading */}
              <div className="text-center mt-8">
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  Daily Desk
                </h1>

                <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-slate-500 leading-7">
                  Your daily command center for managing tasks, calls,
                  schedules, team activity and productivity — all in one place.
                </p>
              </div>

              {/* Progress */}
              <div className="max-w-xl mx-auto mt-9">

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">
                    Development Progress
                  </span>

                  <span className="text-xs font-black text-blue-600">
                    75%
                  </span>
                </div>

                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                </div>

                <p className="text-[11px] text-slate-400 text-center mt-3">
                  We're polishing the experience before launch.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">

                {/* Feature 1 */}
                <div className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <CheckCircle2 size={19} />
                  </div>

                  <h3 className="mt-4 font-bold text-sm text-slate-800">
                    Daily Tasks
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-400">
                    Organize and manage your daily work with ease.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <BarChart3 size={19} />
                  </div>

                  <h3 className="mt-4 font-bold text-sm text-slate-800">
                    Productivity
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-400">
                    Track daily performance and team productivity.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 transition">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Bell size={19} />
                  </div>

                  <h3 className="mt-4 font-bold text-sm text-slate-800">
                    Smart Reminders
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-400">
                    Never miss an important task or scheduled activity.
                  </p>
                </div>

              </div>

              {/* Bottom */}
              <div className="mt-10 pt-7 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">

                <div className="text-center sm:text-left">
                  <p className="text-sm font-bold text-slate-800">
                    Something powerful is coming.
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Daily Desk will be available soon.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-5 py-2.5 rounded-xl bg-[#050B1E] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition"
                >
                  <ArrowLeft size={15} />
                  Back to Dashboard
                </button>

              </div>

            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-slate-400 mt-5">
            CallCRM • Daily Desk
          </p>

        </div>
      </main>
    </div>
  );
}