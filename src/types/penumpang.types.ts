import type { LucideIcon } from "lucide-react";

export interface ScheduleItem {
  id: string;
  shipName: string;
  operator: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  dockType: "Eksekutif" | "Reguler";
  dockName: string;
  status: "Tepat Waktu" | "Boarding" | "Perubahan Waktu";
  paxQuota: string;
  vehicleQuota: string;
  totalPrice: number;
  retribusiAmount: number;
}

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  badge?: string;
}

export interface ComplaintTicket {
  ticketNumber: string;
  category: string;
  reporterName: string;
  location: string;
  reportedAt: string;
  status: "submitted" | "verified" | "in_progress" | "resolved";
  statusLabel: string;
  slaDeadline: string;
  description: string;
  resolutionNote?: string;
  assignedOfficer?: string;
}

export interface TariffItem {
  id: string;
  category: "pax" | "vehicle" | "dock" | "utility";
  serviceName: string;
  rate: number;
  unit: string;
  legalBasis: string;
  effectiveDate: string;
  notes: string;
}

export interface TicketServiceOption {
  id: string;
  name: string;
  category: "pax" | "motor" | "car" | "truck";
  icon: LucideIcon;
  baseFare: number;
  retribusiPemda: number;
  insurance: number;
  description: string;
}
