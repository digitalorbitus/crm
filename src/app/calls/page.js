"use client";
import Sidebar from "../../components/Sidebar";
import LogoutModal from "@/components/LogoutModal";
import React, {
  useState,
  useEffect,
   useMemo,
   useCallback,
  useRef,
} from "react";
import {
  Image as ImageIcon,
  Menu,
  Users,
  X,
  Phone,
  Video,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  CalendarDays,
  Activity,
} from "lucide-react";
export default function Home() {
  
    const [sidebarOpen, setSidebarOpen] = useState(false);
      const [loggingOut, setLoggingOut] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
   
     const handleConfirmLogout = async () => {
    setLoggingOut(true);

    try {
      localStorage.removeItem("crm_login_time");

      const response = await fetch("/api/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data?.message || "Logout failed");

        setLoggingOut(false);
        setShowLogoutModal(false);

        return;
      }

      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);

      alert(
        "Something went wrong during logout."
      );

      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };
  return (
   <main className="min-h-screen bg-[#F5F7FB] text-slate-900">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 h-16 bg-[#050B1E] border-b border-white/10 flex items-center justify-between px-4 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 p-[2px]">
            <div className="w-full h-full rounded-[10px] bg-[#050B1E] flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-rose-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
          </div>

          <span className="font-extrabold text-xl tracking-tight">
            CallCRM
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-slate-300 hover:bg-white/10 transition"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />

      {/* Main Content */}
      <div className="lg:ml-[260px] min-h-screen">
        {/* Top Bar */}
        <div className="hidden lg:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8">
          <div>
            <p className="text-sm text-slate-500">
              Workspace
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Integrations
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">
                System Online
              </span>
            </div>
          </div>
        </div>

        {/* Page */}
        <section className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-7xl">

            {/* Page Heading */}
            {/* <div className="mb-8">
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 mb-2">
                <Sparkles size={16} />
                <span>CRM Integrations</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
                Connect your tools
              </h2>

              <p className="mt-2 max-w-2xl text-sm sm:text-base leading-6 text-slate-500">
                Connect your favorite business tools with CallCRM and
                manage your customer communication from one powerful
                workspace.
              </p>
            </div> */}

            {/* Stats */}
            {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Phone size={19} className="text-indigo-600" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">
                    +12%
                  </span>
                </div>

                <p className="mt-4 text-2xl font-bold text-slate-900">
                  1,284
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Total Calls
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Users size={19} className="text-violet-600" />
                </div>

                <p className="mt-4 text-2xl font-bold text-slate-900">
                  482
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Active Contacts
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <CalendarDays size={19} className="text-amber-600" />
                </div>

                <p className="mt-4 text-2xl font-bold text-slate-900">
                  36
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Meetings
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Activity size={19} className="text-emerald-600" />
                </div>

                <p className="mt-4 text-2xl font-bold text-slate-900">
                  98.4%
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  System Uptime
                </p>
              </div>
            </div> */}

            {/* Zoom Integration Card */}
            <div className="relative overflow-hidden rounded-3xl bg-[#050B1E] shadow-xl">
              {/* Background decorations */}
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
              <div className="absolute -left-20 -bottom-28 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

              <div className="relative p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                  {/* Left */}
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                        <Video
                          size={28}
                          strokeWidth={2.2}
                          className="text-[#2D8CFF]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-bold text-white">
                            Zoom
                          </h3>

                          <span className="rounded-full bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                            AVAILABLE
                          </span>
                        </div>

                        <p className="text-sm text-slate-400 mt-1">
                          Video meetings & team communication
                        </p>
                      </div>
                    </div>

                    <h4 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                      Bring your Zoom meetings directly
                      into your CRM.
                    </h4>

                    <p className="mt-4 text-sm sm:text-base leading-7 text-slate-400 max-w-xl">
                      Connect your Zoom account to create meetings,
                      manage schedules, access meeting information and
                      keep your customer communication organized in one
                      place.
                    </p>

                    <div className="mt-6 grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 text-sm text-slate-300">
                        <CheckCircle2
                          size={17}
                          className="text-emerald-400"
                        />
                        Create Zoom meetings
                      </div>

                      <div className="flex items-center gap-2.5 text-sm text-slate-300">
                        <CheckCircle2
                          size={17}
                          className="text-emerald-400"
                        />
                        Sync meeting details
                      </div>

                      <div className="flex items-center gap-2.5 text-sm text-slate-300">
                        <CheckCircle2
                          size={17}
                          className="text-emerald-400"
                        />
                        Manage schedules
                      </div>

                      <div className="flex items-center gap-2.5 text-sm text-slate-300">
                        <CheckCircle2
                          size={17}
                          className="text-emerald-400"
                        />
                        Secure OAuth connection
                      </div>
                    </div>
                  </div>

                  {/* Right CTA */}
                  <div className="lg:min-w-[300px]">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm p-5">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="flex -space-x-2">
                          <div className="w-9 h-9 rounded-full bg-indigo-500 border-2 border-[#11182d]" />
                          <div className="w-9 h-9 rounded-full bg-rose-500 border-2 border-[#11182d]" />
                          <div className="w-9 h-9 rounded-full bg-emerald-500 border-2 border-[#11182d]" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-white">
                            Ready to connect?
                          </p>
                          <p className="text-xs text-slate-500">
                            Takes less than a minute
                          </p>
                        </div>
                      </div>
<a
  href="/api/zoom/auth"
  target="_blank"
  rel="noopener noreferrer"
  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#050B1E] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-xl"
>
  <Video size={18} />

  <span>Connect Zoom</span>

  <ArrowRight
    size={17}
    className="transition-transform duration-200 group-hover:translate-x-1"
  />
</a>
                      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                        <ShieldCheck size={14} />
                        Secure OAuth authentication
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <ShieldCheck
                    size={18}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Your connection is secure
                  </p>

                  <p className="text-xs text-slate-500">
                    We use OAuth. Your Zoom password is never stored.
                  </p>
                </div>
              </div>

              <span className="text-xs font-medium text-slate-400">
                CallCRM Integrations
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        show={showLogoutModal}
        loggingOut={loggingOut}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </main>
  );
}