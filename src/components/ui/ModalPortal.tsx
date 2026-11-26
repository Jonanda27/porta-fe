"use client";

import React from "react";
import { createPortal } from "react-dom";

/**
 * Merender modal langsung ke `document.body` agar tidak terpotong oleh
 * stacking context `<main>` maupun tertutup oleh navbar dan sidebar.
 */
export function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
