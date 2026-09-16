
// "use client";

// import {
//   PhoneCall,
//   ArrowRight,
//   ShieldCheck,
//   Users,
//   BarChart3,
// } from "lucide-react";

// export default function CrmWelcome({ onLogin }) {
//   return (
//     <main className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-6 relative overflow-hidden">

//       {/* Background decoration */}
//       <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl" />
//       <div className="absolute bottom-[-250px] right-[-150px] w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl" />

//       {/* Main Content */}
//       <div className="relative z-10 w-full max-w-2xl text-center">

//         {/* CRM Logo */}
//         <div className="flex justify-center mb-8">
//           <div className="relative">

//             {/* Glow */}
//             <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full scale-150" />

//             {/* Logo Box */}
//             <div className="relative w-24 h-24 rounded-[28px] bg-[#111827] flex items-center justify-center shadow-2xl shadow-slate-900/20">

//               <PhoneCall
//                 size={42}
//                 strokeWidth={1.8}
//                 className="text-white"
//               />

//               {/* Small status dot */}
//               <span className="absolute bottom-2 right-2 w-4 h-4 bg-blue-500 border-4 border-[#111827] rounded-full" />

//             </div>
//           </div>
//         </div>


//         {/* Brand */}
//         <div className="mb-3">
//           <p className="text-sm font-semibold tracking-[0.25em] uppercase text-blue-600">
//             CRM Call Center
//           </p>
//         </div>


//         {/* Welcome Heading */}
//         <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#111827]">
//           Welcome to your
//           <br />
//           <span className="text-blue-600">
//             CRM Workspace
//           </span>
//         </h1>


//         {/* Description */}
//         <p className="max-w-xl mx-auto mt-6 text-base md:text-lg leading-8 text-gray-500">
//           Manage your customers, calls, team members and business
//           performance from one powerful and professional platform.
//         </p>


//         {/* Login Button */}
//         <div className="flex justify-center mt-9">
//           <button
//             onClick={onLogin}
//             className="group flex items-center gap-3 bg-[#111827] hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-base shadow-xl shadow-gray-900/10 hover:shadow-blue-600/20 transition-all duration-300"
//           >
//             Login to CRM

//             <ArrowRight
//               size={20}
//               className="group-hover:translate-x-1 transition-transform"
//             />
//           </button>
//         </div>


//         {/* Features */}
//         <div className="flex flex-wrap justify-center items-center gap-8 mt-14 text-sm text-gray-500">

//           <div className="flex items-center gap-2">
//             <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
//               <PhoneCall size={17} />
//             </div>
//             <span>Call Management</span>
//           </div>


//           <div className="hidden sm:block w-px h-7 bg-gray-200" />


//           <div className="flex items-center gap-2">
//             <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
//               <Users size={17} />
//             </div>
//             <span>Customer Management</span>
//           </div>


//           <div className="hidden sm:block w-px h-7 bg-gray-200" />


//           <div className="flex items-center gap-2">
//             <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
//               <BarChart3 size={17} />
//             </div>
//             <span>Reports & Analytics</span>
//           </div>

//         </div>


//         {/* Bottom Security */}
//         <div className="flex justify-center items-center gap-2 mt-12 text-xs text-gray-400">
//           <ShieldCheck size={16} />
//           Secure CRM Environment
//           <span className="mx-1">•</span>
//           © 2026 CRM Call Center
//         </div>

//       </div>
//     </main>
//   );
// }




"use client";

import Image from "next/image";

export default function CRMLoader({
  subtitle = "Customer Relationship Management",
  // message = "Loading your workspace...",
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f]">

      {/* Lightweight background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-blue-600/10" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-600/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">

        {/* Logo */}
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 shadow-xl">
          <Image
            src="/uploads/CRM-LOGO-removebg-preview.png"
            alt="CallCRM"
            width={64}
            height={64}
            priority
            loading="eager"
            className="h-full w-full object-contain"
          />
        </div>

        {/* Brand */}
        <h1 className="text-2xl font-black tracking-tight text-white">
           Digital Orbitus
        </h1>

        {/* Subtitle */}
        {/* {subtitle && (
          <p className="mt-1.5 text-xs font-medium text-slate-400">
            {subtitle}
          </p>
        )} */}

        {/* Fast loading dots */}
        <div className="mt-6 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-delay:100ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-delay:200ms]" />
        </div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-6 left-0 right-0 z-10 text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-600">
          Digital Orbitus
        </p>
      </div>
    </div>
  );
}