import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase.from("service_categories").select("*").order("label");
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});

export const providersQuery = (categoryId: string | null) =>
  queryOptions({
    queryKey: ["providers", categoryId],
    queryFn: async () => {
      let q = supabase
        .from("service_providers")
        .select("*, service_categories(slug,label)")
        .order("created_at", { ascending: false });
      if (categoryId) q = q.eq("category_id", categoryId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const providerQuery = (id: string) =>
  queryOptions({
    queryKey: ["provider", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*, service_categories(slug,label)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Provider not found");
      return data;
    },
  });

export const myBookingsQuery = queryOptions({
  queryKey: ["my-bookings"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, service_providers(id,name,phone,logo_url,category_id,service_categories(label))")
      .order("booking_date", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const myProfileQuery = queryOptions({
  queryKey: ["my-profile"],
  queryFn: async () => {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) throw new Error("Not signed in");
    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (error) throw error;
    return data;
  },
});
