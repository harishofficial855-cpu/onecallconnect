# One Call Service — Full Build Plan

A mobile-first local-services app (Plumber / Electrician / Water Tank Cleaning) with Google login, provider listings, call / WhatsApp / booking actions, and booking history. Trustworthy-blue theme (#0B6BCB primary, #E8F1FB surface, #0A2540 ink).

## 1. Backend (Lovable Cloud)

Enable Lovable Cloud, then create the schema in one migration with GRANTs + RLS.

**Tables (public schema):**

- `profiles` — `id uuid PK refs auth.users`, `name`, `email`, `phone`, `profile_image`, `created_at`. Auto-created via `on_auth_user_created` trigger.
- `service_categories` — `id`, `slug`, `label`. Seeded: plumber, electrician, water-tank-cleaning. (Expandable later — answers Q2.)
- `service_providers` — `id`, `owner_id uuid refs auth.users`, `category_id`, `name`, `phone`, `whatsapp_number`, `address`, `description`, `logo_url`, `image_url`, `created_at`.
- `bookings` — `id`, `user_id`, `provider_id`, `booking_date date`, `booking_time time`, `status text default 'pending'` (pending/confirmed/cancelled/completed), `created_at`.
- `user_roles` + `app_role` enum (`admin`, `provider`, `user`) + `has_role()` security-definer function — required to keep "Who can register" flexible without privilege escalation.

**RLS policies:**

- `profiles`: user reads/updates own row.
- `service_providers`: anyone authenticated can SELECT (dashboard); INSERT/UPDATE/DELETE only by `owner_id = auth.uid()` OR admin. (Answers Q1 — any signed-in user can register, but rows are owned; admin can moderate.)
- `bookings`: user sees own bookings; provider owner sees bookings on their listing; insert requires `user_id = auth.uid()`.
- `user_roles`: read own roles; only admin writes.

**Storage buckets (public read):** `profile-images`, `provider-images`, `provider-logos`. RLS on `storage.objects`: authenticated users upload only to a folder matching their `auth.uid()`.

## 2. Auth

- Google OAuth via Lovable broker (`lovable.auth.signInWithOAuth("google", ...)`) + `supabase--configure_social_auth`.
- Email/password as secondary option.
- `/auth` route (public). Authenticated subtree under `src/routes/_authenticated/` using the integration-managed gate (`ssr: false`).
- `onAuthStateChange` wired once in `__root.tsx` (SIGNED_IN/SIGNED_OUT/USER_UPDATED only).

## 3. Routes

```
src/routes/
  __root.tsx                       (shell, providers, auth listener)
  index.tsx                        (landing → redirects signed-in users to /dashboard)
  auth.tsx                         (Google + email sign-in)
  _authenticated/
    route.tsx                      (integration-managed gate)
    dashboard.tsx                  (browse providers, category filter)
    provider.$id.tsx               (details: image/logo/name/desc/phone/WA + 3 action buttons)
    register-provider.tsx          (provider registration form w/ uploads)
    bookings.tsx                   (my booking history)
    profile.tsx                    (edit name/phone, upload avatar, logout)
```

Server functions in `src/lib/*.functions.ts`:

- `providers.functions.ts` — `listProviders`, `getProvider`, `createProvider`, `updateProvider`.
- `bookings.functions.ts` — `createBooking`, `listMyBookings`, `listProviderBookings`.
- `profile.functions.ts` — `getMyProfile`, `updateMyProfile`.

All use `requireSupabaseAuth`. Public landing uses a server publishable client only if needed (otherwise client-side).

## 4. Features per screen

- **Dashboard**: TanStack Query `useSuspenseQuery(listProviders)`; grid of cards (logo, name, category badge, phone). Category filter chips. Real-time via supabase realtime channel on `service_providers` → `queryClient.invalidateQueries(['providers'])`. (Fixes the "saved but not shown" issue.)
- **Card click**: `<Link to="/provider/$id" params={{ id }}>` — type-safe nav (fixes card-open issue, no `<a href>`).
- **Provider Details**: cover image, logo, name, description, phone, WhatsApp. Three buttons:
  - **Call Now** → `tel:` link
  - **WhatsApp** → `https://wa.me/<number>?text=...` (encoded)
  - **Book Service** → opens booking dialog (date picker + time slot — answers Q3) → `createBooking` mutation → toast confirmation → redirect to `/bookings`.
- **Register Provider**: form (zod-validated) — name, phone, WhatsApp, address, category, description, logo upload, image upload. Uploads stream to storage under `provider-logos/<uid>/...` and `provider-images/<uid>/...`, then row insert with URLs. Success toast + redirect to `/provider/$id`.
- **Profile**: avatar upload to `profile-images/<uid>/...`, editable name/phone, "My Bookings" list (date, time, provider, status), Logout (with the four-step sign-out hygiene: cancelQueries → clear → signOut → navigate replace).
- **Bookings**: full list, status badges.

## 5. UI / Design

- Trustworthy blue palette as semantic tokens in `src/styles.css`: `--primary: 0B6BCB`, `--surface: E8F1FB`, `--foreground: 0A2540`. All components use tokens — no hardcoded colors.
- Typography: Figtree (body) + Outfit (headings) via `@fontsource`.
- Mobile-first (390px). Bottom nav on `_authenticated` (Home / Bookings / Register / Profile). shadcn components: card, button, dialog, input, select, badge, sonner toaster.
- Each route declares its own `head()` meta.

## 6. Validation & Security

- All inputs validated with zod (client + server) — phone/whatsapp regex, length caps, trim.
- `encodeURIComponent` on WhatsApp prefilled text.
- Role checks via `has_role()`; never trust client.
- Run `security--run_security_scan` at the end and fix any HIGH/CRITICAL findings; update security memory.

## 7. Build Order

1. Enable Lovable Cloud + configure Google provider.
2. Migration: enum, tables, GRANTs, RLS, has_role, profile trigger, storage buckets + policies.
3. Auth route + integration-managed `_authenticated/route.tsx` + onAuthStateChange wiring.
4. Design tokens + fonts + bottom nav + app shell.
5. Server functions (providers, bookings, profile).
6. Dashboard + realtime.
7. Provider details + Call/WhatsApp/Book.
8. Register Provider form + storage uploads.
9. Profile + avatar upload + My Bookings.
10. Security scan + fixes + security memory update.

## Technical notes

- TanStack Start (no React Router), file-based routes only.
- Server fns in `src/lib/*.functions.ts` (never `src/server/`); `supabaseAdmin` only inside handler bodies if ever needed.
- Loader + `useSuspenseQuery` pattern with `defaultPreloadStaleTime: 0`.
- No `<a href>` for in-app nav; all `<Link to params>`.
- Public route loaders never call protected server fns.

Ready to implement on approval.

&nbsp;

Front end backend server data storage server network connect run it slove it fix it

Run it

Don't skip anything 