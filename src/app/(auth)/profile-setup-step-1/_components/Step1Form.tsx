"use client";

import { useTransition, useState } from "react";
import { saveStep1Action } from "../_actions/save-step1.action";

const activityOptions = [
  { value: "sedentary", label: "Sédentaire", desc: "Peu ou pas d'exercice régulier", icon: "airline_seat_recline_normal" },
  { value: "moderate", label: "Modéré", desc: "Activité physique 3 à 5 fois par semaine", icon: "directions_walk" },
  { value: "active", label: "Actif", desc: "Sport intensif ou travail physique quotidien", icon: "fitness_center" },
];

export function Step1Form() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState("moderate");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveStep1Action({
        age: fd.get("age"),
        weight_kg: fd.get("weight_kg"),
        height_cm: fd.get("height_cm"),
        activity_level: activity,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <section className="bg-white p-6 rounded-xl custom-shadow border border-[#bec8c9]/30">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-[#004f54]">person_pin</span>
          <h2 className="text-2xl font-semibold text-[#181c1d]">Vos informations de base</h2>
        </div>

        <div className="space-y-6">
          {/* Âge */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#181c1d]" htmlFor="age">Âge</label>
            <div className="relative">
              <input
                id="age" name="age" type="number" required min={1} max={129}
                className="w-full bg-[#f1f4f4] border border-[#bec8c9] rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#004f54]/20 focus:border-[#004f54] transition-all outline-none"
                placeholder="34"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3f4949] text-xs font-semibold">ans</span>
            </div>
          </div>

          {/* Poids & Taille */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#181c1d]" htmlFor="weight_kg">Poids</label>
              <div className="relative">
                <input
                  id="weight_kg" name="weight_kg" type="number" required min={1} step="0.1"
                  className="w-full bg-[#f1f4f4] border border-[#bec8c9] rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#004f54]/20 focus:border-[#004f54] transition-all outline-none"
                  placeholder="75"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3f4949] text-xs font-semibold">kg</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#181c1d]" htmlFor="height_cm">Taille</label>
              <div className="relative">
                <input
                  id="height_cm" name="height_cm" type="number" required min={50} max={250}
                  className="w-full bg-[#f1f4f4] border border-[#bec8c9] rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#004f54]/20 focus:border-[#004f54] transition-all outline-none"
                  placeholder="175"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3f4949] text-xs font-semibold">cm</span>
              </div>
            </div>
          </div>

          {/* Niveau d'activité */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#181c1d]">Niveau d&apos;activité</label>
            <div className="grid grid-cols-1 gap-3">
              {activityOptions.map((opt) => (
                <label
                  key={opt.value}
                  onClick={() => setActivity(opt.value)}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    activity === opt.value
                      ? "border-[#004f54] bg-[#a1f0f6]/10"
                      : "border-[#bec8c9] hover:bg-[#f1f4f4]"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${activity === opt.value ? "border-[#004f54]" : "border-[#bec8c9]"}`}>
                    {activity === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-[#004f54]" />}
                  </div>
                  <div className="ml-4">
                    <span className="block text-sm font-semibold text-[#181c1d]">{opt.label}</span>
                    <span className="block text-xs text-[#3f4949]">{opt.desc}</span>
                  </div>
                  <span className={`material-symbols-outlined ml-auto ${activity === opt.value ? "text-[#004f54]" : "text-[#3f4949]"}`}>
                    {opt.icon}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <p role="alert" className="mt-4 text-sm text-[#ae2f34] bg-[#ae2f34]/5 border border-[#ae2f34]/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-between items-center">
        <span />
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#004f54] text-white px-8 py-3 rounded-full text-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60"
        >
          {isPending ? "Sauvegarde…" : "Suivant"}
          {!isPending && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
        </button>
      </div>
    </form>
  );
}
