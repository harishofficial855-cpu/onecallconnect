import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery } from "@/lib/queries";
import { uploadFile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/register-provider")({
  head: () => ({ meta: [{ title: "Register as a provider — One Call Service" }] }),
  component: RegisterProvider,
});

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid phone"),
  whatsapp_number: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid WhatsApp number").optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  category_id: z.string().uuid("Pick a category"),
});

function RegisterProvider() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const cats = useQuery(categoriesQuery);
  const [logo, setLogo] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  const submit = useMutation({
    mutationFn: async (form: FormData) => {
      const values = {
        name: String(form.get("name") || ""),
        phone: String(form.get("phone") || ""),
        whatsapp_number: String(form.get("whatsapp_number") || ""),
        address: String(form.get("address") || ""),
        description: String(form.get("description") || ""),
        category_id: String(form.get("category_id") || ""),
      };
      const parsed = schema.safeParse(values);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const uid = u.user.id;
      const [logoPath, imagePath] = await Promise.all([
        logo ? uploadFile("provider-logos", uid, logo) : Promise.resolve(null),
        photo ? uploadFile("provider-images", uid, photo) : Promise.resolve(null),
      ]);
      const { data, error } = await supabase.from("service_providers").insert({
        owner_id: uid,
        name: parsed.data.name,
        phone: parsed.data.phone,
        whatsapp_number: parsed.data.whatsapp_number || null,
        address: parsed.data.address || null,
        description: parsed.data.description || null,
        category_id: parsed.data.category_id,
        logo_url: logoPath,
        image_url: imagePath,
      }).select("id").single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Listing created");
      qc.invalidateQueries({ queryKey: ["providers"] });
      navigate({ to: "/provider/$id", params: { id: data!.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold">Register as a provider</h1>
      <p className="text-sm text-muted-foreground mt-1">Add your business so customers can find you.</p>

      <form
        onSubmit={(e) => { e.preventDefault(); submit.mutate(new FormData(e.currentTarget)); }}
        className="mt-6 space-y-4"
      >
        <div>
          <Label htmlFor="name">Business name</Label>
          <Input id="name" name="name" required maxLength={80} />
        </div>
        <div>
          <Label htmlFor="category_id">Service type</Label>
          <Select name="category_id" required>
            <SelectTrigger><SelectValue placeholder="Pick a category" /></SelectTrigger>
            <SelectContent>
              {cats.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" required />
          </div>
          <div>
            <Label htmlFor="whatsapp_number">WhatsApp</Label>
            <Input id="whatsapp_number" name="whatsapp_number" type="tel" />
          </div>
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" maxLength={200} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={4} maxLength={1000} placeholder="What services you offer, hours, experience..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="logo">Logo</Label>
            <Input id="logo" type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <Label htmlFor="photo">Cover photo</Label>
            <Input id="photo" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submit.isPending}>
          {submit.isPending ? "Creating…" : "Create listing"}
        </Button>
      </form>
    </div>
  );
}
