"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import {
  getHomeRouteForRole,
  isProtectedPortalPath,
  isRoleAllowedForPath,
} from "@/lib/route-guard";
import { PortaLoadingScreen } from "@/components/ui/PortaLoadingScreen";

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Penjaga rute sisi klien (Defense-in-Depth bersama Edge Middleware):
 * 1. Memblokir akses ke rute portal (/kapal, /bendahara, /upt, /dinas, /tenant) jika belum login.
 * 2. Memblokir akses lintas role (mis. OPERATOR_KAPAL tidak bisa membuka /bendahara/*).
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const isProtected = isProtectedPortalPath(pathname);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(!isProtected);

  useEffect(() => {
    if (!isProtected) {
      setIsAuthorized(true);
      return;
    }

    const token = AuthService.getStoredToken();
    const user = AuthService.getStoredUser();

    if (!token || !user) {
      setIsAuthorized(false);
      AuthService.logout();
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    AuthService.syncSessionCookies(token, user.role);

    if (!isRoleAllowedForPath(user.role, pathname)) {
      setIsAuthorized(false);
      router.replace(getHomeRouteForRole(user.role));
      return;
    }

    setIsAuthorized(true);
  }, [isProtected, pathname, router]);

  if (isProtected && !isAuthorized) {
    return (
      <PortaLoadingScreen
        variant="fullscreen"
        title="Memverifikasi Akses Portal..."
        subtitle="Memastikan sesi dan hak akses peran Anda"
      />
    );
  }

  return <>{children}</>;
}
