# Carrier Pigeon Post

A whimsical cross-platform messaging experience that treats every text like a handwritten letter sent by pigeon. Built with Expo (React Native + TypeScript) so it runs on iOS, Android, and the web (PWA). Messages take real time to "fly", and you can watch each pigeon glide across a stylized world map while delivery progress updates.

## Features

- Email + password auth with Supabase, including profile onboarding with a searchable home loft picker
- Inbox and outbox views with delivery progress, distance, and estimated arrival time
- Compose screen with courier speed selection and automatic long-haul delivery timing
- Live flight tracker that animates each pigeon on a world map using real lat/lon coordinates
- React Query powered caching + background refresh, plus optimistic delivery status updates

## Tech Stack

- Expo (React Native 0.81) + TypeScript
- React Navigation 7 (native stack + bottom tabs)
- Supabase (Auth + Postgres) as the backend/database
- @tanstack/react-query for server state, Zustand for local selection state
- react-native-svg handcrafted map visuals

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   - Copy `.env.example` to `.env` (or `.env.local`) and fill in your Supabase credentials:
     ```env
     EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     EXPO_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
     ```
   - Expo automatically exposes variables prefixed with `EXPO_PUBLIC_` to the client.
3. **Run the app**
   ```bash
   npm run start   # choose iOS, Android, or Web from the Expo menu
   ```
   - `npm run android` / `npm run ios` will open the appropriate simulator (iOS requires macOS).
   - `npm run web` serves the PWA build; installable headers come from Expo's defaults.

## Supabase Setup

1. Create a new Supabase project (free tier works).
2. In SQL Editor, run the contents of [`supabase/schema.sql`](supabase/schema.sql) to create tables and row-level security policies (includes the new home location columns).
3. In **Authentication ? Providers**, ensure Email is enabled.
   - Optional: disable "Confirm email" for easier testing, or keep it enabled and confirm via email link.
4. In **Project Settings ? API**, copy the project URL and anon public key into your `.env` file.
5. (Optional) Set up a scheduled function or cron to mark messages as delivered server-side after `arrival_time`. The client already performs this check every 30 seconds and updates status via `markDelivered`.

### Data Model

- `profiles`
  - Mirrors Supabase auth users (`id` matches `auth.users.id`)
  - Stores `display_name` plus `home_location_id`, `home_location_label`, `home_location_latitude`, `home_location_longitude`, and an optional `home_location_country_code`
  - Existing demo locations are kept in `src/constants/locations.ts` purely as a legacy fallback for older accounts
- `messages`
  - Links sender and recipient profile IDs
  - Stores letter body, pigeon name, flight metadata (distance, speed, departure, arrival, status)

Row Level Security policies restrict reads, inserts, and updates to the participating users.

## Location Search & Geocoding

- Location search is powered by the Mapbox Geocoding API.
- Supply `EXPO_PUBLIC_MAPBOX_TOKEN` to enable type-ahead search when onboarding or editing a profile.
- Selected places persist their lat/lon coordinates on the profile so journeys can be computed anywhere in the world.

## Project Structure

```
src/
  App.tsx                  # Provider wiring + root navigator
  components/              # Reusable UI, layout, map, and location search widgets
  constants/               # Legacy location seeds retained for backwards compatibility
  hooks/                   # React Query hooks (messages, contacts, location search)
  navigation/              # Stack + tab navigators and types
  providers/               # Auth provider (Supabase session + profile)
  screens/                 # Auth, messaging, map, profile screens
  services/                # Supabase client + table helpers + geocoding
  store/                   # Zustand store for selected flight
  utils/                   # Geo math, time formatting, and profile location helpers
supabase/schema.sql        # Database schema + RLS policies
.env.example               # Environment variable template
```

## Delivery Simulation Notes

- Flight distance uses the haversine formula based on the stored latitude/longitude for each profile.
- Courier speed is selectable (40/65/90 km/h); an extra 4-hour buffer is added so deliveries feel meaningfully slow.
- Progress updates every minute via React Query polling. When the client notices a pigeon has reached its destination it marks the message as `delivered` in Supabase.
- If a profile is missing coordinates the compose screen will prompt the user to pick a roost before dispatching a pigeon.

## Next Steps / Ideas

1. Add push notifications via Expo Notifications when a pigeon lands.
2. Allow custom handwritten fonts or stylus input for message bodies.
3. Introduce cooperative events (e.g., storms) where multiple pigeons reroute in real time.
4. Deploy a lightweight edge function in Supabase to finalize deliveries when `arrival_time` is reached.

Happy flying!
