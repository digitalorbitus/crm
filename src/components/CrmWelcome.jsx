"use client";

import { PhoneCall, Users, BarChart3, ArrowRight } from "lucide-react";

export default function CrmWelcome({ onLogin }) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-6">
      <div className="w-full max-w-6xl">

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">

            {/* Left Side */}
            <div className="bg-[#111827] text-white p-10 md:p-14 flex flex-col justify-center">
              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-6">
                  <PhoneCall size={32} />
                </div>

                <p className="text-blue-400 font-semibold mb-3">
                  CRM CALL CENTER
                </p>

                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Manage Your Calls.
                  <br />
                  Grow Your Business.
                </h1>

                <p className="text-gray-400 mt-6 text-lg leading-relaxed">
                  Manage customers, calls, team members and sales
                  from one powerful CRM Call Center.
                </p>
              </div>

              <button
                onClick={onLogin}
                className="w-fit flex items-center gap-3 bg-blue-600 hover:bg-blue-700 transition px-7 py-4 rounded-xl font-semibold"
              >
                Login to CRM
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Right Side */}
            <div className="p-10 md:p-14 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">
                Everything in one place
              </h2>

              <p className="text-gray-500 mt-2 mb-8">
                Powerful tools for your call center team.
              </p>

              <div className="space-y-5">

                <div className="bg-white p-5 rounded-2xl shadow-sm flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <PhoneCall size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Call Management
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Track incoming and outgoing customer calls.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                    <Users size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Customer Management
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Keep all customer information organized.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <BarChart3 size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Reports & Analytics
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Monitor calls, sales and team performance.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          © 2026 CRM Call Center. All rights reserved.
        </p>

      </div>
    </main>
  );
}