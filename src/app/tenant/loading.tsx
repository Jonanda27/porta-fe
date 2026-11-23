import { PortaLoadingScreen } from "@/components/ui/PortaLoadingScreen";

export default function TenantLoading() {
  return (
    <PortaLoadingScreen
      variant="inline"
      title="Memuat Portal Tenant & Mitra Usaha..."
      subtitle="Pengelolaan sewa ruangan, kontrak PKS & tagihan utilitas"
    />
  );
}
