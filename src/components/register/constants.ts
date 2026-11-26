import { Building2, LucideIcon, Store, User } from "lucide-react";
import { PartnerRoleType } from "@/types/auth.types";

export const REG_RECEIPT_KEY = "porta_reg_receipt";

export interface RegisterFormData {
  picName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  companyName: string;
  npwpNumber: string;
  nib: string;
  companyAddress: string;
  agreeTerms: boolean;
}

export const INITIAL_REGISTER_FORM_DATA: RegisterFormData = {
  picName: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirm: "",
  companyName: "",
  npwpNumber: "",
  nib: "",
  companyAddress: "",
  agreeTerms: false,
};

export interface RegisterStepMetadata {
  step: number;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

export function getRegisterStepsMetadata(
  partnerType: PartnerRoleType
): RegisterStepMetadata[] {
  return [
    {
      step: 1,
      title: "PIC & Akun Login",
      subtitle: "Kredensial Penanggung Jawab",
      icon: User,
    },
    {
      step: 2,
      title:
        partnerType === "OPERATOR"
          ? "Badan Usaha Pelayaran"
          : "Profil Usaha Tenant",
      subtitle:
        partnerType === "OPERATOR"
          ? "Identitas Perusahaan & NPWP"
          : "Identitas Usaha & Kios/Gudang",
      icon: partnerType === "OPERATOR" ? Building2 : Store,
    },
  ];
}
