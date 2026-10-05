import type { MetadataRoute } from "next";
import { getLeaseListings, listingHref } from "@/lib/listings";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getLeaseListings();
  return [
    { url: site.url, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/properties/lease`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/about`, priority: 0.4 },
    { url: `${site.url}/contact`, priority: 0.5 },
    ...listings.map((l) => ({
      url: `${site.url}${listingHref(l)}`,
      lastModified: l.updatedAt ? new Date(l.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
