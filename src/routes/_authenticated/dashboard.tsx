import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, providersQuery } from "@/lib/queries";
import { SignedImage } from "@/components/SignedImage";
import { Badge } from "@/components/ui/badge";
import { Phone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Browse providers — One Call Service" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const cats = useQuery(categoriesQuery);
  const providers = useQuery(providersQuery(categoryId));
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("providers-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "service_providers" }, () => {
        qc.invalidateQueries({ queryKey: ["providers"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold">Find a pro</h1>
      <p className="text-sm text-muted-foreground mt-1">Tap a category, then pick a provider.</p>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
        <button
          onClick={() => setCategoryId(null)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition ${categoryId === null ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"}`}
        >All</button>
        {cats.data?.map((c) => (
          <button key={c.id} onClick={() => setCategoryId(c.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition ${categoryId === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"}`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {providers.isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
        {providers.data?.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No providers yet.</p>
            <Link to="/register-provider" className="text-primary text-sm font-medium mt-2 inline-block">Be the first to register →</Link>
          </div>
        )}
        {providers.data?.map((p) => (
          <Link
            key={p.id}
            to="/provider/$id"
            params={{ id: p.id }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm hover:border-primary/40 hover:shadow transition"
          >
            <SignedImage storedPath={p.logo_url} alt={p.name} className="h-14 w-14 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{p.name}</h3>
              </div>
              <Badge variant="secondary" className="mt-0.5">{p.service_categories?.label}</Badge>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" /> {p.phone}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
