"use client";

import React, { useEffect, useRef, useState } from "react";
import { PenTool, Eraser, ShieldCheck, X, Loader2, ExternalLink, FileText } from "lucide-react";
import { OperatorBerthingContract } from "@/types/kapal.types";
import { ModalPortal } from "@/components/ui/ModalPortal";

interface ElectronicSignatureModalProps {
  contract: OperatorBerthingContract | null;
  signedFileUrl?: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (signatureData: string) => Promise<void>;
}

export function ElectronicSignatureModal({
  contract,
  signedFileUrl,
  isSubmitting,
  onClose,
  onConfirm,
}: ElectronicSignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    setHasStroke(false);
    setIsConfirmed(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0B241E";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [contract?.id]);

  if (!contract) return null;

  const getPointerPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
    return {
      x: (mouseEvent.clientX - rect.left) * scaleX,
      y: (mouseEvent.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pos = getPointerPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    isDrawingRef.current = true;
    setHasStroke(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pos = getPointerPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasStroke || !isConfirmed || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    await onConfirm(dataUrl);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-[#E2E8F0] w-full max-w-lg p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B241E] text-[#F59E0B] flex items-center justify-center shrink-0">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0B241E]">
                Tanda Tangan Elektronik (TTE) Kepala Pelabuhan
              </h3>
              <p className="text-[11px] text-[#64748B] font-mono mt-0.5">
                {contract.contractNumber} • {contract.operator?.name || "-"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
            aria-label="Tutup modal TTE"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1.5">
          <div className="font-bold text-[#0B241E]">{contract.title}</div>
          <div className="text-[#475569]">
            Alokasi: <strong>{contract.dockAllocation || "Dermaga Umum"}</strong> • Kuota:{" "}
            <strong>{contract.monthlyQuota || 30}x/bln</strong>
          </div>
          {signedFileUrl && (
            <a
              href={signedFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0284C7] hover:underline pt-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lihat Scan TTD Basah Operator ({contract.signedFileName || "Berkas"})</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#334155]">
              Goreskan Tanda Tangan Elektronik <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-[11px] font-semibold text-[#64748B] hover:text-[#0B241E] inline-flex items-center gap-1 cursor-pointer"
            >
              <Eraser className="w-3 h-3" />
              Bersihkan
            </button>
          </div>
          <div className="border-2 border-dashed border-[#CBD5E1] rounded-2xl overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              width={460}
              height={160}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-40 cursor-crosshair touch-none"
            />
          </div>
        </div>

        <label className="flex items-start gap-2.5 text-xs text-[#334155] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mt-0.5 rounded border-[#CBD5E1]"
          />
          <span>
            Saya menyatakan telah memeriksa berkas scan tanda tangan basah operator dan mengesahkan kontrak PKS Sandar ini secara elektronik.
          </span>
        </label>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !hasStroke || !isConfirmed}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            Tanda Tangani &amp; Aktifkan PKS
          </button>
        </div>
      </form>
    </div>
    </ModalPortal>
  );
}
