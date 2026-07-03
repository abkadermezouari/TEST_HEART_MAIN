"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TopBarProps {
  dark?: boolean;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  unreadCount?: number;
}

export default function TopBar({
  dark = false,
  userName = "Dr. Claire",
  userRole = "Nutritionniste",
  userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAWsab-qrFyA1h1kVE4RqKEO30wWfLksCYgW9NRFAgDkzJrawLkOYPNfT1GbvLnbLgpBlMddXPJh3nQR-n2GBD2LKq0lOiVI_ZGVSQhbdQcUhb8DfvwAUaYqeEsp8AVbeN4bji__5QmQ91QfhVS1dZZrshu2wfzztlI_tbfS82NxbBkpFZqwlSYEG3j8DgMIL7Ek6HanFuMG5XxGsRl2ZwsMN3zewPJiV0_Ud8hCssc0hzwrMiuNtCs5VBGrF9yJGGs8CHCNKxIqGqx",
  unreadCount = 0,
}: TopBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  const hasNotifications = unreadCount > 0;

  if (dark) {
    return (
      <header className="fixed top-0 right-0 left-60 h-[60px] z-40 flex items-center justify-between px-6 gap-4 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="flex items-center flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-lg">
              search
            </span>
            <input
              className="w-full bg-neutral-900 border-none rounded-full py-2 pl-10 pr-4 text-sm text-neutral-200 placeholder:text-neutral-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              placeholder="Rechercher des nutriments, recettes..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/notifications")}
            className="p-2 text-neutral-400 hover:bg-neutral-800 rounded-full transition-colors relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff6b6b] rounded-full border-2 border-neutral-950" />
            )}
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-neutral-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-neutral-200">{userName}</p>
              <p className="text-[10px] text-neutral-500 font-semibold">{userRole}</p>
            </div>
            <Image
              src={userAvatar}
              alt="User Profile"
              width={40}
              height={40}
              className="w-8 h-8 rounded-full bg-teal-900 border border-teal-800 object-cover"
            />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 right-0 left-60 h-[60px] z-40 bg-[#F9F8F5]/80 backdrop-blur-md border-b border-neutral-200 flex items-center justify-between px-6 gap-4">
      <div className="flex items-center flex-1 max-w-xl">
        <form onSubmit={handleSearch} className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
            search
          </span>
          <input
            className="w-full bg-[#ebeeee] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#01696f]/20 outline-none"
            placeholder="Rechercher des produits ou recettes..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/notifications")}
          className="p-2 hover:bg-neutral-200/50 rounded-full transition-colors relative"
        >
          <span className="material-symbols-outlined text-neutral-600">notifications</span>
          {hasNotifications && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#ae2f34] rounded-full" />
          )}
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-neutral-200 ml-2">
          <Image
            src={userAvatar}
            alt="User Profile"
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
