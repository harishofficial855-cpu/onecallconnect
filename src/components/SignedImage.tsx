import { useEffect, useState } from "react";
import { getSignedUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function SignedImage({
  storedPath,
  alt,
  className,
  fallback,
}: {
  storedPath: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!storedPath) { setUrl(null); return; }
    getSignedUrl(storedPath).then((u) => { if (!cancelled) setUrl(u); });
    return () => { cancelled = true; };
  }, [storedPath]);
  if (!url) {
    return <div className={cn("bg-muted flex items-center justify-center text-muted-foreground text-xs", className)}>{fallback ?? alt.charAt(0).toUpperCase()}</div>;
  }
  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
