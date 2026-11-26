"use client";

import React, { useState } from "react";
import { Package, Wrench } from "lucide-react";
import {
  CargoCategory,
  CreateCargoRecordPayload,
  CreateEquipmentRentalPayload,
  PortEquipmentType,
} from "@/types/field-ops.types";
import { ShipVisitItem } from "@/types/upt.types";

export interface UptCargoEquipmentSectionProps {
  visits: ShipVisitItem[];
  activePortId: number;
  isSubmitting: boolean;
  onCreateCargo: (payload: CreateCargoRecordPayload) => Promise<void>;
  onCreateEquipment: (payload: CreateEquipmentRentalPayload) => Promise<void>;
}

export function UptCargoEquipmentSection({
  visits,
  activePortId,
  isSubmitting,
  onCreateCargo,
  onCreateEquipment,
}: UptCargoEquipmentSectionProps) {
  const [cargoVisitId, setCargoVisitId] = useState<string>("");
  const [cargoCategory, setCargoCategory] = useState<CargoCategory>("ANTARPULAU");
  const [cargoDesc, setCargoDesc] = useState("");
  const [cargoQty, setCargoQty] = useState("");
  const [cargoUnit, setCargoUnit] = useState("ton");

  const [equipVisitId, setEquipVisitId] = useState<string>("");
  const [equipType, setEquipType] = useState<PortEquipmentType>("FORKLIFT");
  const [equipLabel, setEquipLabel] = useState("Forklift 5 Ton");
  const [equipHours, setEquipHours] = useState("2");

  const handleSubmitCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateCargo({
      portId: activePortId,
      visitId: cargoVisitId ? Number(cargoVisitId) : undefined,
      cargoCategory,
      description: cargoDesc.trim(),
      quantity: Number(cargoQty),
      unitLabel: cargoUnit.trim(),
    });
    setCargoDesc("");
    setCargoQty("");
  };

  const handleSubmitEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateEquipment({
      portId: activePortId,
      visitId: equipVisitId ? Number(equipVisitId) : undefined,
      equipmentType: equipType,
      capacityLabel: equipLabel.trim(),
      durationHours: Number(equipHours),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form
        onSubmit={handleSubmitCargo}
        className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-2xs"
      >
        <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
          <Package className="w-4 h-4 text-[#D97706]" />
          Catat Bongkar Muat Barang
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">
              Kategori Muatan
            </label>
            <select
              value={cargoCategory}
              onChange={(e) => setCargoCategory(e.target.value as CargoCategory)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            >
              <option value="ANTARPULAU">Muatan Antarpulau</option>
              <option value="IMPOR_EKSPOR">Muatan Ekspor / Impor</option>
              <option value="BULOG_PUPUK">Beras Bulog / Pupuk Subsidi</option>
              <option value="HEWAN_TERNAK">Hewan Ternak</option>
              <option value="PETI_KEMAS_20FT">Peti Kemas 20 Feet</option>
              <option value="PETI_KEMAS_40FT">Peti Kemas 40 Feet</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">
              Kunjungan Kapal (Opsional)
            </label>
            <select
              value={cargoVisitId}
              onChange={(e) => setCargoVisitId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            >
              <option value="">Umum / Tanpa Kunjungan</option>
              {visits.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.visitNumber} ({v.vessel?.name})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#334155] mb-1">
            Deskripsi Muatan
          </label>
          <input
            type="text"
            required
            value={cargoDesc}
            onChange={(e) => setCargoDesc(e.target.value)}
            placeholder="Bongkar muat beras Bulog 100 ton"
            className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">
              Volume / Jumlah
            </label>
            <input
              type="number"
              required
              min={0.01}
              step="0.01"
              value={cargoQty}
              onChange={(e) => setCargoQty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">
              Satuan
            </label>
            <input
              type="text"
              required
              value={cargoUnit}
              onChange={(e) => setCargoUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
        >
          Simpan Bongkar Muat
        </button>
      </form>

      <form
        onSubmit={handleSubmitEquipment}
        className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-2xs"
      >
        <h3 className="text-sm font-extrabold text-[#0B241E] flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#D97706]" />
          Catat Sewa Alat Pelabuhan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">
              Jenis Alat
            </label>
            <select
              value={equipType}
              onChange={(e) =>
                setEquipType(e.target.value as PortEquipmentType)
              }
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            >
              <option value="FORKLIFT">Forklift Pelabuhan</option>
              <option value="CRANE_LISTRIK_DIESEL">Crane Listrik / Diesel</option>
              <option value="MOTOR_LONG_BOAT">Motor Long Boat</option>
              <option value="GEROBAK_DORONG">Gerobak Dorong</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">
              Kunjungan (Opsional)
            </label>
            <select
              value={equipVisitId}
              onChange={(e) => setEquipVisitId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            >
              <option value="">Umum</option>
              {visits.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.visitNumber} ({v.vessel?.name})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">
              Label Kapasitas
            </label>
            <input
              type="text"
              required
              value={equipLabel}
              onChange={(e) => setEquipLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">
              Durasi (Jam)
            </label>
            <input
              type="number"
              required
              min={0.5}
              step="0.5"
              value={equipHours}
              onChange={(e) => setEquipHours(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-[#0B241E] text-white text-xs font-bold cursor-pointer"
        >
          Simpan Sewa Alat
        </button>
      </form>
    </div>
  );
}
