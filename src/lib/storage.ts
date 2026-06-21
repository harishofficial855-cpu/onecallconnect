import { supabase } from "@/integrations/supabase/client";

export type BucketName = "profile-images" | "provider-images" | "provider-logos";

export async function uploadFile(bucket: BucketName, userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  return `${bucket}/${path}`;
}

// stored value is "bucket/path"; return a signed URL (1h)
export async function getSignedUrl(stored: string | null | undefined): Promise<string | null> {
  if (!stored) return null;
  const idx = stored.indexOf("/");
  if (idx < 0) return null;
  const bucket = stored.slice(0, idx);
  const path = stored.slice(idx + 1);
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}
