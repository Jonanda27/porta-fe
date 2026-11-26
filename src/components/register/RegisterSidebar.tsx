import Link from "next/link";
import { PartnerRoleType } from "@/types/auth.types";

export interface RegisterSidebarProps {
  partnerType: PartnerRoleType;
}

export function RegisterSidebar({ partnerType }: RegisterSidebarProps) {
  return (
    <aside className="w-full lg:w-[38%] xl:w-[35%] text-white relative shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#143E33] shadow-2xl z-20 overflow-hidden select-none bg-[#0B241E]">
      {/* Background Maritime Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url('/images/register-maritime-bg.jpg')` }}
      />

      {/* Cinematic Deep Emerald Scrim Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#071914]/96 via-[#0B241E]/90 to-[#040E0B]/98 backdrop-blur-[1px] pointer-events-none" />

      {/* Ambient Radial Lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#133D31]/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#D97706]/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10 pb-8 lg:pb-10 flex-1 flex flex-col justify-between h-full max-h-screen">
        {/* Top: Official Brand Lockup */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3.5 group cursor-pointer">
            <div className="w-11 h-11 rounded-xl bg-[#143E33]/90 border border-[#1E5748] p-1 flex items-center justify-center shadow-lg shadow-black/50 group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/brand/symbol-white.svg"
                alt="PORTA Official Anchor"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-black text-2xl tracking-wider text-white">PORTA</span>
              <span className="block text-[9px] font-mono tracking-widest text-[#85A69B] uppercase -mt-0.5">
                Tata Kelola Pelabuhan &amp; Pendapatan Daerah
              </span>
            </div>
          </Link>
        </div>

        {/* Bottom Area: Info Registrasi Dinamis Sesuai Kategori */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
            {partnerType === "OPERATOR"
              ? "Pendaftaran Operator Kapal"
              : "Pendaftaran Tenant & Kios Pelabuhan"}
          </h1>
          <p className="text-xs sm:text-[13px] text-emerald-100/90 leading-relaxed max-w-sm">
            {partnerType === "OPERATOR"
              ? "Daftarkan badan usaha pelayaran dan kredensial akun penanggung jawab Anda untuk mendapatkan akses resmi ke izin sandar dermaga, labuh, bongkar muat, dan penerbitan e-SKRD terintegrasi PP No. 35/2023."
              : "Daftarkan usaha, kios, gudang, atau toko komersial Anda untuk mengajukan sewa aset pelabuhan Poumako, pencatatan meteran utilitas (listrik & air), serta pembayaran retribusi pemakaian kekayaan daerah."}
          </p>
        </div>
      </div>
    </aside>
  );
}
