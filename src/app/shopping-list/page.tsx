import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { requireAuth } from "@/lib/auth";
import { getActiveShoppingList } from "@/lib/queries/favorites";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { ShoppingListClient } from "./_components/ShoppingListClient";

export const dynamic = "force-dynamic";

export default async function ShoppingListPage() {
  const profile = await requireAuth();
  const [list, unreadCount] = await Promise.all([
    getActiveShoppingList(),
    getUnreadNotificationCount(profile.id),
  ]);

  const items = (
    list?.shopping_list_items ?? []
  ) as {
    id: string;
    product_name: string;
    product_id: string | null;
    quantity: number;
    is_checked: boolean;
  }[];

  const totalCount = items.length;
  const checkedCount = items.filter((i) => i.is_checked).length;

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
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl text-[#004f54]">
                shopping_cart
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#181c1d]">Liste de courses</h1>
              {totalCount > 0 && (
                <p className="text-sm text-[#6f797a] mt-0.5">
                  {checkedCount}/{totalCount} article{totalCount > 1 ? "s" : ""} coché
                  {checkedCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <ShoppingListClient listId={list?.id ?? ""} initialItems={items} />
        </div>
      </main>
    </div>
  );
}
