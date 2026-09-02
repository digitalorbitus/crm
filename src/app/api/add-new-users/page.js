"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Upload,
  CheckCircle2,
  Loader2,
  X,
  Menu,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function AddUserPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image states
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null); // File store karne ke liye

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "agent",
    team: "Sales",
    status: "Active",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image select handle karne wala function
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file); // Raw file ko save kar rahe hain
      setAvatarPreview(URL.createObjectURL(file)); // Display preview
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setIsSubmitting(true);

    const data = new FormData();

    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("role", formData.role);
    data.append("team", formData.team);
    data.append("status", formData.status);
    data.append("password", formData.password);

    // Avatar
    const avatarInput = document.getElementById("avatar-file");

    if (avatarInput?.files?.[0]) {
      data.append("avatar", avatarInput.files[0]);
    }

    const response = await fetch("/api/new-users", {
      method: "POST",
      body: data,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create user");
    }

    alert("User added successfully!");

    router.push("/users");
    router.refresh();

  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    alert(error.message || "Something went wrong");
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 relative">
      {/* MOBILE HEADER */}
      <header className="lg:hidden h-16 bg-[#050B1E] border-b border-slate-800 flex items-center justify-between px-4 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 p-[2px] flex items-center justify-center">
            <div className="w-full h-full bg-[#050B1E] rounded-full flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500 flex items-center justify-center" />
            </div>
          </div>
          <span className="font-extrabold text-xl text-white">CallCRM</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-300 hover:bg-white/10"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* SIDEBAR */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
        {/* BACK BUTTON & HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add New User</h1>
              <p className="text-xs text-slate-400 font-medium">
                Dashboard &gt; Users &gt; <span className="text-slate-600">Add New User</span>
              </p>
            </div>
          </div>
        </div>

        {/* FORM CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-900 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base">User Information</h2>
              <p className="text-xs text-slate-400">Fill in the details to create a new team member account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* AVATAR UPLOAD */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="relative w-16 h-16 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserPlus size={24} className="text-slate-400" />
                )}
              </div>
              <div>
                <label htmlFor="avatar-file" className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5">
                  <Upload size={14} />
                  <span>Upload Profile Photo</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">Recommended format: PNG, JPG (Max 2MB)</p>
                <input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* FORM FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Ahmed Khan"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="ahmed@callcrm.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-semibold text-slate-700"
                >
                  <option value="agent">Agent</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Team *</label>
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-semibold text-slate-700"
                >
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.push("/users")}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-2 transition disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Save User</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}