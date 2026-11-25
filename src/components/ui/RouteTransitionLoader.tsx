"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PortaLoadingScreen } from "./PortaLoadingScreen";

const ROUTE_LOADING_EVENT = "porta:route-loading";

interface RouteLoadingEventDetail {
  active: boolean;
  title?: string;
}

/**
 * Helper opsional untuk memicu loading screen secara manual saat berpindah halaman via router.push()
 */
export function triggerRouteLoading(title?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<RouteLoadingEventDetail>(ROUTE_LOADING_EVENT, {
      detail: { active: true, title },
    })
  );
}

export function stopRouteLoading(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<RouteLoadingEventDetail>(ROUTE_LOADING_EVENT, {
      detail: { active: false },
    })
  );
}

function getContextualLoadingTitle(targetPath: string): string {
  const path = targetPath.toLowerCase();
  if (path.includes("/dashboard")) return "Memuat Dashboard...";
  if (path.includes("/profil")) return "Membuka Profil & Master Kapal...";
  if (path.includes("/dermaga")) return "Memuat Direktori Dermaga...";
  if (path.includes("/pks-sandar")) return "Membuka Kontrak PKS Sandar...";
  if (path.includes("/permohonan")) return "Membuka Pengajuan Dermaga...";
  if (path.includes("/riwayat")) return "Memuat Riwayat Pelayanan...";
  if (path.includes("/sewa-ruangan") || path.includes("/sewa"))
    return "Membuka Katalog Ruangan & Aset...";
  if (path.includes("/kontrak-sewa") || path.includes("/kontrak"))
    return "Membuka Kontrak Sewa (PKS)...";
  if (path.includes("/manifes")) return "Membuka Pelaporan Manifes SOLAS...";
  if (path.includes("/penagihan") || path.includes("/tagihan") || path.includes("/skrd"))
    return "Memuat Tagihan e-SKRD...";
  if (path.includes("/keberatan")) return "Membuka Keberatan & Teguran...";
  if (path.includes("/notifikasi")) return "Memuat Pusat Notifikasi...";
  if (path.includes("/verifikasi")) return "Membuka Antrean Verifikasi...";
  if (path.includes("/alokasi")) return "Membuka Alokasi Dermaga...";
  if (path.includes("/login")) return "Menyiapkan Halaman Login...";
  if (path.includes("/register")) return "Menyiapkan Registrasi Mitra...";
  return "Memuat Halaman...";
}

function RouteTransitionLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [loadingTitle, setLoadingTitle] = useState<string>("Memuat Halaman...");

  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayShownAtRef = useRef<number>(0);

  const clearTimers = () => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const beginLoading = (title?: string) => {
    clearTimers();
    setLoadingTitle(title || "Memuat Halaman...");
    setIsNavigating(true);

    // Tampilkan overlay estetik apabila perpindahan halaman memiliki jeda > 110ms
    delayTimerRef.current = setTimeout(() => {
      overlayShownAtRef.current = Date.now();
      setShowOverlay(true);
    }, 110);

    // Safety fallback agar tidak pernah tersangkut bila navigasi dibatalkan
    safetyTimerRef.current = setTimeout(() => {
      setIsNavigating(false);
      setShowOverlay(false);
    }, 8000);
  };

  const endLoading = () => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }

    setIsNavigating(false);

    if (overlayShownAtRef.current > 0) {
      const elapsed = Date.now() - overlayShownAtRef.current;
      const minVisibleMs = 240;
      const remaining = Math.max(0, minVisibleMs - elapsed);
      hideTimerRef.current = setTimeout(() => {
        setShowOverlay(false);
        overlayShownAtRef.current = 0;
      }, remaining);
    } else {
      setShowOverlay(false);
    }
  };

  // Akhiri loading secara otomatis setiap kali route/query selesai berpindah
  const searchStr = searchParams?.toString();
  const routeKey = `${pathname}${searchStr ? `?${searchStr}` : ""}`;
  const lastPathQueryRef = useRef(routeKey);
  useEffect(() => {
    lastPathQueryRef.current = routeKey;
    endLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const hrefAttr = anchor.getAttribute("href");
      if (
        !hrefAttr ||
        hrefAttr.startsWith("#") ||
        hrefAttr.startsWith("mailto:") ||
        hrefAttr.startsWith("tel:") ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.href);
        if (nextUrl.origin !== window.location.origin) return;

        const currentFull = `${window.location.pathname}${window.location.search}`;
        const nextFull = `${nextUrl.pathname}${nextUrl.search}`;
        if (currentFull === nextFull) return;

        beginLoading(getContextualLoadingTitle(nextUrl.pathname));
      } catch {
        // Abaikan URL tidak valid
      }
    };

    const handleCustomEvent = (event: Event) => {
      const custom = event as CustomEvent<RouteLoadingEventDetail>;
      if (custom.detail?.active) {
        beginLoading(custom.detail.title);
      } else {
        endLoading();
      }
    };

    const handlePopState = () => {
      const nextKey = `${window.location.pathname}${window.location.search}`;
      if (nextKey === lastPathQueryRef.current) return;
      beginLoading("Memuat Halaman...");
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener(ROUTE_LOADING_EVENT, handleCustomEvent);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener(ROUTE_LOADING_EVENT, handleCustomEvent);
      window.removeEventListener("popstate", handlePopState);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Top Sleek Maritime Progress Bar (langsung aktif begitu klik navigasi) */}
      {isNavigating && (
        <div
          aria-hidden="true"
          className="fixed top-0 inset-x-0 z-[10000] h-[3px] bg-[#0B241E]/25 overflow-hidden pointer-events-none"
        >
          <div className="h-full w-2/5 bg-gradient-to-r from-[#D97706] via-[#FBBF24] to-emerald-400 animate-porta-shimmer shadow-[0_0_10px_rgba(217,119,6,0.8)]" />
        </div>
      )}

      {/* Full Esthetic Overlay (muncul bila ada jeda transisi > 110ms) */}
      {showOverlay && (
        <PortaLoadingScreen variant="overlay" title={loadingTitle} />
      )}
    </>
  );
}

export function RouteTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <RouteTransitionLoaderInner />
    </Suspense>
  );
}
