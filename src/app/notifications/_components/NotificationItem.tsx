"use client";

import { useTransition } from "react";
import { markAlertReadAction } from "../_actions/notifications.action";
import type { NotificationRow } from "@/lib/queries/notifications";

const TYPE_STYLES: Record<
  "warning" | "success" | "info",
  { border: string; icon: string; iconColor: string; badge: string }
> = {
  warning: {
    border: "border-amber-200 bg-amber-50",
    icon: "warning",
    iconColor: "text-amber-600",
    badge: "bg-amber-100 text-amber-800",
  },
  success: {
    border: "border-emerald-200 bg-emerald-50",
    icon: "check_circle",
    iconColor: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-800",
  },
  info: {
    border: "border-blue-200 bg-blue-50",
    icon: "info",
    iconColor: "text-blue-600",
    badge: "bg-blue-100 text-blue-800",
  },
};

const TYPE_LABELS: Record<"warning" | "success" | "info", string> = {
  warning: "Avertissement",
  success: "Succès",
  info: "Info",
};

export function NotificationItem({ notification }: { notification: NotificationRow }) {
  const [isPending, startTransition] = useTransition();
  const styles = TYPE_STYLES[notification.type];

  function handleMarkRead() {
    if (notification.is_read) return;
    startTransition(() => { void markAlertReadAction(notification.id); });
  }

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-opacity ${styles.border} ${
        notification.is_read ? "opacity-60" : ""
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
        <span
          className={`material-symbols-outlined ${styles.iconColor}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {styles.icon}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-[#181c1d] text-sm leading-tight">
            {notification.title}
          </h4>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${styles.badge}`}
            >
              {TYPE_LABELS[notification.type]}
            </span>
            {!notification.is_read && (
              <span className="w-2 h-2 rounded-full bg-[#004f54] shrink-0" />
            )}
          </div>
        </div>

        <p className="text-sm text-[#3f4949] leading-relaxed">{notification.message}</p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[#6f797a]">
            {new Date(notification.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {!notification.is_read && (
            <button
              onClick={handleMarkRead}
              disabled={isPending}
              className="text-xs font-semibold text-[#004f54] hover:underline disabled:opacity-50"
            >
              {isPending ? "…" : "Marquer comme lu"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
