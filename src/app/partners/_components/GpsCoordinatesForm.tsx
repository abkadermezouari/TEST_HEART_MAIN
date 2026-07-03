"use client";

import { useState } from "react";
import { updateGpsCoordinatesAction } from "../_actions/gps.action";

interface GpsCoordinatesFormProps {
  partnerId: string;
  initialData: {
    name: string;
    address_line: string | null;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
  };
}

export function GpsCoordinatesForm({ partnerId, initialData }: GpsCoordinatesFormProps) {
  const [name, setName] = useState(initialData.name);
  const [addressLine, setAddressLine] = useState(initialData.address_line ?? "");
  const [latitude, setLatitude] = useState(initialData.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(initialData.longitude?.toString() ?? "");
  const [phone, setPhone] = useState(initialData.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const result = await updateGpsCoordinatesAction({
      partnerId,
      name: name.trim(),
      address_line: addressLine.trim() || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      phone: phone.trim() || null,
    });
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Coordonnées enregistrées avec succès." });
    }
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-[0px_2px_4px_rgba(40,37,29,0.05)] border border-neutral-100 p-6">
      <h2 className="text-2xl font-bold text-[#181c1d] mb-1">Coordonnées du magasin</h2>
      <p className="text-sm text-neutral-500 mb-6">
        Ces informations seront visibles par vos clients sur la carte.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Nom du magasin</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            placeholder="Ex: Mon Magasin Bio"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Téléphone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            placeholder="Ex: +213 555 123 456"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Adresse</label>
          <input
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            placeholder="Ex: 123 Rue Principale, Annaba"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Latitude</label>
          <input
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            placeholder="Ex: 36.9000"
            type="number"
            step="any"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Longitude</label>
          <input
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            placeholder="Ex: 7.7500"
            type="number"
            step="any"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#01696f] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#004f54] transition-colors disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Enregistrer les coordonnées"}
        </button>
        {message && (
          <span
            className={`text-sm font-bold ${
              message.type === "success" ? "text-teal-600" : "text-[#ae2f34]"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
