import { NotificationCenter } from "@/components/NotificationCenter";
import { LogoutButton } from "@/components/LogoutButton";
import { Navigation } from "@/components/Navigation";
import { auth } from "@/auth";
import { getNotifications } from "@/app/actions/notifications";

export async function AppHeader() {
  const session = await auth();
  if (!session) return null;

  const notifications = await getNotifications();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center">
          <div className="font-bold text-xl text-slate-900 mr-8">FinanceManager</div>
          <Navigation />
        </div>
        <div className="flex items-center gap-4">
          <NotificationCenter initialNotifications={notifications} />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
