import { Link } from "@tanstack/react-router";
import { Home, CalendarDays, PlusCircle, User } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/register-provider", label: "Register", icon: PlusCircle },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted-foreground transition-colors"
              activeProps={{ className: "flex flex-col items-center gap-1 py-2.5 text-xs text-primary font-semibold" }}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
