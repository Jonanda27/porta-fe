"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  LogOut,
  UserCog,
  LucideIcon,
} from "lucide-react";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: LucideIcon | React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string | number | React.ReactNode;
  exact?: boolean;
  active?: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
}

export interface SidebarNavGroup {
  title?: string;
  items: SidebarNavItem[];
}

export interface AppSidebarProps {
  portalTitle: string;
  portalSubtitle?: string;
  portalBadge?: string;
  rightBadge?: string;
  navGroups: SidebarNavGroup[];
  user: {
    name: string;
    roleOrStatus: string;
    initials?: string;
    statusVariant?: "emerald" | "amber" | "slate";
  };
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  brandIcon?: React.ReactNode;
  contextCard?: React.ReactNode;
  onOpenAccountSettings?: () => void;
  onLogout?: () => void;
  footerContent?: React.ReactNode;
}

export function AppSidebar({
  portalTitle,
  portalSubtitle,
  portalBadge,
  rightBadge,
  navGroups,
  user,
  isCollapsed,
  onToggleCollapse,
  brandIcon,
  contextCard,
  onOpenAccountSettings,
  onLogout,
  footerContent,
}: AppSidebarProps) {
  const pathname = usePathname();

  const userInitials =
    user.initials ||
    user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ||
    "PT";

  const isItemActive = (item: SidebarNavItem) => {
    if (typeof item.active === "boolean") return item.active;
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-20 min-w-[80px] max-w-[80px]" : "w-72 min-w-[288px] max-w-[288px]"
      } bg-white flex flex-col justify-between shrink-0 shadow-xs z-30 sticky top-0 h-screen transition-all duration-300 ease-in-out relative select-none`}
    >
      {/* Floating Circular Sidebar Toggle Button (Gambar 2 Reference: Clean Circular Button on Seam) */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="absolute right-0 top-[146px] translate-x-1/2 -translate-y-1/2 z-40 w-8 h-8 rounded-full bg-[#0B241E] hover:bg-[#133D31] text-white border border-[#235848] ring-2 ring-white/20 hover:border-[#D97706]/70 shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 group focus:outline-none"
        title={isCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
        aria-label={isCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight
            className="w-4 h-4 text-[#D97706] group-hover:translate-x-0.5 transition-transform"
            strokeWidth={2.5}
          />
        ) : (
          <ChevronLeft
            className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform"
            strokeWidth={2.5}
          />
        )}
      </button>

      {/* Main Container: Header + Profile + Navigation */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div
          className={`h-16 bg-[#0B241E] border-b border-[#143E33] flex items-center ${
            isCollapsed ? "justify-center px-2" : "justify-between gap-2 pl-5 pr-4"
          } text-white shrink-0`}
        >
          {isCollapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-lg bg-[#143E33] hover:bg-[#1E5748] p-1.5 flex items-center justify-center border border-[#1E5748] cursor-pointer transition-colors"
              title="Buka Menu"
            >
              {brandIcon || (
                <img
                  src="/brand/symbol-white.svg"
                  alt="PORTA"
                  className="w-full h-full object-contain"
                />
              )}
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-[#143E33] p-1 flex items-center justify-center border border-[#1E5748] shrink-0">
                  {brandIcon || (
                    <img
                      src="/brand/symbol-white.svg"
                      alt="PORTA"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-extrabold text-base tracking-wide text-white shrink-0">
                      PORTA
                    </span>
                    {portalBadge && (
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#D97706]/20 text-[#D97706] border border-[#D97706]/30 uppercase tracking-wider truncate"
                        title={portalBadge}
                      >
                        {portalBadge}
                      </span>
                    )}
                  </div>
                  <span className="block text-[11px] text-[#85A69B] -mt-0.5 truncate">
                    {portalSubtitle || portalTitle}
                  </span>
                </div>
              </div>

              {rightBadge && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono bg-[#143E33] text-[#D97706] border border-[#1E5748] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                    {rightBadge}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Optional Context Card (e.g. Bank Papua RKUD, Pelabuhan Mimika) */}
        {!isCollapsed && contextCard && (
          <div className="border-b border-[#F1F5F9]">{contextCard}</div>
        )}

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto border-r border-[#E2E8F0] py-2.5 pb-4 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* User Identity Box */}
          {isCollapsed ? (
            <div className="pt-1 pb-5 flex flex-col items-center justify-center">
              <div
                className="w-10 h-10 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs border border-[#164336] cursor-pointer hover:scale-105 transition-transform"
                title={`${user.name} (${user.roleOrStatus})`}
                onClick={onToggleCollapse}
              >
                {userInitials}
              </div>
            </div>
          ) : (
            <div className="p-2.5 ml-3 mr-4 mb-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-2.5 shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-[#0B241E] text-[#D97706] flex items-center justify-center font-bold text-xs shrink-0 border border-[#164336]">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#0B241E] truncate" title={user.name}>
                  {user.name}
                </p>
                <p className="text-[10.5px] text-[#64748B] truncate mt-0.5 flex items-center gap-1.5">
                  {user.statusVariant && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${
                        user.statusVariant === "emerald"
                          ? "bg-emerald-500"
                          : user.statusVariant === "amber"
                          ? "bg-amber-500"
                          : "bg-slate-400"
                      }`}
                    />
                  )}
                  <span className="truncate" title={user.roleOrStatus}>
                    {user.roleOrStatus}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Nav Groups & Links */}
          <div className={isCollapsed ? "px-2 space-y-1.5" : "px-3 space-y-3"}>
            {navGroups.map((group, gIdx) => (
              <div key={group.title || gIdx} className="space-y-0.5">
                {!isCollapsed && group.title && (
                  <p className="px-3 text-[9.5px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                    {group.title}
                  </p>
                )}

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);

                  if (item.disabled) {
                    const tooltipText =
                      item.disabledTooltip || `${item.label} — Menunggu Verifikasi Petugas`;
                    return (
                      <div
                        key={item.href}
                        title={tooltipText}
                        aria-disabled="true"
                        className={`transition-all flex items-center cursor-not-allowed select-none opacity-55 ${
                          isCollapsed
                            ? "w-11 h-11 mx-auto rounded-xl justify-center text-[#94A3B8] bg-[#F8FAFC]/80"
                            : "w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold justify-between gap-2.5 text-[#94A3B8] bg-[#F8FAFC]/60"
                        }`}
                      >
                        {isCollapsed ? (
                          <div className="relative flex items-center justify-center">
                            <Icon className="w-5 h-5 shrink-0 text-[#94A3B8]" />
                            <Lock className="w-2.5 h-2.5 text-amber-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <Icon className="w-4 h-4 shrink-0 text-[#94A3B8]" />
                              <span className="truncate">{item.label}</span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Terkunci</span>
                            </span>
                          </>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`transition-all flex items-center cursor-pointer group relative ${
                        isCollapsed
                          ? `w-11 h-11 mx-auto rounded-xl justify-center ${
                              active
                                ? "bg-[#0B241E] text-[#D97706] shadow-xs"
                                : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                            }`
                          : `w-full text-left px-3 py-2 rounded-xl text-xs font-semibold justify-between gap-2.5 ${
                              active
                                ? "bg-[#0B241E] text-white shadow-xs font-bold"
                                : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B241E]"
                            }`
                      }`}
                    >
                      {isCollapsed ? (
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-colors ${
                            active
                              ? "text-[#D97706]"
                              : "text-[#64748B] group-hover:text-[#0B241E]"
                          }`}
                        />
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                active
                                  ? "text-[#D97706]"
                                  : "text-[#64748B] group-hover:text-[#0B241E]"
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <div className="shrink-0">
                              {typeof item.badge === "string" || typeof item.badge === "number" ? (
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                    active
                                      ? "bg-[#143E33] text-[#D97706] border border-[#1E5748]"
                                      : "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]"
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              ) : (
                                item.badge
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Area */}
      {footerContent ? (
        <div className="p-3 border-t border-[#EDF2F7] border-r border-[#E2E8F0] bg-white shrink-0">
          {footerContent}
        </div>
      ) : (
        <div
          className={`p-2.5 border-t border-[#EDF2F7] border-r border-[#E2E8F0] bg-white shrink-0 flex flex-col gap-1 ${
            isCollapsed ? "items-center" : ""
          }`}
        >
          {onOpenAccountSettings && (
            <button
              type="button"
              onClick={onOpenAccountSettings}
              className={`rounded-xl text-xs font-semibold text-[#0B241E] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                isCollapsed ? "w-10 h-10 p-0" : "w-full py-1.5 px-3 justify-start"
              }`}
              title="Pengaturan Akun & Sandi"
            >
              <UserCog className="w-4 h-4 shrink-0 text-[#133D31]" />
              {!isCollapsed && <span className="truncate">Pengaturan Akun</span>}
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className={`rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                isCollapsed ? "w-10 h-10 p-0" : "w-full py-1.5 px-3 justify-start"
              }`}
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-4 h-4 shrink-0 text-rose-600" />
              {!isCollapsed && <span className="truncate">Keluar Akun</span>}
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
