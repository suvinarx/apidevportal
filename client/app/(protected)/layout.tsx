// client/app/(protected)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getUserRole } from "@/lib/auth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const role = getUserRole();

    // Redirect if not authenticated
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    // Admin route check
    if (pathname.startsWith("/admin") && role !== "admin") {
      router.replace("/");
    }

    // User route check
    if (pathname === "/" && role !== "user") {
      router.replace("/admin");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
