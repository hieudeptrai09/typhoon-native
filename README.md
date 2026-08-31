# Cá Tra's Typhoons App

Android and iOS app for looking up Western Pacific typhoons, covering 2000 to
now. Personal, non-commercial.

## Screens

- **Today** — the active storm or the next name up, season pace against the
  long-run average, storms that fell on today's date, a fact from the data.
- **Storms** — every named storm as a list, a record book, or stats (average
  intensity, name recurrence, season dates) grouped by year, country, position
  or category.
- **Calendar** — pick a date, see what formed, dissipated or was still running
  on it in every year on record.
- **Names** — the 140-name rotation from 14 countries plus the retired list,
  each with meaning, language, IPA, retirement reason and proposed
  replacements.
- **Search** — by storm or name, with suggestions when the spelling is off.

## Data

JMA (RSMC Tokyo) for official names and best-track, JTWC for warnings and
intensity, Wikipedia for naming history. Full credits in the app's About
screen.

## Development

React Native on Expo SDK 54. No backend of its own: screens call Supabase
PostgREST directly through `lib/data/`, and every query goes through a
`SECURITY DEFINER` function in `db/functions.sql`.

```bash
npm install
cp .env.example .env.local   # Supabase URL + publishable key
npm start
```

Metro inlines `EXPO_PUBLIC_*` at build time and EAS builds do not read
`.env.local`, so register both there before `npm run build:preview`:

```bash
eas env:create --environment preview --visibility plaintext --name EXPO_PUBLIC_SUPABASE_URL --value https://[ref].supabase.co
eas env:create --environment preview --visibility plaintext --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value sb_publishable_...
```
