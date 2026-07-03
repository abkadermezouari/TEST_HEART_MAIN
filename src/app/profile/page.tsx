import Image from "next/image";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { requireAuth, getHealthProfile } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { LogoutButton } from "./_components/LogoutButton";

const activityLabels: Record<string, string> = {
  sedentary: "Sédentaire",
  moderate: "Modéré",
  active: "Actif",
};

const conditionLabels: Record<string, string> = {
  diabetic: "Diabétique",
  celiac: "Cœliaque",
  healthy: "Mode Sain",
  vegetarian: "Végétarien",
  vegan: "Végétalien",
  keto: "Kéto",
};

const goalLabels: Record<string, string> = {
  manage_diabetes: "Gérer le diabète",
  lose_weight: "Perdre du poids",
  avoid_allergens: "Éviter les allergènes",
  maintain_weight: "Maintenir mon poids",
  build_muscle: "Prendre du muscle",
  eat_healthier: "Mieux manger",
};

export default async function ProfilePage() {
  const profile = await requireAuth();
  const [healthProfile, unreadCount] = await Promise.all([
    getHealthProfile(),
    getUnreadNotificationCount(profile.id),
  ]);

  return (
    <div className="bg-[#f7fafa] min-h-screen">
      <Sidebar role={profile.role} />
      <TopBar
        userName={profile.full_name ?? "Utilisateur"}
        userAvatar={profile.avatar_url ?? undefined}
        unreadCount={unreadCount}
      />

      <main className="ml-60 pt-[60px] p-8 min-h-screen">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* En-tête profil */}
          <div className="bg-white rounded-2xl custom-shadow p-8 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-3xl font-bold shrink-0">
              {profile.avatar_url ? (
                <Image
                  width={80}
                  height={80}
                  src={profile.avatar_url}
                  alt={profile.full_name ?? ""}
                  className="rounded-full object-cover"
                />
              ) : (
                <span>{(profile.full_name ?? profile.email)[0].toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-on-surface">
                {profile.full_name ?? "Utilisateur"}
              </h1>
              <p className="text-sm text-outline mt-1">{profile.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                {profile.role}
              </span>
            </div>
            <LogoutButton />
          </div>

          {/* Données biométriques */}
          <div className="bg-white rounded-2xl custom-shadow p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">monitor_weight</span>
                Données biométriques
              </h2>
              <a
                href="/profile-setup-step-1"
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Modifier
              </a>
            </div>

            {healthProfile ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Âge", value: healthProfile.age ? `${healthProfile.age} ans` : "—", icon: "person" },
                  { label: "Poids", value: healthProfile.weight_kg ? `${healthProfile.weight_kg} kg` : "—", icon: "monitor_weight" },
                  { label: "Taille", value: healthProfile.height_cm ? `${healthProfile.height_cm} cm` : "—", icon: "height" },
                  { label: "Activité", value: healthProfile.activity_level ? activityLabels[healthProfile.activity_level] : "—", icon: "directions_run" },
                ].map((item) => (
                  <div key={item.label} className="bg-surface-container-low rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-primary text-2xl mb-2 block">
                      {item.icon}
                    </span>
                    <p className="text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    <p className="text-lg font-bold text-on-surface">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-outline">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">
                  person_add
                </span>
                <p className="text-sm">Profil santé non configuré.</p>
                <a
                  href="/profile-setup-step-1"
                  className="inline-block mt-3 px-5 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold hover:opacity-90"
                >
                  Configurer mon profil
                </a>
              </div>
            )}
          </div>

          {/* Objectif calorique */}
          {healthProfile?.tdee_kcal && (
            <div className="bg-primary-container text-on-primary-container rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">local_fire_department</span>
                Objectif calorique journalier
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm opacity-80 mb-1">Métabolisme de base (TMB)</p>
                  <p className="text-3xl font-extrabold">
                    {Math.round(Number(healthProfile.bmr_kcal))} <span className="text-lg font-semibold">kcal</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-80 mb-1">Dépense totale (TDEE)</p>
                  <p className="text-3xl font-extrabold">
                    {Math.round(Number(healthProfile.tdee_kcal))} <span className="text-lg font-semibold">kcal</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Conditions & Objectifs */}
          {healthProfile && (
            <div className="bg-white rounded-2xl custom-shadow p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">medical_information</span>
                  Profil de santé
                </h2>
                <a
                  href="/profile-setup-step-2"
                  className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Modifier
                </a>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-outline uppercase tracking-wider mb-3">
                    Conditions médicales
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {healthProfile.health_conditions.length > 0 ? (
                      healthProfile.health_conditions.map((c: string) => (
                        <span
                          key={c}
                          className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold"
                        >
                          {conditionLabels[c] ?? c}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-outline">Aucune condition sélectionnée.</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-outline uppercase tracking-wider mb-3">
                    Objectifs
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {healthProfile.goals.length > 0 ? (
                      healthProfile.goals.map((g: string) => (
                        <span
                          key={g}
                          className="px-4 py-2 bg-surface-container text-on-surface rounded-full text-sm font-semibold"
                        >
                          {goalLabels[g] ?? g}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-outline">Aucun objectif sélectionné.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
