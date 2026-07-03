import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getAdminStats } from "@/lib/queries/admin";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { PromoteButton } from "./_components/PromoteButton";

const ROLE_LABELS: Record<string, string> = {
  user: "Utilisateur",
  nutritionist: "Nutritionniste",
  partner_admin: "Partenaire",
  admin: "Admin",
};

const ROLE_COLORS: Record<string, string> = {
  user: "bg-blue-50 text-blue-700",
  nutritionist: "bg-purple-50 text-purple-700",
  partner_admin: "bg-amber-50 text-amber-700",
  admin: "bg-teal-50 text-[#004f54]",
};

export default async function AdminPage() {
  const profile = await requireAuth();

  // Accès strict : seul le rôle "admin" peut voir cette page.
  // "partner_admin" et "user" sont redirigés vers /dashboard.
  if (profile.role !== "admin") redirect("/dashboard");

  const [stats, unreadCount] = await Promise.all([
    getAdminStats(),
    getUnreadNotificationCount(profile.id),
  ]);

  const kpis = [
    {
      label: "Utilisateurs",
      value: stats.totalUsers,
      icon: "group",
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "Produits publiés",
      value: stats.totalProducts,
      icon: "inventory_2",
      bg: "bg-teal-50",
      color: "text-[#004f54]",
    },
    {
      label: "Partenaires actifs",
      value: stats.totalPartners,
      icon: "storefront",
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      label: "Recettes publiées",
      value: stats.totalRecipes,
      icon: "restaurant_menu",
      bg: "bg-orange-50",
      color: "text-orange-600",
    },
    {
      label: "Alertes non lues",
      value: stats.unreadAlerts,
      icon: "notifications_active",
      bg: "bg-red-50",
      color: "text-[#ae2f34]",
    },
  ];

  const quickLinks = [
    {
      href: "/search",
      icon: "inventory_2",
      label: "Catalogue Produits",
      desc: `${stats.totalProducts} produits publiés`,
    },
    {
      href: "/map",
      icon: "storefront",
      label: "Partenaires",
      desc: `${stats.totalPartners} partenaires actifs`,
    },
    {
      href: "/notifications",
      icon: "notifications",
      label: "Alertes",
      desc:
        stats.unreadAlerts > 0
          ? `${stats.unreadAlerts} alerte${stats.unreadAlerts > 1 ? "s" : ""} non lue${stats.unreadAlerts > 1 ? "s" : ""}`
          : "Aucune alerte en attente",
    },
  ];

  return (
    <div className="bg-[#f7fafa] min-h-screen text-[#181c1d]">
      <Sidebar role={profile.role} />
      <TopBar
        userName={profile.full_name ?? "Admin"}
        userAvatar={profile.avatar_url ?? undefined}
        unreadCount={unreadCount}
      />

      <main className="ml-60 pt-[60px] min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#181c1d]">Administration</h1>
            <p className="text-sm text-[#6f797a] mt-1">
              Vue d&apos;ensemble de la plateforme Smart Healthy
            </p>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white p-5 rounded-xl custom-shadow flex flex-col gap-3"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.color}`}
                >
                  <span className="material-symbols-outlined">{kpi.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#181c1d]">
                    {kpi.value.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-xs font-semibold text-[#6f797a] mt-0.5">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Liens rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white p-5 rounded-xl custom-shadow flex items-center gap-4 hover:ring-2 hover:ring-[#004f54]/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#004f54] group-hover:bg-[#004f54] group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined">{link.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#181c1d]">{link.label}</p>
                  <p className="text-xs text-[#6f797a] truncate">{link.desc}</p>
                </div>
                <span className="material-symbols-outlined text-neutral-300 group-hover:text-[#004f54] transition-colors shrink-0">
                  chevron_right
                </span>
              </Link>
            ))}
          </div>

          {/* Tableau derniers inscrits */}
          <div className="bg-white rounded-xl custom-shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#181c1d]">Derniers inscrits</h2>
              <span className="text-sm text-[#6f797a]">{stats.totalUsers} utilisateurs total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50">
                    <th className="px-6 py-4">Nom</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Rôle</th>
                    <th className="px-6 py-4">Inscription</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {stats.recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-teal-50/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-sm text-[#181c1d]">
                        {u.full_name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6f797a]">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                            ROLE_COLORS[u.role] ?? "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#6f797a]">
                        {new Date(u.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {u.role !== "admin" ? (
                          <PromoteButton userId={u.id} userName={u.full_name ?? u.email} />
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
