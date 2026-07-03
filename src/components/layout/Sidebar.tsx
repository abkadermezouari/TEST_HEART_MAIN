"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  roles?: string[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: "home", label: "Accueil" },
  { href: "/search", icon: "search", label: "Recherche" },
  { href: "/map", icon: "map", label: "Carte" },
  { href: "/recipes", icon: "restaurant_menu", label: "Recettes" },
  { href: "/learn", icon: "school", label: "Apprendre" },
  { href: "/shopping-list", icon: "shopping_cart", label: "Liste de courses" },
  { href: "/notifications", icon: "notifications", label: "Notifications" },
  { href: "/profile", icon: "person", label: "Profil" },
  {
    href: "/partners",
    icon: "handshake",
    label: "Partenaires",
    roles: ["partneradmin", "admin"],
  },
  {
    href: "/admin",
    icon: "admin_panel_settings",
    label: "Administration",
    roles: ["admin"],
  },
];

interface SidebarProps {
  dark?: boolean;
  role?: string;
}

export default function Sidebar({ dark = false, role }: SidebarProps) {
  const pathname = usePathname();

  const navItems = ALL_NAV_ITEMS.filter((item) => {
    return !item.roles || (role && item.roles.includes(role));
  });

  if (dark) {
    return (
      <aside className="fixed left-0 top-0 h-full w-60 border-r border-neutral-800 bg-neutral-950 flex flex-col gap-2 py-6 px-0 z-50">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-bold tracking-tight text-teal-100">
            Smart Healthy
          </h1>
          <p className="text-[10px] text-teal-400 font-semibold uppercase tracking-widest mt-1">
            Dietary Intelligence
          </p>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 transition-all duration-200 ease-in-out hover:pl-7 ${
                  active
                    ? "text-teal-400 bg-teal-900/20 border-r-4 border-[#01696F] font-semibold"
                    : "text-neutral-400 hover:bg-neutral-900"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-6">
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-widest">
              Santé Cardiaque
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-2xl font-bold text-teal-400">88%</span>
              <span
                className="material-symbols-outlined text-teal-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 border-r border-neutral-200 bg-[#F9F8F5] flex flex-col gap-2 py-6 px-0 z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#01696f] flex items-center justify-center text-white">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#01696F]">
            Smart Healthy
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
            Dietary Intelligence
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 ease-in-out hover:pl-7 ${
                active
                  ? "text-[#01696F] bg-teal-50 border-r-4 border-[#01696F] font-semibold"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
