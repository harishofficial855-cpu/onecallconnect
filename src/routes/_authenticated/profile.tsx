import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { myProfileQuery } from "@/lib/queries";
import { uploadFile } from "@/lib/storage";
import { SignedImage } from "@/components/SignedImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — One Call Service" }] }),
  component: Profile,
});

function Profile() {
  const { data, isLoading } = useQuery(myProfileQuery);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (data) { setName(data.name ?? ""); setPhone(data.phone ?? ""); }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").update({ name: name.trim() || null, phone: phone.trim() || null }).eq("id", u.user.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["my-profile"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const path = await uploadFile("profile-images", u.user.id, file);
      await supabase.from("profiles").update({ profile_image: path }).eq("id", u.user.id);
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Photo updated");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleLogout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading…</div>;

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-6 flex items-center gap-4">
        <SignedImage storedPath={data?.profile_image} alt={data?.name ?? "U"} className="h-20 w-20 rounded-full object-cover bg-secondary" />
        <div>
          <p className="font-semibold">{data?.name || "—"}</p>
          <p className="text-xs text-muted-foreground">{data?.email}</p>
          <label className="text-sm text-primary font-medium cursor-pointer mt-1 inline-block">
            Change photo
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </label>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={save.isPending}>Save changes</Button>
      </form>

      <Button variant="outline" className="w-full mt-8" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" /> Sign out
      </Button>
    </div>
  );
}
