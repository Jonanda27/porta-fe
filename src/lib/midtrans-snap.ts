export interface MidtransSnapResult {
  status_code?: string;
  status_message?: string;
  transaction_id?: string;
  order_id?: string;
  gross_amount?: string;
  payment_type?: string;
  transaction_time?: string;
  transaction_status?: string;
  fraud_status?: string;
  finish_redirect_url?: string;
}

export interface MidtransSnapCallbacks {
  onSuccess?: (result: MidtransSnapResult) => void;
  onPending?: (result: MidtransSnapResult) => void;
  onError?: (result: MidtransSnapResult) => void;
  onClose?: () => void;
}

export interface MidtransSnapEmbedOptions extends MidtransSnapCallbacks {
  embedId: string;
}

interface MidtransSnapGlobal {
  pay: (snapToken: string, callbacks?: MidtransSnapCallbacks) => void;
  embed?: (snapToken: string, options: MidtransSnapEmbedOptions) => void;
  hide?: () => void;
}

export function hideMidtransSnap(): void {
  if (typeof window === "undefined") return;
  try {
    window.snap?.hide?.();
  } catch {
    // Ignore if Snap is not currently in PopupInView state
  }
}

declare global {
  interface Window {
    snap?: MidtransSnapGlobal;
  }
}

const SNAP_SCRIPT_ID = "midtrans-snap-script";

function resolveSnapScriptUrl(isProduction: boolean): string {
  return isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

function resolveClientKey(explicitClientKey?: string | null): string | null {
  const candidate =
    explicitClientKey?.trim() ||
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.trim() ||
    "";
  return candidate.length > 0 ? candidate : null;
}

function resolveIsProduction(explicitIsProduction?: boolean): boolean {
  if (typeof explicitIsProduction === "boolean") {
    return explicitIsProduction;
  }
  return process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
}

export function loadMidtransSnapScript(options?: {
  clientKey?: string | null;
  isProduction?: boolean;
}): Promise<MidtransSnapGlobal> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Midtrans Snap hanya dapat dimuat di browser."));
  }

  if (window.snap) {
    return Promise.resolve(window.snap);
  }

  const clientKey = resolveClientKey(options?.clientKey);
  if (!clientKey) {
    return Promise.reject(
      new Error("MIDTRANS_CLIENT_KEY belum dikonfigurasi."),
    );
  }

  const isProduction = resolveIsProduction(options?.isProduction);
  const scriptSrc = resolveSnapScriptUrl(isProduction);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SNAP_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.src === scriptSrc && window.snap) {
        resolve(window.snap);
        return;
      }
      if (existing.dataset.src === scriptSrc) {
        existing.addEventListener("load", () => {
          if (window.snap) resolve(window.snap);
          else reject(new Error("Midtrans Snap gagal diinisialisasi."));
        }, { once: true });
        existing.addEventListener("error", () => {
          reject(new Error("Gagal memuat skrip Midtrans Snap."));
        }, { once: true });
        return;
      }
      existing.remove();
    }

    const script = document.createElement("script");
    script.id = SNAP_SCRIPT_ID;
    script.src = scriptSrc;
    script.dataset.src = scriptSrc;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    script.onload = () => {
      if (window.snap) {
        resolve(window.snap);
      } else {
        reject(new Error("Midtrans Snap gagal diinisialisasi."));
      }
    };

    script.onerror = () => {
      reject(new Error("Gagal memuat skrip Midtrans Snap."));
    };

    document.head.appendChild(script);
  });
}

export interface EmbedMidtransSnapOptions extends MidtransSnapCallbacks {
  snapToken: string | null | undefined;
  embedId: string;
  clientKey?: string | null;
  isProduction?: boolean;
}

/**
 * Menampilkan Midtrans Snap langsung di dalam container halaman aplikasi (`embedId`).
 * Jika `window.snap.embed` tidak tersedia, menggunakan popup in-page `window.snap.pay`.
 */
export async function embedMidtransSnap(
  options: EmbedMidtransSnapOptions,
): Promise<"embed" | "pay"> {
  const token = options.snapToken?.trim();
  if (!token) {
    throw new Error("Token pembayaran Midtrans (snapToken) tidak tersedia.");
  }

  const snap = await loadMidtransSnapScript({
    clientKey: options.clientKey,
    isProduction: options.isProduction,
  });

  if (typeof snap.embed === "function") {
    const container = document.getElementById(options.embedId);
    if (container) {
      container.innerHTML = "";
    }
    snap.embed(token, {
      embedId: options.embedId,
      onSuccess: options.onSuccess,
      onPending: options.onPending,
      onError: options.onError,
      onClose: options.onClose,
    });
    return "embed";
  }

  snap.pay(token, {
    onSuccess: options.onSuccess,
    onPending: options.onPending,
    onError: options.onError,
    onClose: options.onClose,
  });
  return "pay";
}

export interface OpenMidtransSnapOptions extends MidtransSnapCallbacks {
  snapToken: string | null | undefined;
  redirectUrl?: string | null;
  clientKey?: string | null;
  isProduction?: boolean;
}

/**
 * Membuka popup Midtrans Snap langsung di dalam halaman aplikasi (tanpa membuka tab baru).
 */
export async function openMidtransSnapPopup(
  options: OpenMidtransSnapOptions,
): Promise<"snap"> {
  const token = options.snapToken?.trim();
  if (!token) {
    throw new Error("Token Snap Midtrans tidak tersedia untuk membuka pembayaran di halaman ini.");
  }

  const snap = await loadMidtransSnapScript({
    clientKey: options.clientKey,
    isProduction: options.isProduction,
  });

  snap.pay(token, {
    onSuccess: options.onSuccess,
    onPending: options.onPending,
    onError: options.onError,
    onClose: options.onClose,
  });

  return "snap";
}
