
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

// export default function LoginPage() {
//   const router = useRouter();
  
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
  
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     rememberMe: false,
//   });

//   // Login Handle Submit Logic
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMessage("");

//     try {
//       const response = await fetch("/api/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//           rememberMe: formData.rememberMe,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setErrorMessage(data.message || "Invalid credentials provided");
//         setLoading(false);
//         return;
//       }

//       // Success logic - Redirecting to Dashboard
//       router.push("/dashboard");
//     } catch (error) {
//       console.error("Login error:", error);
//       setErrorMessage("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8">
//       {/* Main Container */}
//       <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[650px]">
        
//         {/* Left Section (Hero / Dashboard Preview) */}
//         <div className="hidden lg:flex lg:col-span-5 bg-[#0B1536] p-8 flex-col justify-between relative overflow-hidden text-white">
//           {/* Background Decorative Patterns */}
//           <div className="absolute top-6 right-6 opacity-20 text-[#2563EB]">
//             <div className="grid grid-cols-3 gap-1.5">
//               {[...Array(9)].map((_, i) => (
//                 <div key={i} className="w-1.5 h-1.5 bg-current rounded-full"></div>
//               ))}
//             </div>
//           </div>
          
//           <div className="absolute bottom-6 left-6 opacity-20 text-[#2563EB]">
//             <div className="grid grid-cols-3 gap-1.5">
//               {[...Array(9)].map((_, i) => (
//                 <div key={i} className="w-1.5 h-1.5 bg-current rounded-full"></div>
//               ))}
//             </div>
//           </div>

//           {/* Logo Section */}
//           <div className="flex items-center gap-2.5 z-10">
//             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg">
//               <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin-slow"></div>
//             </div>
//             <span className="font-bold text-xl tracking-tight text-white">CallCRM</span>
//           </div>

//           {/* Hero Content */}
//           <div className="my-auto z-10 pt-6">
//             <h2 className="text-3xl font-extrabold mb-3 tracking-tight">
//               Welcome Back! 
//             </h2>
//             <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
//               Sign in to your account and continue to manage your calls and leads.
//             </p>

//             {/* Dashboard Mockup Image */}
//             <div className="relative mt-4 transform -rotate-1 hover:rotate-0 transition-transform duration-500 ease-out">
//               <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-25"></div>
//               <img
//                 src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
//                 alt="Dashboard Preview"
//                 className="relative rounded-xl border border-white/10 shadow-2xl w-full object-cover h-52"
//               />
//             </div>
//           </div>

//           {/* Footer Copyright */}
//           <div className="z-10 text-xs text-slate-400">
//             © 2025 CallCRM. All rights reserved.
//           </div>
//         </div>

//         {/* Right Section (Login Form) */}
//         <div className="lg:col-span-7 p-6 sm:p-10 md:p-14 flex flex-col justify-center bg-white">
//           <div className="max-w-md w-full mx-auto space-y-6">
            
//             {/* Form Header */}
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
//                 Login to Your Account
//               </h1>
//               <p className="text-slate-500 text-sm mt-1.5">
//                 Enter your credentials to access your dashboard
//               </p>
//             </div>

//             {/* Error Message Box */}
//             {errorMessage && (
//               <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
//                 {errorMessage}
//               </div>
//             )}

//             {/* Form Inputs */}
//             <form onSubmit={handleSubmit} className="space-y-5">
//               {/* Email Input */}
//               <div className="space-y-1.5">
//                 <label className="text-xs font-semibold text-slate-700">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
//                     <Mail size={18} />
//                   </div>
//                   <input
//                     type="email"
//                     required
//                     placeholder="Enter your email"
//                     value={formData.email}
//                     onChange={(e) =>
//                       setFormData({ ...formData, email: e.target.value })
//                     }
//                     className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200"
//                   />
//                 </div>
//               </div>

//               {/* Password Input */}
//               <div className="space-y-1.5">
//                 <label className="text-xs font-semibold text-slate-700">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
//                     <Lock size={18} />
//                   </div>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     required
//                     placeholder="Enter your password"
//                     value={formData.password}
//                     onChange={(e) =>
//                       setFormData({ ...formData, password: e.target.value })
//                     }
//                     className="w-full pl-10 pr-10 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>

//               {/* Remember Me & Forgot Password */}
//               {/* <div className="flex items-center justify-between text-xs pt-1">
//                 <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
//                   <input
//                     type="checkbox"
//                     checked={formData.rememberMe}
//                     onChange={(e) =>
//                       setFormData({ ...formData, rememberMe: e.target.checked })
//                     }
//                     className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
//                   />
//                   <span>Remember me</span>
//                 </label>
//                 <a
//                   href="#"
//                   className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all"
//                 >
//                   Forgot Password?
//                 </a>
//               </div> */}

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
//               >
//                 {loading ? (
//                   <Loader2 size={18} className="animate-spin" />
//                 ) : (
//                   <>
//                     <LogIn size={18} />
//                     <span>Login</span>
//                   </>
//                 )}
//               </button>
//             </form>

//             {/* Divider */}
//             {/* <div className="relative my-6">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-slate-200"></div>
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
//                   OR
//                 </span>
//               </div>
//             </div> */}

//             {/* Google Login Button */}
//             {/* <button
//               type="button"
//               className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-sm transition-all text-sm cursor-pointer"
//             >
//               <svg className="w-4 h-4" viewBox="0 0 24 24">
//                 <path
//                   fill="#4285F4"
//                   d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                 />
//                 <path
//                   fill="#34A853"
//                   d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                 />
//                 <path
//                   fill="#FBBC05"
//                   d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
//                 />
//                 <path
//                   fill="#EA4335"
//                   d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
//                 />
//               </svg>
//               <span>Login with Google</span>
//             </button> */}

//             {/* Signup Link */}
//             {/* <p className="text-center text-xs text-slate-500 pt-2">
//               Don't have an account?{" "}
//               <a
//                 href="#"
//                 className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
//               >
//                 Sign Up
//               </a>
//             </p> */}

//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import CRMLoader from "@/components/CRMLoader";
import Welcome from "@/components/CrmWelcome";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Login Handle Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Invalid credentials provided");
        setLoading(false);
        return;
      }

      // Hard navigation on successful login to fresh layout state
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

       useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 4000);
  
      return () => clearTimeout(timer);
    }, []);
  
    if (loading) {
      return < Welcome
       subtitle="messages"
          message="Loading dashboard..."
          />;
    }
  

  return (
    <div className="min-h-screen w-screen bg-white flex overflow-hidden">
      {/* Main Fullscreen Grid */}
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Section (Hero / Dashboard Preview - Full Height) */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#0B1536] p-12 flex-col justify-between relative overflow-hidden text-white min-h-screen">
          {/* Background Decorative Patterns */}
          <div className="absolute top-8 right-8 opacity-20 text-[#2563EB]">
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-current rounded-full" />
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-8 opacity-20 text-[#2563EB]">
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-current rounded-full" />
              ))}
            </div>
          </div>

          {/* Logo Section */}
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg">
              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin-slow" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              CallCRM
            </span>
          </div>

          {/* Hero Content */}
          <div className="my-auto z-10 max-w-lg">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">
              Welcome Back!
            </h2>
            <p className="text-slate-300 text-base leading-relaxed mb-8 font-normal">
              Sign in to your account and continue to manage your calls and leads.
            </p>

            {/* Dashboard Mockup Image */}
            <div className="relative mt-4 transform -rotate-1 hover:rotate-0 transition-transform duration-500 ease-out">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-30" />
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
                alt="Dashboard Preview"
                className="relative rounded-2xl border border-white/10 shadow-2xl w-full object-cover h-64"
              />
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="z-10 text-xs text-slate-400">
            © 2026 CallCRM. All rights reserved.
          </div>
        </div>

        {/* Right Section (Login Form - Full Height Centered) */}
        <div className="lg:col-span-7 p-6 sm:p-12 md:p-16 flex flex-col justify-center items-center bg-white min-h-screen">
          <div className="max-w-md w-full space-y-8">
            
            {/* Form Header */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Login to Your Account
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                Enter your credentials to access your dashboard
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-10 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer text-sm"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}