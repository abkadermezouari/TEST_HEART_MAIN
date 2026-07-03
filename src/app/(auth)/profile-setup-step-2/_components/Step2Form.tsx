"use client";

import { useTransition, useState } from "react";
import { saveStep2Action } from "../_actions/save-step2.action";

const healthProfiles = [
  { value: "diabetic", icon: "stethoscope", label: "Diabétique" },
  { value: "celiac", icon: "grass", label: "Cœliaque" },
  { value: "healthy", icon: "nutrition", label: "Mode Sain" },
  { value: "vegetarian", icon: "eco", label: "Végétarien" },
];

const goalOptions = [
  { value: "manage_diabetes", label: "Gérer le diabète" },
  { value: "lose_weight", label: "Perdre du poids" },
  { value: "avoid_allergens", label: "Éviter les allergènes" },
  { value: "maintain_weight", label: "Maintenir mon poids" },
  { value: "build_muscle", label: "Prendre du muscle" },
  { value: "eat_healthier", label: "Mieux manger" },
];

export function Step2Form() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(["healthy"]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  function toggleCondition(val: string) {
    setSelectedConditions((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }

  function toggleGoal(val: string) {
    setSelectedGoals((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveStep2Action({
        health_conditions: selectedConditions,
        goals: selectedGoals,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Profil nutritionnel */}
      <section>
        <h2 className="text-2xl font-semibold text-[#181c1d] mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#004f54]">medical_information</span>
          Profil nutritionnel
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {healthProfiles.map((profile) => {
            const active = selectedConditions.includes(profile.value);
            return (
              <button
                key={profile.value}
                type="button"
                onClick={() => toggleCondition(profile.value)}
                className={`relative bg-white custom-shadow rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-center border-2 transition-all ${
                  active ? "border-[#004f54] bg-[#004f54]/5" : "border-transparent hover:border-[#bec8c9]"
                }`}
                style={{ minHeight: 120 }}
              >
                <span className={`material-symbols-outlined text-3xl ${active ? "text-[#004f54]" : "text-[#6f797a]"}`}>
                  {profile.icon}
                </span>
                <span className={`text-sm font-semibold ${active ? "text-[#004f54]" : "text-[#181c1d]"}`}>
                  {profile.label}
                </span>
                {active && (
                  <div className="absolute top-2 right-2 bg-[#004f54] text-white rounded-full w-5 h-5 flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Objectifs */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-[#181c1d] mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#004f54]">target</span>
          Vos objectifs prioritaires
        </h2>
        <div className="flex flex-wrap gap-3">
          {goalOptions.map((goal) => {
            const active = selectedGoals.includes(goal.value);
            return (
              <button
                key={goal.value}
                type="button"
                onClick={() => toggleGoal(goal.value)}
                className={`px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 ${
                  active ? "bg-[#004f54] text-white shadow-sm" : "bg-[#e6e9e9] text-[#3f4949] hover:bg-[#bec8c9] hover:text-[#181c1d]"
                }`}
              >
                {goal.label}
                {active && <span className="material-symbols-outlined text-sm">close</span>}
              </button>
            );
          })}
        </div>
      </section>

      {error && (
        <p role="alert" className="mt-6 text-sm text-[#ae2f34] bg-[#ae2f34]/5 border border-[#ae2f34]/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Navigation */}
      <section className="mt-12 flex items-center justify-between pt-8 border-t border-[#bec8c9]">
        <a href="/profile-setup-step-1" className="flex items-center gap-2 px-6 py-3 text-[#3f4949] text-sm font-semibold hover:text-[#181c1d] transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
          Retour
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-8 py-3 bg-[#004f54] text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-[#01696f] transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? "Sauvegarde…" : "Terminer"}
          {!isPending && <span className="material-symbols-outlined">arrow_forward</span>}
        </button>
      </section>
    </form>
  );
}
