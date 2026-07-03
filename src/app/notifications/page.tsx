import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { requireAuth } from "@/lib/auth";
import { getNotifications } from "@/lib/queries/notifications";
import { NotificationItem } from "./_components/NotificationItem";
import { MarkAllReadButton } from "./_components/MarkAllReadButton";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const profile = await requireAuth();
  const notifications = await getNotifications(profile.role, profile.id).catch(() => []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const unread = notifications.filter((n) => !n.is_read);
  const read = notifications.filter((n) => n.is_read);

  return (
    <div className="bg-[#f7fafa] min-h-screen text-[#181c1d]">
      <Sidebar role={profile.role} />
      <TopBar
        userName={profile.full_name ?? "Utilisateur"}
        userAvatar={profile.avatar_url ?? undefined}
        unreadCount={unreadCount}
      />

      <main className="ml-60 pt-[60px] min-h-screen">
        <div className="max-w-2xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#181c1d]">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-[#6f797a] mt-1">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
            {unreadCount > 0 && <MarkAllReadButton />}
          </div>

          {/* État vide */}
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl custom-shadow p-16 text-center">
              <span className="material-symbols-outlined text-5xl mb-3 block text-neutral-300">
                notifications_none
              </span>
              <p className="font-semibold text-[#181c1d]">Aucune notification</p>
              <p className="text-sm text-[#6f797a] mt-1">
                Vous n&apos;avez pas encore reçu d&apos;alertes.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Non lues */}
              {unread.length > 0 && (
                <section>
                  <p className="text-xs font-bold text-[#6f797a] uppercase tracking-wider mb-3">
                    Non lues ({unread.length})
                  </p>
                  <div className="space-y-3">
                    {unread.map((n) => (
                      <NotificationItem key={n.id} notification={n} />
                    ))}
                  </div>
                </section>
              )}

              {/* Lues */}
              {read.length > 0 && (
                <section>
                  <p className="text-xs font-bold text-[#6f797a] uppercase tracking-wider mb-3">
                    Lues ({read.length})
                  </p>
                  <div className="space-y-3">
                    {read.map((n) => (
                      <NotificationItem key={n.id} notification={n} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
