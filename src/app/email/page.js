
"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Mail, RefreshCw } from "lucide-react";

const HOSTINGER_INBOX =
  "https://mail.hostinger.com/0/mailboxes/INBOX";

export default function EmailPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const openHostinger = () => {
    window.open(
      HOSTINGER_INBOX,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
        
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ec3737] text-white">
              <Mail size={21} />
            </div>

            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Domain Email
              </h1>

              <p className="text-xs text-gray-500">
                Hostinger Mail Inbox
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshPage}
              className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={openHostinger}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#ec3737] px-4 text-sm font-semibold text-white transition hover:bg-[#d92f2f]"
            >
              <ExternalLink size={16} />
              Open Mail
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-[1600px]">
          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[70vh] items-center justify-center rounded-2xl border border-gray-200 bg-white">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#ec3737]" />

                <p className="text-sm text-gray-500">
                  Loading Mail...
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Browser-style top bar */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>

                <div className="max-w-[70%] flex-1 px-4">
                  <div className="mx-auto flex h-9 max-w-[700px] items-center rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-500">
                    <span className="truncate">
                      {HOSTINGER_INBOX}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openHostinger}
                  className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  <ExternalLink size={14} />
                  <span className="hidden md:inline">
                    Open
                  </span>
                </button>
              </div>

              {/* Mail area */}
              <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
                  <Mail
                    size={38}
                    className="text-[#ec3737]"
                  />
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Your Domain Email
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Open your Hostinger mailbox to view your
                  inbox, emails, attachments, replies and
                  other mailbox folders.
                </p>

                <button
                  type="button"
                  onClick={openHostinger}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ec3737] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d92f2f]"
                >
                  <Mail size={18} />
                  Open Hostinger Inbox
                  <ExternalLink size={16} />
                </button>

                <p className="mt-4 text-xs text-gray-400">
                  Hostinger Mail
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
