# MD Group — lease site

Marketing and lease-showing site for MD Group, modelled on the Cushman & Wakefield
"Properties for Lease" experience. Next.js 16 (App Router) + Tailwind 4.

```bash
npm install
npm run dev      # http://localhost:3000
```

## Pages

| Route | What it is |
|---|---|
| `/` | Hero search, latest listings, browse by type and locality, why MD, partners |
| `/properties/lease` | Search: keyword, type, size, All Filters dialog, map toggle, sort, pagination. All state is in the URL |
| `/properties/lease/[slug]` | Listing: gallery + video, overview, key features, details, lease terms, location map, contact panel, similar properties |
| `/contact`, `/about` | Enquiry form and company page |
| `/sitemap.xml`, `/robots.txt` | Generated from live listings |

## Data — shared with md-commercial

Listings come from the **same Supabase project** as `md-commercial`
(`src/lib/supabase.ts`, keys in `.env.local`). This site only **reads**:
published rows where `txn = 'lease'`, plus their photos from `listing_media`.
MD's team adds and edits listings in md-commercial's admin panel; pages pick up
changes within 60 seconds.

Until the database has lease rows, the six lease listings from md-commercial's
`data.js` are bundled in `src/lib/seed.ts`. A database row with the same id
(e.g. `MD-0004`) replaces its seed record.

Brand, contacts and taxonomy live in `src/lib/site.ts`.

## Enquiries

Set `NEXT_PUBLIC_WEB3FORMS_KEY` (free key from web3forms.com for
mdgroup108@gmail.com) and enquiries arrive in the inbox directly. Without it the
form opens the visitor's email app pre-filled. WhatsApp buttons work either way.

## Before launch

- Replace stock photos in `public/img/` with the developers' own images and clear
  `site.photoCredit`. Several stock shots show other brands' shopfronts.
- Lease terms, unit numbers and parking in `seed.ts` are sample values.
- Confirm the homepage copy ("Why MD Group") and stats in `site.ts` with MD.
- Set `NEXT_PUBLIC_SITE_URL` to the production domain (used for canonical URLs and the sitemap).
- Map pins use locality centres; add `lat`/`lng` to a listing for an exact pin.
