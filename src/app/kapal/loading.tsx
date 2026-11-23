import { PortaLoadingScreen } from "@/components/ui/PortaLoadingScreen";

export default function KapalLoading() {
  return (
    <PortaLoadingScreen
      variant="inline"
      title="Memuat Modul Operator Kapal..."
      subtitle="Sinkronisasi data armada, jadwal sandar & retribusi pelabuhan"
    />
  );
}
