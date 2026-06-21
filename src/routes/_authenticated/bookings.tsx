import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { myBookingsQuery } from "@/lib/queries";
import { SignedImage } from "@/components/SignedImage";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({ meta: [{ title: "My bookings — One Call Service" }] }),
  component: Bookings,
});

function Bookings() {
  const { data, isLoading } = useQuery(myBookingsQuery);
  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold">My bookings</h1>
      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
        {data?.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
            <Link to="/dashboard" className="text-primary text-sm font-medium mt-2 inline-block">Browse providers →</Link>
          </div>
        )}
        {data?.map((b) => {
          const p = b.service_providers;
          return (
            <Link key={b.id} to="/provider/$id" params={{ id: p?.id ?? "" }} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
              <SignedImage storedPath={p?.logo_url} alt={p?.name ?? ""} className="h-12 w-12 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{p?.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {b.booking_date}{b.booking_time ? ` at ${b.booking_time.slice(0, 5)}` : ""}
                </p>
              </div>
              <Badge variant={b.status === "pending" ? "secondary" : "default"}>{b.status}</Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
