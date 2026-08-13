// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export function proxy(request) {
//   const token = request.cookies.get("token")?.value;
//   const pathname = request.nextUrl.pathname;

//   const isHome = pathname === "/";
//   const isDashboard = pathname.startsWith("/dashboard");
//   const isLogin = pathname === "/login";

//   let isAuthenticated = false;

//   if (token) {
//     try {
//       jwt.verify(token, process.env.JWT_SECRET);
//       isAuthenticated = true;
//     } catch {
//       isAuthenticated = false;
//     }
//   }

//   // Home route
//   if (isHome) {
//     if (isAuthenticated) {
//       return NextResponse.redirect(
//         new URL("/dashboard", request.url)
//       );
//     }

//     return NextResponse.redirect(
//       new URL("/login", request.url)
//     );
//   }

//   // Dashboard protected
//   if (isDashboard) {
//     if (!isAuthenticated) {
//       return NextResponse.redirect(
//         new URL("/login", request.url)
//       );
//     }

//     return NextResponse.next();
//   }

//   // Already logged-in user login page par na jaye
//   if (isLogin) {
//     if (isAuthenticated) {
//       return NextResponse.redirect(
//         new URL("/dashboard", request.url)
//       );
//     }

//     return NextResponse.next();
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", "/dashboard/:path*", "/login"],
// };

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const protectedRoutes = [
  "/dashboard",
  "/leads",
  "/Sidebar",
  "/calls",
  "/contacts",
  "/settings",
];

export function proxy(request) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  const isHome = pathname === "/";
  const isLogin = pathname === "/login";

  // Check protected routes
  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  let isAuthenticated = false;

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Home
  if (isHome) {
    return NextResponse.redirect(
      new URL(
        isAuthenticated ? "/dashboard" : "/login",
        request.url
      )
    );
  }

  // Protected routes
  if (isProtectedRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    return NextResponse.next();
  }

  // Login page
  if (isLogin) {
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/Sidebar",
    "/login",
    "/dashboard/:path*",
    "/leads/:path*",
    "/calls/:path*",
    "/contacts/:path*",
    "/settings/:path*",
  ],
};