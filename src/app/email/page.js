
"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Mail,
  RefreshCw,
  Send,
  LogOut,
  Search,
  ChevronLeft,
  Inbox,
  Loader2,
  AlertCircle,
  Paperclip,
  Download,
  X,
  Reply,
  Forward,
  User,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";

export default function EmailPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingInbox, setLoadingInbox] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const [search, setSearch] = useState("");

  const [composeOpen, setComposeOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [downloading, setDownloading] = useState(null);

  const [emailContextMenu, setEmailContextMenu] = useState(null);

  const [compose, setCompose] = useState({
    to: "",
    subject: "",
    message: "",
  });

  // =========================================================
  // RESTORE LOGIN
  // =========================================================

  useEffect(() => {
    try {
      const savedEmail = sessionStorage.getItem("crm_email");
      const savedPassword = sessionStorage.getItem(
        "crm_email_password"
      );

      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setLoggedIn(true);
      }
    } catch {}
  }, []);

  // =========================================================
  // LOAD INBOX AFTER LOGIN
  // =========================================================

  useEffect(() => {
    if (loggedIn && email && password) {
      loadInbox();
    }
  }, [loggedIn]);

  // =========================================================
  // CLOSE CONTEXT MENU ON ESC / CLICK
  // =========================================================

  useEffect(() => {
    function closeMenu() {
      setEmailContextMenu(null);
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setEmailContextMenu(null);
      }
    }

    document.addEventListener("click", closeMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", closeMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // =========================================================
  // LOGIN
  // =========================================================

  async function login(e) {
    e?.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Email address and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/email/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Login failed. Please check your credentials."
        );
      }

      sessionStorage.setItem("crm_email", cleanEmail);
      sessionStorage.setItem(
        "crm_email_password",
        password
      );

      setEmail(cleanEmail);
      setLoggedIn(true);

      setSuccess("Login successful.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("EMAIL LOGIN:", err);

      setError(
        err?.message ||
          "Unable to login. Please check your Hostinger email credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // LOAD INBOX
  // =========================================================

  async function loadInbox() {
    if (!email || !password) return;

    setLoadingInbox(true);
    setError("");

    try {
      const response = await fetch("/api/email/inbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load inbox."
        );
      }

      setEmails(
        Array.isArray(data.emails)
          ? data.emails
          : []
      );
    } catch (err) {
      console.error("LOAD INBOX:", err);

      setError(
        err?.message || "Unable to load inbox."
      );
    } finally {
      setLoadingInbox(false);
    }
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  function logout() {
    try {
      sessionStorage.removeItem("crm_email");
      sessionStorage.removeItem(
        "crm_email_password"
      );
    } catch {}

    setEmail("");
    setPassword("");
    setLoggedIn(false);

    setEmails([]);
    setSelectedEmail(null);

    setComposeOpen(false);

    setError("");
    setSuccess("");

    setEmailContextMenu(null);
  }

  // =========================================================
  // DOWNLOAD ATTACHMENT
  // =========================================================

  async function downloadAttachment(file, index) {
    if (!selectedEmail) return;

    const downloadKey = `${selectedEmail.id}-${index}`;

    setDownloading(downloadKey);
    setError("");
    setSuccess("");

    try {
      const mailboxPassword =
        password ||
        sessionStorage.getItem(
          "crm_email_password"
        );

      if (!mailboxPassword) {
        throw new Error(
          "Email session expired. Please login again."
        );
      }

      const response = await fetch(
        "/api/email/attachment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password: mailboxPassword,
            uid: selectedEmail.id,
            attachmentIndex: index,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Unable to download attachment.";

        try {
          const data = await response.json();
          message = data.message || message;
        } catch {}

        throw new Error(message);
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error(
          "Downloaded attachment is empty."
        );
      }

      let filename =
        file?.filename || "attachment";

      const contentDisposition =
        response.headers.get(
          "Content-Disposition"
        );

      if (contentDisposition) {
        const utfMatch =
          contentDisposition.match(
            /filename\*=UTF-8''([^;]+)/i
          );

        const normalMatch =
          contentDisposition.match(
            /filename="([^"]+)"/i
          );

        if (utfMatch?.[1]) {
          try {
            filename = decodeURIComponent(
              utfMatch[1]
            );
          } catch {
            filename = utfMatch[1];
          }
        } else if (normalMatch?.[1]) {
          filename = normalMatch[1];
        }
      }

      const blobUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = blobUrl;
      link.download = filename;

      document.body.appendChild(link);

      link.click();

      link.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1500);

      setSuccess(
        "Attachment downloaded successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error(
        "DOWNLOAD ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to download attachment."
      );
    } finally {
      setDownloading(null);
    }
  }

  // =========================================================
  // DOWNLOAD CURRENT EMAIL
  // =========================================================

  function downloadCurrentEmail() {
    if (!selectedEmail) return;

    try {
      const subject =
        selectedEmail.subject ||
        "Email";

      const safeName =
        subject
          .replace(
            /[<>:"/\\|?*\x00-\x1F]/g,
            ""
          )
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 100) ||
        "Email";

      let content = "";

      let extension = "txt";

      let mime =
        "text/plain;charset=utf-8";

      if (selectedEmail.html) {
        extension = "html";

        mime =
          "text/html;charset=utf-8";

        content = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${escapeHtml(subject)}</title>
</head>
<body>
${selectedEmail.html}
</body>
</html>`;
      } else {
        content =
          selectedEmail.text ||
          "No email content.";
      }

      const blob = new Blob(
        [content],
        {
          type: mime,
        }
      );

      const blobUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = blobUrl;
      link.download = `${safeName}.${extension}`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1500);

      setEmailContextMenu(null);

      setSuccess(
        "Email downloaded successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error(
        "DOWNLOAD EMAIL:",
        err
      );

      setError(
        err?.message ||
          "Unable to download email."
      );
    }
  }

  // =========================================================
  // CONTEXT MENU
  // =========================================================

  function handleEmailContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 220;
    const menuHeight = 210;

    let x = e.clientX;
    let y = e.clientY;

    if (
      x + menuWidth >
      window.innerWidth
    ) {
      x =
        window.innerWidth -
        menuWidth -
        12;
    }

    if (
      y + menuHeight >
      window.innerHeight
    ) {
      y =
        window.innerHeight -
        menuHeight -
        12;
    }

    setEmailContextMenu({
      x: Math.max(10, x),
      y: Math.max(10, y),
    });
  }

  // =========================================================
  // COMPOSE
  // =========================================================

  function openCompose() {
    setCompose({
      to: "",
      subject: "",
      message: "",
    });

    setComposeOpen(true);

    setError("");
    setSuccess("");
  }

  // =========================================================
  // REPLY
  // =========================================================

  function replyToMail() {
    if (!selectedEmail) return;

    const replyTo =
      selectedEmail?.from ||
      selectedEmail?.fromName ||
      "";

    const subject =
      selectedEmail.subject || "";

    setCompose({
      to: replyTo,

      subject:
        subject
          .toLowerCase()
          .startsWith("re:")
          ? subject
          : `Re: ${subject}`,

      message: `


---------- Original Message ----------

${selectedEmail.text || ""}`,
    });

    setComposeOpen(true);

    setEmailContextMenu(null);
  }

  // =========================================================
  // FORWARD
  // =========================================================

  function forwardMail() {
    if (!selectedEmail) return;

    const subject =
      selectedEmail.subject || "";

    setCompose({
      to: "",

      subject:
        subject
          .toLowerCase()
          .startsWith("fwd:")
          ? subject
          : `Fwd: ${subject}`,

      message: `


---------- Forwarded Message ----------

From: ${selectedEmail.from || ""}

Date: ${
        selectedEmail.date
          ? formatDate(
              selectedEmail.date
            )
          : ""
      }

Subject: ${subject}

${selectedEmail.text || ""}`,
    });

    setComposeOpen(true);

    setEmailContextMenu(null);
  }

  // =========================================================
  // SEND EMAIL
  // =========================================================

  async function sendEmail() {
    if (!compose.to.trim()) {
      setError(
        "Recipient email is required."
      );

      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/email/send",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            to: compose.to.trim(),
            subject:
              compose.subject.trim(),
            message: compose.message,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to send email."
        );
      }

      setComposeOpen(false);

      setCompose({
        to: "",
        subject: "",
        message: "",
      });

      setSuccess(
        "Email sent successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "SEND EMAIL:",
        err
      );

      setError(
        err?.message ||
          "Unable to send email."
      );
    } finally {
      setSending(false);
    }
  }

  // =========================================================
  // FILTER EMAILS
  // =========================================================

  const filteredEmails = useMemo(() => {
    const q =
      search.trim().toLowerCase();

    if (!q) return emails;

    return emails.filter((item) => {
      return (
        String(
          item.subject || ""
        )
          .toLowerCase()
          .includes(q) ||
        String(
          item.from || ""
        )
          .toLowerCase()
          .includes(q) ||
        String(
          item.fromName || ""
        )
          .toLowerCase()
          .includes(q) ||
        String(
          item.text || ""
        )
          .toLowerCase()
          .includes(q)
      );
    });
  }, [emails, search]);

  // =========================================================
  // DATE
  // =========================================================

  function formatDate(value) {
    if (!value) return "";

    try {
      return new Intl.DateTimeFormat(
        "en-US",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      ).format(new Date(value));
    } catch {
      return String(value);
    }
  }

  // =========================================================
  // SAFE HTML
  // =========================================================

  function getEmailHtml(item) {
    if (item?.html) {
      return item.html;
    }

    const text =
      item?.text || "";

    return `
<div style="
  font-family:Arial,sans-serif;
  white-space:pre-wrap;
  line-height:1.6;
  word-break:break-word;
  overflow-wrap:anywhere;
  max-width:100%;
">
${escapeHtml(text)}
</div>
`;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }

  // =========================================================
  // LOGIN SCREEN
  // =========================================================

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f6f8]">
        <Sidebar />

        <main className="min-h-screen lg:pl-[260px]">
          <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ec3737] text-white shadow-lg">
                    <Mail size={30} />
                  </div>

                  <h1 className="text-2xl font-bold text-gray-900">
                    Hostinger Mail
                  </h1>

                  <p className="mt-2 text-sm text-gray-500">
                    Login to access your mailbox
                  </p>
                </div>

                {error && (
                  <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {error}
                    </span>
                  </div>
                )}

                {success && (
                  <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {success}
                  </div>
                )}

                <form
                  onSubmit={login}
                  className="space-y-5"
                >
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        placeholder="you@example.com"
                        className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#ec3737] focus:ring-4 focus:ring-red-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Password
                    </label>

                    <div className="relative">
                      <Mail
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                        placeholder="Enter your password"
                        className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-12 text-sm outline-none transition focus:border-[#ec3737] focus:ring-4 focus:ring-red-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (prev) =>
                              !prev
                          )
                        }
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        {showPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ec3737] px-5 font-semibold text-white shadow-md transition hover:bg-[#d92e2e] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Mail size={19} />
                        Login to Mail
                      </>
                    )}
                  </button>
                </form>

                {/* <div className="mt-6 text-center">
                  <a
                    href="https://support.hostinger.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#ec3737] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div> */}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // EMAIL APP
  // =========================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f6f8]">
      <Sidebar />

      <main className="min-h-screen min-w-0 lg:pl-[260px]">
        <div className="flex min-h-screen min-w-0 flex-col">
          {/* HEADER */}

          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
            <div className="flex min-h-[72px] min-w-0 flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ec3737] text-white">
                  <Mail size={21} />
                </div>

                <div className="min-w-0">
                  <h1 className="font-bold text-gray-900">
                    Email
                  </h1>

                  <p className="max-w-[180px] truncate text-xs text-gray-500 sm:max-w-none">
                    {email}
                  </p>
                </div>
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-2">
                <button
                  onClick={loadInbox}
                  disabled={loadingInbox}
                  className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={
                      loadingInbox
                        ? "animate-spin"
                        : ""
                    }
                  />

                  <span className="hidden sm:inline">
                    Refresh
                  </span>
                </button>

                <button
                  onClick={openCompose}
                  className="flex h-10 items-center gap-2 rounded-xl bg-[#ec3737] px-4 text-sm font-semibold text-white hover:bg-[#d92e2e]"
                >
                  <Send size={17} />

                  <span>
                    Compose
                  </span>
                </button>

                <button
                  onClick={logout}
                  title="Logout"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            {/* SEARCH */}

            <div className="border-t border-gray-100 px-4 py-3 sm:px-6">
              <div className="relative w-full max-w-xl">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search emails..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-[#ec3737] focus:bg-white focus:ring-4 focus:ring-red-50"
                />
              </div>
            </div>
          </header>

          {/* ALERTS */}

          <div className="px-4 pt-4 sm:px-6">
            {error && (
              <div className="mb-3 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span className="min-w-0 break-words">
                  {error}
                </span>

                <button
                  onClick={() =>
                    setError("")
                  }
                  className="ml-auto shrink-0"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {success && (
              <div className="mb-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {success}
              </div>
            )}
          </div>

          {/* EMAIL AREA */}

          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-4 sm:p-6 lg:flex-row">
            {/* INBOX */}

            <section
              className={`w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:w-[380px] lg:shrink-0 ${
                selectedEmail
                  ? "hidden lg:flex lg:flex-col"
                  : "flex flex-col"
              }`}
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 px-4">
                <div className="flex items-center gap-2">
                  <Inbox
                    size={19}
                    className="text-[#ec3737]"
                  />

                  <span className="font-semibold text-gray-900">
                    Inbox
                  </span>
                </div>

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  {filteredEmails.length}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loadingInbox &&
                emails.length === 0 ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2
                      size={26}
                      className="animate-spin text-[#ec3737]"
                    />
                  </div>
                ) : filteredEmails.length ===
                  0 ? (
                  <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                      <Inbox
                        size={25}
                        className="text-gray-400"
                      />
                    </div>

                    <p className="font-semibold text-gray-700">
                      No emails found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Your inbox is empty.
                    </p>
                  </div>
                ) : (
                  filteredEmails.map(
                    (item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          setSelectedEmail(
                            item
                          )
                        }
                        className={`block w-full min-w-0 border-b border-gray-100 px-4 py-4 text-left transition hover:bg-gray-50 ${
                          selectedEmail?.id ===
                          item.id
                            ? "bg-red-50/70"
                            : ""
                        } ${
                          !item.seen
                            ? "bg-white"
                            : "bg-gray-50/30"
                        }`}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                            <User size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-start justify-between gap-2">
                              <p
                                className={`min-w-0 truncate text-sm ${
                                  !item.seen
                                    ? "font-bold text-gray-900"
                                    : "font-medium text-gray-700"
                                }`}
                              >
                                {item.fromName ||
                                  item.from ||
                                  "Unknown sender"}
                              </p>

                              <span className="shrink-0 text-[10px] text-gray-400">
                                {item.date
                                  ? new Date(
                                      item.date
                                    ).toLocaleDateString()
                                  : ""}
                              </span>
                            </div>

                            <p
                              className={`mt-1 truncate text-sm ${
                                !item.seen
                                  ? "font-semibold text-gray-800"
                                  : "text-gray-600"
                              }`}
                            >
                              {item.subject ||
                                "(No subject)"}
                            </p>

                            <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-gray-400">
                              {item.text || ""}
                            </p>

                            {item.attachments
                              ?.length >
                              0 && (
                              <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-gray-500">
                                <Paperclip size={12} />

                                {
                                  item
                                    .attachments
                                    .length
                                }{" "}
                                attachment
                                {item.attachments
                                  .length !==
                                1
                                  ? "s"
                                  : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  )
                )}
              </div>
            </section>

            {/* EMPTY DETAIL */}

            {!selectedEmail && (
              <section className="hidden min-h-[500px] min-w-0 flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm lg:flex">
                <div className="px-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                    <Mail
                      size={30}
                      className="text-gray-400"
                    />
                  </div>

                  <h2 className="font-semibold text-gray-700">
                    Select an email
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Choose an email from your inbox to
                    read it.
                  </p>
                </div>
              </section>
            )}

            {/* MOBILE DETAIL */}

            {selectedEmail && (
              <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:hidden">
                <div className="border-b border-gray-100 px-4 py-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() =>
                        setSelectedEmail(
                          null
                        )
                      }
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      <ChevronLeft
                        size={18}
                      />
                      Back
                    </button>

                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={
                          replyToMail
                        }
                        className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Reply
                          size={16}
                        />

                        <span className="hidden sm:inline">
                          Reply
                        </span>
                      </button>

                      <button
                        onClick={
                          forwardMail
                        }
                        className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Forward
                          size={16}
                        />

                        <span className="hidden sm:inline">
                          Forward
                        </span>
                      </button>
                    </div>
                  </div>

                  <h2 className="break-words text-xl font-bold text-gray-900 sm:text-2xl">
                    {selectedEmail.subject ||
                      "(No subject)"}
                  </h2>

                  <div className="mt-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#ec3737]">
                      <User size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold text-gray-900">
                        {selectedEmail.fromName ||
                          selectedEmail.from ||
                          "Unknown sender"}
                      </p>

                      <p className="mt-0.5 break-all text-xs text-gray-500">
                        {selectedEmail.from}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar
                            size={13}
                          />

                          {formatDate(
                            selectedEmail.date
                          )}
                        </span>

                        {selectedEmail.to && (
                          <span className="break-all">
                            To:{" "}
                            {
                              selectedEmail.to
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className="min-w-0 p-4">
                    <div
                      className="min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-100 bg-white"
                      onContextMenu={
                        handleEmailContextMenu
                      }
                    >
                      {selectedEmail.html ? (
                        <iframe
                          title="Email content"
                          srcDoc={getEmailHtml(
                            selectedEmail
                          )}
                          className="block min-h-[450px] w-full max-w-full border-0"
                          sandbox=""
                        />
                      ) : (
                        <div className="whitespace-pre-wrap break-words p-4 text-sm leading-7 text-gray-700 sm:p-6">
                          {selectedEmail.text ||
                            "No email content."}
                        </div>
                      )}
                    </div>

                    {/* ATTACHMENTS */}

                    {selectedEmail.attachments
                      ?.length >
                      0 && (
                      <div className="mt-6 min-w-0">
                        <div className="mb-3 flex items-center gap-2">
                          <Paperclip
                            size={18}
                            className="text-[#ec3737]"
                          />

                          <h3 className="font-semibold text-gray-900">
                            Attachments
                          </h3>

                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            {
                              selectedEmail
                                .attachments
                                .length
                            }
                          </span>
                        </div>

                        <div className="grid min-w-0 grid-cols-1 gap-3">
                          {selectedEmail.attachments.map(
                            (
                              file,
                              index
                            ) => {
                              const key = `${selectedEmail.id}-${index}`;

                              const isDownloading =
                                downloading ===
                                key;

                              return (
                                <div
                                  key={`${file.filename}-${index}`}
                                  className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3"
                                >
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-[#ec3737] shadow-sm">
                                    <Paperclip
                                      size={
                                        19
                                      }
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p
                                      className="truncate text-sm font-semibold text-gray-800"
                                      title={
                                        file.filename
                                      }
                                    >
                                      {file.filename ||
                                        "Attachment"}
                                    </p>

                                    <p className="mt-0.5 text-xs text-gray-400">
                                      {formatFileSize(
                                        file.size
                                      )}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      downloadAttachment(
                                        file,
                                        index
                                      )
                                    }
                                    disabled={
                                      isDownloading
                                    }
                                    className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#ec3737] px-3 text-sm font-semibold text-white hover:bg-[#d92e2e] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isDownloading ? (
                                      <Loader2
                                        size={
                                          17
                                        }
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Download
                                        size={
                                          17
                                        }
                                      />
                                    )}

                                    <span className="hidden sm:inline">
                                      {isDownloading
                                        ? "Downloading..."
                                        : "Download"}
                                    </span>
                                  </button>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex flex-wrap gap-2 border-t border-gray-100 pt-5">
                      <button
                        onClick={
                          replyToMail
                        }
                        className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Reply
                          size={17}
                        />
                        Reply
                      </button>

                      <button
                        onClick={
                          forwardMail
                        }
                        className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Forward
                          size={17}
                        />
                        Forward
                      </button>

                      <button
                        onClick={
                          downloadCurrentEmail
                        }
                        className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Download
                          size={17}
                        />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* =====================================================
          COMPOSE MODAL
      ===================================================== */}

      {composeOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5">
          <div
            className="relative flex max-h-[calc(100dvh-24px)] w-full min-w-0 max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-40px)]"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#ec3737]">
                  <Send size={19} />
                </div>

                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900">
                    New Email
                  </h2>

                  <p className="truncate text-xs text-gray-500">
                    Send email from {email}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setComposeOpen(
                    false
                  )
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY */}

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-5 p-4 sm:p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    To
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      value={compose.to}
                      onChange={(e) =>
                        setCompose({
                          ...compose,
                          to: e.target.value,
                        })
                      }
                      placeholder="recipient@example.com"
                      className="h-12 w-full rounded-xl border border-gray-200 pl-10 pr-4 text-sm outline-none focus:border-[#ec3737] focus:ring-4 focus:ring-red-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Subject
                  </label>

                  <input
                    type="text"
                    value={
                      compose.subject
                    }
                    onChange={(e) =>
                      setCompose({
                        ...compose,
                        subject:
                          e.target.value,
                      })
                    }
                    placeholder="Email subject"
                    className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#ec3737] focus:ring-4 focus:ring-red-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Message
                  </label>

                  <textarea
                    value={
                      compose.message
                    }
                    onChange={(e) =>
                      setCompose({
                        ...compose,
                        message:
                          e.target.value,
                      })
                    }
                    placeholder="Write your message..."
                    className="min-h-[260px] w-full resize-y rounded-xl border border-gray-200 p-4 text-sm leading-6 outline-none focus:border-[#ec3737] focus:ring-4 focus:ring-red-50"
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
              <button
                onClick={() =>
                  setComposeOpen(
                    false
                  )
                }
                disabled={sending}
                className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={sendEmail}
                disabled={sending}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ec3737] px-6 text-sm font-semibold text-white hover:bg-[#d92e2e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DESKTOP FULL EMAIL MODAL
      ===================================================== */}

      {selectedEmail && (
        <div className="hidden lg:block">
          {/* BACKDROP */}

          <button
            type="button"
            className="fixed inset-0 z-[70] cursor-default bg-black/50 backdrop-blur-[2px]"
            onClick={() =>
              setSelectedEmail(null)
            }
            aria-label="Close email"
          />

          {/* MODAL */}

          <div className="pointer-events-none fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-4 lg:p-5">
            <div
              className="pointer-events-auto flex h-[calc(100dvh-24px)] w-full min-w-0 max-w-[1180px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:h-[calc(100dvh-32px)]"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* MODAL TOP */}

              <div className="flex min-w-0 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#ec3737]">
                    <Mail size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-400">
                      Email
                    </p>

                    <h2 className="break-words text-sm font-bold text-gray-900 sm:text-base">
                      {selectedEmail.subject ||
                        "(No subject)"}
                    </h2>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={
                      replyToMail
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 sm:h-10 sm:w-auto sm:gap-2 sm:px-3"
                    title="Reply"
                  >
                    <Reply size={17} />

                    <span className="hidden xl:inline">
                      Reply
                    </span>
                  </button>

                  <button
                    onClick={
                      forwardMail
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 sm:h-10 sm:w-auto sm:gap-2 sm:px-3"
                    title="Forward"
                  >
                    <Forward
                      size={17}
                    />

                    <span className="hidden xl:inline">
                      Forward
                    </span>
                  </button>

                  <button
                    onClick={
                      downloadCurrentEmail
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#ec3737] sm:h-10 sm:w-auto sm:gap-2 sm:px-3"
                    title="Download email"
                  >
                    <Download
                      size={17}
                    />

                    <span className="hidden xl:inline">
                      Download
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setSelectedEmail(
                        null
                      )
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 sm:h-10"
                    title="Close"
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              {/* EMAIL INFO */}

              <div className="shrink-0 min-w-0 border-b border-gray-100 px-4 py-4 sm:px-5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <User size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="break-words font-semibold text-gray-900">
                        {selectedEmail.fromName ||
                          "Unknown sender"}
                      </p>

                      <p className="break-all text-sm text-gray-500">
                        &lt;
                        {selectedEmail.from}
                        &gt;
                      </p>
                    </div>

                    <div className="mt-2 flex min-w-0 flex-wrap gap-x-5 gap-y-1 text-xs text-gray-400">
                      <span className="break-all">
                        To:{" "}
                        {selectedEmail.to ||
                          email}
                      </span>

                      <span>
                        {formatDate(
                          selectedEmail.date
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL CONTENT */}

              <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
                <div className="mx-auto w-full min-w-0 max-w-[1080px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7">
                  {/* EMAIL BODY */}

                  <div
                    className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-100 bg-white"
                    onContextMenu={
                      handleEmailContextMenu
                    }
                  >
                    {selectedEmail.html ? (
                      <iframe
                        title="Email message"
                        srcDoc={getEmailHtml(
                          selectedEmail
                        )}
                        className="block h-[55vh] min-h-[420px] w-full max-w-full border-0 sm:h-[58vh] lg:h-[60vh]"
                        sandbox=""
                      />
                    ) : (
                      <div className="max-w-full whitespace-pre-wrap break-words p-4 text-sm leading-7 text-gray-700 sm:p-6 lg:p-7">
                        {selectedEmail.text ||
                          "No email content."}
                      </div>
                    )}
                  </div>

                  {/* ATTACHMENTS */}

                  {selectedEmail.attachments
                    ?.length >
                    0 && (
                    <div className="mt-6 w-full min-w-0">
                      <div className="mb-3 flex items-center gap-2">
                        <Paperclip
                          size={19}
                          className="text-[#ec3737]"
                        />

                        <h3 className="font-bold text-gray-900">
                          Attachments
                        </h3>

                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                          {
                            selectedEmail
                              .attachments
                              .length
                          }
                        </span>
                      </div>

                      <div className="grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
                        {selectedEmail.attachments.map(
                          (
                            file,
                            index
                          ) => {
                            const key = `${selectedEmail.id}-${index}`;

                            const isDownloading =
                              downloading ===
                              key;

                            return (
                              <div
                                key={`${file.filename}-${index}`}
                                className="flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4"
                              >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#ec3737] shadow-sm">
                                  <Paperclip
                                    size={
                                      20
                                    }
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className="truncate text-sm font-bold text-gray-800"
                                    title={
                                      file.filename
                                    }
                                  >
                                    {file.filename ||
                                      "Attachment"}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-gray-400">
                                    {file.contentType ||
                                      "File"}{" "}
                                    •{" "}
                                    {formatFileSize(
                                      file.size
                                    )}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    downloadAttachment(
                                      file,
                                      index
                                    )
                                  }
                                  disabled={
                                    isDownloading
                                  }
                                  className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#ec3737] px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d92e2e] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isDownloading ? (
                                    <>
                                      <Loader2
                                        size={
                                          17
                                        }
                                        className="animate-spin"
                                      />

                                      <span className="hidden sm:inline">
                                        Downloading
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Download
                                        size={
                                          17
                                        }
                                      />

                                      <span className="hidden sm:inline">
                                        Download
                                      </span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* BOTTOM DOWNLOAD */}

                  <div className="mt-7 flex flex-wrap gap-2 border-t border-gray-100 pt-5">
                    <button
                      onClick={
                        replyToMail
                      }
                      className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Reply
                        size={17}
                      />
                      Reply
                    </button>

                    <button
                      onClick={
                        forwardMail
                      }
                      className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Forward
                        size={17}
                      />
                      Forward
                    </button>

                    <button
                      onClick={
                        downloadCurrentEmail
                      }
                      className="flex h-10 items-center gap-2 rounded-lg bg-[#ec3737] px-4 text-sm font-semibold text-white hover:bg-[#d92e2e]"
                    >
                      <Download
                        size={17}
                      />
                      Download Email
                    </button>
                  </div>

                  <div className="h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CUSTOM RIGHT CLICK MENU
      ===================================================== */}

      {emailContextMenu &&
        selectedEmail && (
          <div
            className="fixed z-[300] w-[220px] overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-2xl"
            style={{
              left: emailContextMenu.x,
              top: emailContextMenu.y,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={
                downloadCurrentEmail
              }
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-[#ec3737]"
            >
              <Download size={17} />
              <span>
                Download Email
              </span>
            </button>

            <button
              type="button"
              onClick={replyToMail}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <Reply size={17} />
              <span>
                Reply
              </span>
            </button>

            <button
              type="button"
              onClick={forwardMail}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <Forward size={17} />
              <span>
                Forward
              </span>
            </button>

            <div className="my-1 border-t border-gray-100" />

            <button
              type="button"
              onClick={() => {
                setEmailContextMenu(
                  null
                );

                setSelectedEmail(
                  null
                );
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              <X size={17} />
              <span>
                Close Email
              </span>
            </button>
          </div>
        )}
    </div>
  );
}

// =========================================================
// FILE SIZE
// =========================================================

function formatFileSize(bytes) {
  const size = Number(
    bytes || 0
  );

  if (!size) {
    return "Unknown size";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  if (
    size <
    1024 * 1024 * 1024
  ) {
    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    size /
    (1024 *
      1024 *
      1024)
  ).toFixed(1)} GB`;
}

