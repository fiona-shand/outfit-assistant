# Outfit Assistant

A personal phone app (PWA) for your work wardrobe:

- **Log** a photo of your outfit each day. Claude spots each piece (top, bottom, shoes, outerwear, accessories), matches it to items already in your wardrobe, and you confirm or fix the matches with a tap.
- **Style**: upload inspiration photos. Claude distils them into a written *style profile* that guides every suggestion. You can edit it.
- **Every morning at 7 a.m.** you get a push notification with an outfit suggestion. It's based on the local weather and season and your style profile, and rotates your clothes so you don't keep rewearing the same pieces.

## How suggestions work

1. Fetch today's forecast for your location from [Open-Meteo](https://open-meteo.com) (free, no key needed).
2. Filter your wardrobe by weather in code: warmth rating vs. feels-like temperature, season, and no suede or open-toe shoes on wet days.
3. Rank each item by **freshness** (days since last worn, minus a penalty for how often it was worn in the last 30 days). Pieces worn within their category's **rotation window** (Settings; defaults: tops 5 days, bottoms/shoes 3) are left out unless nothing else fits.
4. Claude picks a complete outfit (plus a backup) from the top candidates. It follows your style profile and avoids any top/bottom/shoes combination you've worn in the last 30 days. The app double-checks this and falls back to a deterministic pick if needed.

The rotation logic is pure and unit-tested in `lib/rotation.ts` and `tests/rotation.test.ts`.

## Stack

Next.js 16 (App Router) · Tailwind 4 · Supabase (Postgres + Storage + `pg_cron`) · Anthropic API (`claude-opus-5-5` by default) · Web Push · Vercel.

## Setup (about 20 minutes)

### 1. Supabase (database + photo storage + scheduler)
1. Create a free project at <https://supabase.com>.
2. **SQL Editor** → paste and run `supabase/migrations/001_init.sql`.
   Then run `003_style_profile.sql` (starter style notes from your Pinterest boards) and `004_seed_wardrobe.sql` (your first 42 pieces and 14 logged outfits).
3. **Project Settings → API**: copy the **Project URL** and the **service_role** key (keep this secret).

### 2. Keys
```bash
npx web-push generate-vapid-keys   # public + private key for notifications
openssl rand -hex 32               # AUTH_SECRET
openssl rand -hex 24               # CRON_SECRET
```
Get an Anthropic API key at <https://console.anthropic.com>.

### 3. Deploy to Vercel
1. Import this GitHub repo at <https://vercel.com/new>.
2. Add every variable from `.env.example` under **Settings → Environment Variables**.
3. Deploy, and note your URL (e.g. `https://outfit-assistant-xyz.vercel.app`).

### 4. Turn on the 7 a.m. schedule
1. In `supabase/migrations/002_cron.sql`, replace `YOUR-APP-URL` (without `https://`) and `YOUR-CRON-SECRET`.
2. Run it in the Supabase SQL Editor. Supabase then calls the app every 15 minutes. The app does the work once a day, at the first call at or after 7 a.m. in **your** timezone, so it follows daylight saving and travel automatically.

Test it any time:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://YOUR-APP-URL/api/cron/daily?force=1"
```

### 5. On your phone
1. Open your Vercel URL and sign in with `APP_PASSWORD`.
2. **iPhone:** tap Share → **Add to Home Screen**, then open the app from the home-screen icon. Push notifications only work this way on iOS (16.4+). On Android, use Chrome's *Install app* prompt.
3. **Settings** → *Use my location* → *Enable notifications* → *Send test*.
4. **Style** → add your inspiration photos (select many at once).
5. **Log** → photograph today's outfit. Do this daily; the more you log, the better the rotation gets.

## Local development
```bash
cp .env.example .env.local   # fill it in
npm install
npm run dev                  # http://localhost:3000
npm test                     # rotation/weather/date unit tests
npm run lint && npm run typecheck
```
Push notifications need HTTPS. Use `next dev --experimental-https`, or test them on the deployed app.

## Notes
- It's a single-user app with a password login. Every table has row-level security on with no policies, so only the server (service-role key) can access the data. Photos live in a **private** storage bucket and are served through 1-hour signed URLs.
- Each outfit photo costs one Claude call (a few cents on Opus). Set `ANTHROPIC_MODEL=claude-sonnet-5-5` to cut that roughly in half.
- Logging a photo for a day replaces that day's earlier log (for example, an "I'm wearing this" tap).
