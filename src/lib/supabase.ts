import { createClient } from "@supabase/supabase-js";

// Same Supabase project as md-commercial. This site only reads;
// listings are created and edited in md-commercial's admin panel.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false } },
);

export const MEDIA_BUCKET = "listing-media";

/** Published lease listings, newest first. */
export async function getLeaseListings() {
  const { data, error } = await supabase
    .from("listings")
    .select("id, data, created_at")
    .eq("published", true)
    .eq("txn", "lease")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
