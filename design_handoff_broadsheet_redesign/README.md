# Handoff: Almanac Travel — Broadsheet redesign of the Integrated Reservation System

## Overview

A redesign of the customer, supplier and admin surfaces of `Ecxlipze/Integrated-Reservation-System`, restyled onto the **Broadsheet** design system (newsprint: Source Serif 4 on paper, cyan/magenta process accents, no boxes). Also included: a faithful recreation of the UI as it exists today, so old and new can be compared side by side.

Nine screens: Hotel search, Property detail, Cart drawer, Checkout (+ biometric authorise dialog), Orders, Wallet, Referrals, Auth, Supplier operations, Admin console.

Four of these — **Orders, Wallet, Referrals, Auth** — have no code behind them today and are new work.

### Data availability for the new screens

Verified against `backend/src/routes/`. **The redesign is a frontend task: do not add backend routes for it.** Where an endpoint is missing, build the screen against the store/service boundary with seeded local data and leave a `TODO(api)` at the fetch site, so wiring later is a one-function change.

| Screen | Backing data | What to do |
| --- | --- | --- |
| **Orders** | ✗ No endpoint. Only `POST /orders/checkout` exists — there is no `GET /orders`. `Order` + `OrderItem` models exist. | Mock the list in the store. Shape it to the `Order`/`OrderItem` models so a future `GET /orders` drops in. |
| **Wallet** | ◐ Partial. `WalletTransaction` model (`amount`, `type: credit\|debit`, `description`, `relatedOrderId`, `createdAt`) and `User.walletBalance` both exist, but **no route exposes either**. | Mock balance + ledger. Map ledger rows onto `WalletTransaction` fields exactly — the model is the contract. |
| **Referrals** | ✗ Nothing. No model, no route, no code. Entirely new. | Mock code + invitations. Fraud rules named in §5.7 of the requirements doc are copy on this screen, not logic to implement. |
| **Auth** | ◐ Partial. `POST /auth/login`, `POST /auth/register`, `GET /auth/me` and all four WebAuthn routes exist. **No OTP endpoint exists.** | Wire sign-in and passkey to the real routes. The six-box OTP panel is **presentational only** — no verify call to make. |

Two further surfaces are also new, on otherwise-existing screens: the admin **Coupon liability** table (`GET /admin/analytics` does not return coupon aggregates — the `Coupon` model exists) and the supplier **stat row** (derive from the existing `GET /supplier/inventory` and `GET /supplier/bookings`).

## About the design files

`Reservation System.dc.html` is a **design reference created in HTML** — a prototype showing intended look and behaviour, not production code to copy. The task is to recreate it in the existing Next.js 16 / React 19 / Tailwind v4 / shadcn (base-ui) frontend, using that codebase's established patterns: `src/components/ui/*` primitives, zustand stores, the `(public)` / `(customer)` / `(supplier)` / `(admin)` route groups.

### Paths in this document

**Every `src/...` path below is relative to `frontend/`.** The repo root holds `backend/` and `frontend/` side by side; `src/` exists only inside `frontend/`. So `src/app/globals.css` means `frontend/src/app/globals.css`.

### Viewing the prototype

**The prototype does not open standalone.** It is an `<x-dc>` template — `{{ }}` bindings, `<sc-if>` / `<sc-for>` directives, and a `text/x-dc` script block — and it needs two runtime files that are *not* in this bundle: `./support.js` and `_ds/broadsheet-1eaf782f-6f6b-4a20-a11c-9e5ffc0d9c44/_ds_bundle.js`. Opening it in a browser gives a blank page; that is the missing runtime, not a broken file.

Read it as **source** instead — it is the authoritative reference for exact values, and every screen is delimited by an HTML comment (`<!-- SEARCH -->`, `<!-- WALLET -->`, …). The as-built recreation runs from line 52, the Almanac redesign from line 410. If you do have the `_ds` runtime, the three toggles at the top are **As built / Almanac**, **Desktop / Mobile**, and the screen picker.

## Fidelity

**High-fidelity.** Final colours, type, spacing and interactions. Recreate pixel-for-pixel using the design system's tokens. Imagery is intentionally a grey placeholder under a halftone dot screen — real photography is still outstanding.

## Implementation strategy

The redesign is a **theme swap plus new surfaces**. Do it in this order:

### 1. Replace the token layer — `src/app/globals.css`

Today `:root` is the stock shadcn neutral ramp (`--primary: oklch(0.205 0 0)`, `--radius: 0.625rem`, etc). Broadsheet replaces it:

```css
:root {
  --background: #f3f2f2;        /* paper */
  --foreground: #201e1d;        /* ink */
  --card: #eae9e9;              /* surface */
  --card-foreground: #201e1d;
  --primary: #0088b0;           /* cyan — all interactive */
  --primary-foreground: #f3f2f2;
  --secondary: #f8f4f4;
  --secondary-foreground: #444141;
  --muted: #eae7e7;
  --muted-foreground: #605d5d;
  --accent: #d6006c;            /* magenta — rare second spot */
  --accent-foreground: #f3f2f2;
  --destructive: #aa0b56;
  --border: color-mix(in srgb, #201e1d 16%, transparent);
  --input: color-mix(in srgb, #201e1d 16%, transparent);
  --ring: #0088b0;
  --radius: 0.125rem;           /* 2px — the big one */
}
```

Full ramps (use these rather than ad-hoc `color-mix`):

| Step | neutral | accent (cyan) | accent-2 (magenta) |
| --- | --- | --- | --- |
| 100 | #f8f4f4 | #e9f8ff | #fff1f4 |
| 200 | #eae7e7 | #cbeeff | #ffdee6 |
| 300 | #d7d3d3 | #99e0ff | #ffc0d0 |
| 400 | #bab6b6 | #62c5ee | #ff90b1 |
| 500 | #9b9797 | #38a6cf | #ff458e |
| 600 | #7d7979 | #1186ac | #d82071 |
| 700 | #605d5d | #006786 | #aa0b56 |
| 800 | #444141 | #004961 | #790e3d |
| 900 | #2d2b2b | #0a303e | #4b1528 |

Process yellow `#edbb00` is a print-treatment colour only — never interface chrome.

Spacing scale (density 1.25×): 5 / 10 / 15 / 20 / 30 / 40 px. Radius: 1 / 2 / 4 px. Shadows: `0 1px 2px`, `0 3px 10px`, `0 12px 32px` of `#2d2b2b` at 14/16/22%.

**Which system owns which token.** `styles.css` is the design system's own sheet and uses its own names (`--color-accent`, `--space-4`, `--radius-md`); the app is Tailwind v4 and expects shadcn names (`--primary`, `--border`, `--radius`). Do **not** link `styles.css` into the app — port its values into `globals.css` and drive everything through Tailwind:

- **Colour** — the `:root` block above, plus the three ramps registered in `@theme inline` as `--color-accent-{100..900}` and `--color-accent-2-{100..900}` so `text-accent-700` / `bg-accent-100` work as utilities.
- **Spacing** — the 1.25× scale is Tailwind's existing `1/2/3/4/6/8` steps at 5px base. Set `--spacing: 5px` in `@theme` and then `p-2` = 10px, `gap-4` = 20px, `gap-8` = 40px, matching the scale exactly. Use these utilities, not arbitrary values.
- **The many one-off px values in the screen specs** (44px headings, 22px row padding, 130px plates) are deliberate editorial sizes, not scale steps. Arbitrary values (`text-[44px]`) are correct for those — the "never hard-code" rule applies to *tokens*, i.e. colour, spacing, radius and shadow.

### 2. Replace the typeface — `src/app/layout.tsx`

Drop `Geist` / `Geist_Mono` from `next/font/google` and load `Source_Serif_4` (weights 300–700, plus the true italic at body weight) as `--font-sans`. **Do not introduce a sans-serif for UI chrome — the serif is the chrome.** Monospace is retained only for reference IDs.

### 3. Restyle the shadcn primitives

- **`button.tsx`** — `rounded-lg` → `rounded-[2px]`; `default` variant becomes cyan fill (`bg-primary text-primary-foreground`, hover `#1186ac`, active `#006786`); `outline` keeps a 1px `--border` hairline; `ghost` becomes cyan text with a 10% cyan hover tint. Heights: default 36px, not 32px (the 1.25× density).
- **`card.tsx`** — currently `rounded-xl` + `ring-1`. In Broadsheet, **cards are only for genuinely discrete listings, never layout**. Most current `<Card>` usages (checkout summary, admin KPI tiles, supplier tables) should be **unwrapped** into plain sections separated by whitespace and a single hairline rule. Where a card survives, it is `bg-card` (#eae9e9), 2px radius, no ring.
- **`badge.tsx`** — `rounded-4xl` → 1.5px radius; variants map to `.tag-accent` (#e9f8ff on #004961), `.tag-accent-2` (#fff1f4 on #790e3d), `.tag-neutral` (#f8f4f4 on #444141).
- **`input.tsx`** — 36px min-height, 6px/10px padding, 2px radius, `--card` fill, cyan caret, hover border 45% ink, focus border cyan with `outline-offset: 0`.
- **`table.tsx`** — uppercase 11px header with 0.08em tracking at 60% ink; row rule at 8% ink; row hover at 4% ink.
- **`tabs.tsx`** — the pill `TabsList` becomes the segmented control: a 1px-bordered inline-flex, options 7px/12px at 13px, selected option a solid cyan fill with paper text, dividers between options.
- **`dialog.tsx`** — backdrop `#2d2b2b` at 50%, panel `--card` at 4px radius with `0 12px 32px` shadow, 20px title in the serif.

Global focus ring everywhere: `:focus-visible { outline: 2px solid #0088b0; outline-offset: 2px; }`.

### Cyan on paper — which step to use

`#0088b0` on paper measures ~3:1: enough for **large text, icons and interface chrome**, not for small text. The kickers this document specifies at 11.5px (Refine, Verify, the role kickers, "Wallet balance") are small text, so set them in **`#006786`** (accent-700), which clears 4.5:1 on paper. Same rule for the 12–13px cyan meta and any accent-coloured body copy. Reserve `#0088b0` itself for button fills, focus rings, larger interactive text (14px+) and rules.

### 4. Rework the layouts

**`(public)/layout.tsx`** — replace the 64px sticky bordered header with the broadsheet masthead:

- Brand "Almanac Travel", 34px serif 600, flush left; "Sign in" and "Cart (n)" flush right, baseline-aligned with the brand.
- **3px solid ink rule**, then a dateline rail: 11.5px uppercase 0.09em tracking at #605d5d, three items — date left ("Tuesday, 11 August 2026"), categories centre ("Flights · Bus · Hotels · Hostels · Tours"), issue right ("Est. 2026 · No. 118") — then a **1px ink rule**. This thick–thin pair is the system's one sanctioned use of rules.

  The date in the prototype is the date it was drawn. **Compute it** (`en-GB`, `weekday/day/month/year`) — but do it in a server component, or the server/client render disagree and React throws a hydration mismatch. "Est. 2026" is fixed brand furniture; the issue number is decorative — derive it from the day-of-year so it advances on its own rather than hard-coding 118.
- Section nav below: Hotels / Reservations / Wallet / Referrals / Supplier / Admin, 14px, current item cyan.
- Page padding 40px desktop, 18px mobile.

**`(customer)` / `(supplier)` / `(admin)` layouts** — drop the tinted body backgrounds (`bg-gray-50`, `bg-slate-50`, `bg-zinc-100`) and the coloured role headings (`text-blue-600`). Every surface is paper. Role is communicated by a cyan uppercase kicker above the page title, not by a background colour.

### 5. Screen-by-screen

#### Hotel search — `(public)/search/page.tsx`

Layout: two columns, `250px | 1fr`, 40px gap. Collapses to one column on mobile.

*Left rail*: cyan uppercase 11.5px "Refine" kicker, then fields — Destination, Check in / Check out (side by side), Guests, Min / Max price (side by side), a "Board" radio group (Any / Breakfast included / Free cancellation), and a full-width primary "Apply".

*Results*: h1 at 44px, line-height 1.02, tracking -0.015em, flush left — "Hotels in Lisbon". Sort segmented control (Recommended / Price / Rating) baseline-aligned right. A 15px #605d5d standfirst line beneath.

**Result rows replace the card grid.** Each row is a 3-column grid `180px | 1fr | 160px`, 22px gap, 22px vertical padding, separated by a 1px 16%-ink top border — no card, no shadow, no image-on-top layout:

- Col 1: 130px-tall halftone plate, grey #c9c7c2, with a 10px uppercase "Plate" label bottom-left.
- Col 2: hotel name 26px serif; rating in cyan and review count in #7d7979 on the same baseline; place in **italic** 15px #605d5d; a 14.5px blurb at `max-width: 52ch` with `text-wrap: pretty`; amenity tags below.
- Col 3: right-aligned — "From" kicker, price at 38px 600 line-height 0.9, "per night" at 12px, then a secondary "View rooms" button.

Whole row is the click target to the property page.

#### Property detail — `(public)/product/[category]/[id]/page.tsx`

Ghost back-link "← All hotels in {city}". Two columns `1fr | 300px`, 46px gap; the right rail is `position: sticky; top: 80px` with a 22px left padding and a 1px left hairline.

*Main*: cyan uppercase kicker "Hotel · {city}"; h1 at **58px**, line-height 0.98, tracking -0.02em; italic 18px subtitle combining place, rating and review count. Hero halftone plate 320px tall, then a 3-up strip of 92px plates. An 18px lede paragraph at `max-width: 60ch`.

Then three sections separated by whitespace, each headed by a 13px uppercase 0.1em #605d5d label:

- **Rooms** — a table: Room / Sleeps / Board / Cancellation / Per night (right, 17px) / Select button. Three rows: Standard Queen (base rate), Garden Twin (+$22, breakfast), Corner Suite (+$84, sleeps 3, non-refundable).
- **Amenities** — cyan tags.
- **House rules** — a 2-col grid of label/value pairs: check in from 15:00, check out until 11:00, free cancellation to 48h, supplier name.

*Rail*: "Your stay" kicker, dates and occupancy, price at 46px, total for the stay, primary "Add to cart", secondary "Reserve now", and a 12.5px reassurance line.

#### Cart drawer — `components/cart/CartDrawer.tsx`

Right sheet, `min(420px, 100%)`, paper fill, 26px padding, shadow `-12px 0 32px rgba(45,43,43,.22)`. Title "Your cart" 26px; subline "Held for 20 minutes. Rates are not guaranteed after that." Rows separated by 12%-ink rules: name 17px 600, dates 13px #7d7979, a magenta ghost "Remove". Footer: hairline, Total (label 15px / figure 30px 600), primary "Checkout", secondary "Keep looking". Empty state is one line of 15px #7d7979 — no icon.

#### Checkout — `(customer)/checkout/page.tsx` + `components/checkout/CheckoutFlow.tsx`

h1 48px, standfirst below. Two columns `1fr | 300px`, 46px gap; the right rail is the price breakdown behind a 1px left hairline (**not** a card).

*Left*: a borderless line-item table — 70px halftone thumb, name 18px 600 with a 13px meta line (type · dates · guests · ref), price right at 17px, magenta ghost "Remove". Then "Lead traveller" — a 2-col field grid (first, last, email, phone) and a full-width "Special requests" textarea.

*Rail*: "Price breakdown" kicker, room subtotal, taxes & fees, coupon line in magenta when applied, hairline, Total with the figure at 34px 600. Promo input + secondary Apply. Primary "Pay with wallet", then a 12.5px line stating the wallet balance.

**Authorise dialog** (replaces the pulsing-fingerprint dialog): title "Authorise payment", body "Confirm ${total} from your Almanac wallet using this device's biometrics.", a 96px circle outlined 2px cyan whose label cycles **Touch → Reading → Approved** (11px uppercase, 0.1em), and right-aligned actions Cancel (secondary) / Authorise payment (primary). Keep the existing `triggerBiometricAuth(token)` WebAuthn call from `lib/webauthn.ts`; on success clear the cart and route to `/orders`.

#### Orders — NEW, `(customer)/orders/page.tsx`

h1 48px "Your reservations", standfirst "Upcoming first. Vouchers are issued once the supplier confirms." Rows in a 5-column grid `90px | 1fr | 140px | 100px | 200px`, 20px vertical padding, 1px 16%-ink top rule:

reference (12px mono #7d7979) · name 22px 600 + italic place/dates line · status tag · total 20px 600 right · actions (secondary "Voucher", ghost "Manage").

Status tags: Confirmed = cyan tag; Awaiting supplier / Completed = neutral tag; Refunded = magenta tag.

#### Wallet — NEW, `(customer)/wallet/page.tsx`

Two columns `1fr | 300px`, 46px gap.

*Left*: cyan uppercase "Wallet balance", then the balance as a **process-plate numeral at 96px 600** — the `.cmyk-num` construction (see below). A 15px explainer at `max-width: 44ch` ("Credits from referrals, refunds and goodwill adjustments. Spendable at checkout on any product; not withdrawable."), then primary "Top up" and secondary "Statement".

*Right*: "Ledger" table — Date / Entry / Amount (right, cyan-700 for credits, magenta-700 for debits) / Balance (right). Entries reference referral rewards, refund adjustments, order applications and goodwill credits.

#### Referrals — NEW, `(customer)/referrals/page.tsx`

Two columns. Left: h1 52px "Give $20, get $20", an 18px explainer at `max-width: 46ch`, the referral code as a **64px plate numeral**, then Copy link (primary) / Email invite / Share (secondary). Right: "Invitations" table — Friend / Sent / Status tag / Reward — plus a 12.5px fraud note ("Credit is released after the referee's first completed stay. Self-referral and duplicate devices are rejected automatically."), matching the fraud controls in §5.7 of the requirements doc.

#### Auth — NEW, `(public)/login/page.tsx` + register/OTP

Two columns. Left, `max-width: 420px`: h1 44px "Sign in", a 15px line offering registration, email/phone and password fields, primary "Sign in", an **or** divider (hairline / 11.5px uppercase / hairline), then secondary "Use a one-time code" and "Sign in with a passkey". A 12.5px session-security note.

Right: cyan "Verify" kicker, a 15px line naming the destination, then six 52×64px OTP boxes (30px figures, `--card` fill, 1px hairline, 2px radius), primary "Verify" and a ghost "Resend in 0:24".

The boxes are `<div>`s in the prototype because it is a static drawing. **Build them as real `<input>`s** — `inputMode="numeric"`, `autoComplete="one-time-code"` on the first, `maxLength={1}`, an `aria-label` per box, advancing focus on entry and retreating on backspace. As noted above there is no OTP endpoint, so "Verify" has nothing to call; keep the panel presentational but make it keyboard-usable.

#### Supplier — `(supplier)/supplier/page.tsx`

Cyan kicker "Supplier · {company}", h1 44px "Operations", segmented control (Inventory / Booking queue) baseline-right.

A 3-up stat row above the table — label 11.5px uppercase, figure 36px 600, 12.5px note: Rooms live · Occupancy (next 30 nights) · Awaiting confirmation (with age of oldest).

*Inventory* table: Property / Type / Rooms / Rate / Occupancy / Status tag / ghost "Edit rates".
*Booking queue* table: Reference (mono) / Property / Guest / Dates / Amount right / magenta Pending tag / primary "Confirm". Wire Confirm to the existing `POST /supplier/bookings/:orderItemId/confirm` — note the parameter is the **order-item** id, not an order id.

#### Admin — `(admin)/admin/page.tsx`

h1 44px, segmented control (Analytics / Suppliers), standfirst naming the window ("Trailing thirty days to …").

*Analytics*: three KPIs as **54px plate numerals** with an 11.5px uppercase label above and a 12.5px note below — GMV, Total orders, Wallet liabilities. No KPI cards. Below, two tables side by side:
- **Bookings by supplier** — Supplier / Bookings right / a 9px solid cyan bar scaled to the leader, occupying a 45% column.
- **Coupon liability** — Code (mono) / Rule / Redeemed / Liability. This is new surface, backed by §5.8 of the requirements doc.

*Suppliers*: Supplier / Registration (mono) / Properties / Status tag / Approve (cyan button) or a muted "Active" label.

## The plate numeral (`.cmyk-num`)

Used on three screens — wallet balance (96px), referral code (64px), admin KPIs (54px) — and it is the most unusual construction in the design, so build it once as a shared component.

It is a paper-coloured span carrying the real text, plus **three** `mix-blend-mode: multiply` repeats in cyan, magenta and yellow, nudged sub-em out of register. There is no black plate: the dark core is the C×M×Y multiply overlap. Exact markup:

```html
<span class="cmyk-num" style="font-size:96px;font-weight:600;display:inline-block">
  <span class="paper">$248.50</span>
  <span class="plate plate-c" aria-hidden="true">$248.50</span>
  <span class="plate plate-m" aria-hidden="true">$248.50</span>
  <span class="plate plate-y" aria-hidden="true">$248.50</span>
</span>
```

All four spans carry identical text. Only `.paper` is in the accessibility tree; the three plates are `aria-hidden`. The offsets are em-scaled, so it works at any size.

Two notes:

- **The pointer-lean is optional.** `--press-nx` / `--press-ny` are published by `print-plates.js`, which is **not in this bundle**. They default to `0`, so the plates render statically at their base offsets — that is the expected fallback, not a missing dependency to chase.
- **`text-box: trim-both cap alphabetic` is Chromium-only.** Where it is unsupported the plates sit a half-leading low. Acceptable degradation; do not fight it with per-browser hacks.

## Interactions & behaviour

- Search row click → property page. "View rooms" is a secondary affordance on the same target.
- "Add to cart" and room "Select" push to the zustand cart and open the drawer. "Reserve now" adds and goes straight to checkout.
- Coupon Apply is currently mocked at 15% of subtotal; keep the real `POST /coupons/validate` call and show the applied code on the discount line.
- Authorise: idle → verifying (~900ms) → success, then clear cart and route to Orders after ~1.1s. Preserve the WebAuthn failure path — show the error in magenta inside the dialog.
- Hover: cyan fills darken to #1186ac, pressed #006786; secondary/ghost take a 7–10% tint. Focus-visible is the 2px cyan ring everywhere.
- Responsive: below ~760px every multi-column grid collapses to one column; the sticky property rail becomes a normal block; the stat rows go 2-up.

## State

Unchanged from today's zustand stores — `cartStore` (items, add, remove, clear, total) and `authStore` (token, role). New screens need: orders list, wallet balance + ledger, referral code + invitation list. Coupon code, discount amount and payment status (`idle | verifying | success | failed`) stay local to checkout.

## Assets

- **Fonts**: Source Serif 4 (Google Fonts), weights 300–700 with true italic.
- **Icons**: the design system specifies **Phosphor, duotone weight** (phosphoricons.com). The redesign is near-iconless by intent — the serif is the chrome. Replace lucide-react only where an icon genuinely survives.
- **Imagery**: none. Every image is a grey (#c9c7c2) block under the `.halftone` dot screen — a 3px radial-gradient dot pattern at `mix-blend-mode: multiply`, with `grayscale(0.35) contrast(1.15)` on the element. Real photography is outstanding; when it lands, interface imagery keeps `.halftone` and editorial/hero imagery can take the four-plate `.cmyk` treatment.

## Naming

The prototype renames the product from **Antigravity Travel** to **Almanac Travel** (hard-coded today in `(public)/layout.tsx`). This was a placeholder pick — confirm before shipping.

## Files in this bundle

- `Reservation System.dc.html` — the prototype. Toggles: As built / Almanac, Desktop / Mobile, and the nine screens.
- `styles.css` — the Broadsheet stylesheet. The token block at the top is the source of truth for every value in this document; the component layer below it (`.btn`, `.input`, `.table`, `.seg`, `.tag`, `.card`, `.dialog`, `.halftone`, `.cmyk-num`) is what the shadcn primitives should be restyled to match.
- `broadsheet-readme.md` — the design system's own guide: direction, colour, type, do's and don'ts.
