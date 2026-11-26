import { toast } from "@/store/toast.store";
import { CctvCameraItem, CctvEventSeverity, CctvStatus } from "@/types/cctv.types";

export type CctvFilterMode = "ALL" | "ONLINE" | "OFFLINE";
export type CctvLayoutMode = "3x2" | "2x2" | "spotlight";

export const STATUS_BADGE: Record<
  CctvStatus,
  { label: string; className: string; dotClass: string }
> = {
  ONLINE: {
    label: "ONLINE",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    dotClass: "bg-emerald-400",
  },
  DEGRADED: {
    label: "SINYAL LEMAH",
    className: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    dotClass: "bg-amber-400",
  },
  OFFLINE: {
    label: "OFFLINE",
    className: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    dotClass: "bg-rose-500",
  },
};

export const EVENT_SEVERITY_BADGE: Record<CctvEventSeverity, string> = {
  ALERT: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  WARNING: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  INFO: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

export function captureCctvSnapshot(
  cam: CctvCameraItem,
  videoEl: HTMLVideoElement | null | undefined
): void {
  if (cam.status === "OFFLINE") {
    toast.error(`${cam.code} sedang offline, snapshot tidak tersedia.`);
    return;
  }

  if (!videoEl || videoEl.readyState < 2 || videoEl.videoWidth === 0) {
    toast.info(`Frame ${cam.code} sedang dimuat, coba sesaat lagi.`);
    return;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("Gagal menginisialisasi kanvas snapshot.");
      return;
    }

    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    // Watermark cap waktu & identitas kamera PORTA
    const nowStr = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const stamp = `PORTA CCTV • ${cam.code}${
      cam.berthCode ? ` • ${cam.berthCode}` : ""
    } • ${nowStr} WIT`;

    const barHeight = Math.max(36, Math.round(canvas.height * 0.055));
    ctx.fillStyle = "rgba(6, 22, 18, 0.82)";
    ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
    ctx.fillStyle = "#F59E0B";
    ctx.font = `bold ${Math.max(14, Math.round(barHeight * 0.45))}px monospace`;
    ctx.textBaseline = "middle";
    ctx.fillText(stamp, 16, canvas.height - barHeight / 2);

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `snapshot-${cam.code}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Snapshot ${cam.code} berhasil diunduh (.png).`);
  } catch {
    toast.error(`Gagal mengambil snapshot dari ${cam.code}.`);
  }
}
