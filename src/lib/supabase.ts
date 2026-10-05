import { createClient } from "@supabase/supabase-js";

// Same Supabase project as md-commercial. This site only reads;
// listings are created and edited in md-commercial's admin panel.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false } },
);

export const MEDIA_BUCKET = "listing-media";

export const publicMediaUrl = (path: string) =>
  supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
