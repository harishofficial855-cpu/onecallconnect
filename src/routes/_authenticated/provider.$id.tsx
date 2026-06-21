import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { providerQuery } from "@/lib/queries";
import { SignedImage } from "@/components/SignedImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MessageCircle, CalendarPlus, ChevronLeft, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/provider/$id")({
  component: ProviderPage,
});

function ProviderPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: p, isLoading, error } = useQuery(providerQuery(id));
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const book = useMutation({
    mutationFn: async () => {
      if (!date) throw new Error("Pick a date");
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("bookings").insert({
        user_id: u.user.id,
        provider_id: id,
        booking_date: date,
        booking_time: time || null,
        notes: notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking confirmed");
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      setOpen(false);
      navigate({ to: "/bookings" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading…</div>;
  if (error || !p) return <div className="p-6 text-destructive">Provider not found.</div>;

  const waNumber = (p.whatsapp_number || p.phone).replace(/[^\d]/g, "");
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${p.name}, I found you on One Call Service.`)}`;

  return (
    <div>
      <div className="relative">
        <SignedImage storedPath={p.image_url} alt={p.name} className="h-56 w-full object-cover bg-secondary" />
        <Link to="/dashboard" className="absolute top-4 left-4 rounded-full bg-background/90 p-2 shadow">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </div>
      <div className="px-5 -mt-8 relative">
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <SignedImage storedPath={p.logo_url} alt={p.name} className="h-16 w-16 rounded-xl object-cover bg-secondary" />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{p.name}</h1>
              <Badge variant="secondary" className="mt-1">{p.service_categories?.label}</Badge>
            </div>
          </div>
          {p.address && (
            <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" /> <span>{p.address}</span>
            </div>
          )}
          {p.description && <p className="mt-4 text-sm text-foreground leading-relaxed whitespace-pre-line">{p.description}</p>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button asChild size="lg" variant="outline">
            <a href={`tel:${p.phone}`}><Phone className="h-4 w-4 mr-1" /> Call</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-success border-success/30 hover:bg-success/10 hover:text-success">
            <a href={waLink} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4 mr-1" /> WhatsApp</a>
          </Button>
        </div>
        <Button size="lg" className="w-full mt-3" onClick={() => setOpen(true)}>
          <CalendarPlus className="h-4 w-4 mr-2" /> Book Service
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Book {p.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe the problem" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => book.mutate()} disabled={book.isPending || !date}>Confirm booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
