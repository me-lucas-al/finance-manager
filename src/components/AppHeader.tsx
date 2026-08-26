import { NotificationCenter } from "@/components/NotificationCenter";
import { LogoutButton } from "@/components/LogoutButton";
import { Navigation } from "@/components/Navigation";
import { Logo } from "@/components/Logo";
import { auth } from "@/auth";
import { getNotifications } from "@/app/actions/notifications";

export async function AppHeader() {
  const session = await auth();
  if (!session) return null;

  const notifications = await getNotifications();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center">
          <Logo className="mr-8" markClassName="h-8 w-8" />
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
