import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Zap, Droplets, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "One Call Service — Trusted local pros" },
      { name: "description", content: "Plumber, electrician, water tank cleaning. Book in seconds." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-secondary to-background">
      <div className="mx-auto max-w-md px-5 pt-16 pb-24">
        <div className="flex items-center gap-2 text-primary">
          <PhoneCall className="h-5 w-5" />
          <span className="font-semibold tracking-tight">One Call Service</span>
        </div>
        <h1 className="mt-8 text-4xl font-bold leading-tight text-foreground">
          Local pros, <span className="text-primary">one call away.</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Find a trusted plumber, electrician or water tank cleaner near you. Call, WhatsApp or book in seconds.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: Wrench, label: "Plumber" },
            { icon: Zap, label: "Electrician" },
            { icon: Droplets, label: "Tank Cleaning" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
              <Icon className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-xs font-medium">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link to="/auth">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/dashboard">Browse providers</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
