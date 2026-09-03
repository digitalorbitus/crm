import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
hello
    </div>
  );
}








// "use client";

// import { useState } from "react";
// import CrmWelcome from "../components/CrmWelcome";
// import Login from "../app/login/page";

// export default function Home() {
//   const [showLogin, setShowLogin] = useState(false);

//   if (showLogin) {
//     return <Login />;
//   }

//   return (
//     <CrmWelcome
//       onLogin={() => setShowLogin(true)}
//     />
//   );
// }