import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { PartnerRoleType } from "@/types/auth.types";

export interface RegisterWizardControlsProps {
  currentStep: number;
  partnerType: PartnerRoleType;
  isSubmitting: boolean;
  agreeTerms: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export function RegisterWizardControls({
  currentStep,
  partnerType,
  isSubmitting,
  agreeTerms,
  onPrevStep,
  onNextStep,
}: RegisterWizardControlsProps) {
  return (
    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
      {currentStep > 1 ? (
        <button
          type="button"
          onClick={onPrevStep}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>
      ) : (
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      )}

      {currentStep === 1 ? (
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0B241E] hover:bg-[#133D31] text-white transition-all cursor-pointer shadow-md shadow-emerald-950/20"
        >
          <span>Lanjutkan ke Profil Usaha</span>
          <ArrowRight className="w-4 h-4 text-[#D97706]" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting || !agreeTerms}
          className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-900/20 ${
            isSubmitting || !agreeTerms
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-[#D97706] hover:bg-[#B45309] text-[#0B241E] hover:text-white"
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-[#0B241E] border-t-transparent rounded-full animate-spin" />
              <span>
                Mendaftarkan{" "}
                {partnerType === "OPERATOR" ? "Operator..." : "Tenant..."}
              </span>
            </>
          ) : (
            <>
              <span>
                {partnerType === "OPERATOR"
                  ? "Kirim Pendaftaran Operator Kapal"
                  : "Kirim Pendaftaran Tenant Pelabuhan"}
              </span>
              <Check className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
