"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Pengalihan Rute Terpadu:
 * Pendaftaran Tenant kini dipusatkan di Single Entry Point (/register?type=tenant)
 */
export default function RegisterTenantRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register?type=tenant");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#071914] text-white flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-300 font-medium font-sans">
          Mengalihkan ke Portal Pendaftaran Terpadu PORTA...
        </p>
      </div>
    </div>
  );
}
