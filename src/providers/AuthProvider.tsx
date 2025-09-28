import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabaseClient";
import type { ProfileRow } from "@/types/database";
import { DEFAULT_LEGACY_LOCATION, getLegacyLocationById } from "@/constants/locations";
import type { LocationSelection } from "@/types/location";

export type HomeLocationInput = Omit<LocationSelection, "description"> & { description?: string };

interface AuthContextValue {
  session: Session | null;
  profile: ProfileRow | null;
  isLoading: boolean;
  signIn: (params: { email: string; password: string }) => Promise<{ error?: string }>;
  signUp: (
    params: {
      email: string;
      password: string;
      displayName: string;
      location: HomeLocationInput;
    }
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEFAULT_FALLBACK_LOCATION: HomeLocationInput | null = DEFAULT_LEGACY_LOCATION
  ? {
      placeId: DEFAULT_LEGACY_LOCATION.id,
      label: DEFAULT_LEGACY_LOCATION.name,
      description: DEFAULT_LEGACY_LOCATION.description,
      latitude: DEFAULT_LEGACY_LOCATION.latitude,
      longitude: DEFAULT_LEGACY_LOCATION.longitude,
    }
  : null;

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function resolveLocationFromMetadata(metadata: Record<string, unknown>): HomeLocationInput | null {
  const placeId = (metadata.home_location_id as string) ?? (metadata.home_location_place_id as string) ?? null;
  const label = (metadata.home_location_label as string) ?? null;
  const description = (metadata.home_location_description as string) ?? null;
  const latitude = toNumber(metadata.home_location_latitude);
  const longitude = toNumber(metadata.home_location_longitude);
  const countryCode = (metadata.home_location_country_code as string) ?? null;

  if (latitude != null && longitude != null) {
    return {
      placeId: placeId ?? `${latitude},${longitude}`,
      label: label ?? placeId ?? "Pinned loft",
      description: description ?? label ?? placeId ?? "Pinned loft",
      latitude,
      longitude,
      countryCode,
    };
  }

  if (placeId) {
    const legacy = getLegacyLocationById(placeId);
    if (legacy) {
      return {
        placeId: legacy.id,
        label: label ?? legacy.name,
        description: description ?? legacy.description,
        latitude: legacy.latitude,
        longitude: legacy.longitude,
        countryCode,
      };
    }
  }

  return null;
}

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ProfileRow | null;
}

async function ensureProfile(session: Session): Promise<ProfileRow> {
  const user = session.user;
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const email = user.email ?? "";
  const displayName = (metadata.display_name as string) ?? email.split("@")[0] ?? "Courier";

  let location = resolveLocationFromMetadata(metadata);

  if (!location && metadata.home_location_id) {
    location = resolveLocationFromMetadata({ home_location_id: metadata.home_location_id });
  }

  if (!location) {
    location = DEFAULT_FALLBACK_LOCATION;
  }

  const homeLocationId = location?.placeId ?? DEFAULT_FALLBACK_LOCATION?.placeId ?? "nyc";

  const upsertPayload = {
    id: user.id,
    email,
    display_name: displayName,
    home_location_id: homeLocationId,
    home_location_label: location?.description ?? location?.label ?? null,
    home_location_latitude: location?.latitude ?? null,
    home_location_longitude: location?.longitude ?? null,
    home_location_country_code: location?.countryCode ?? null,
  } satisfies Partial<ProfileRow> & { id: string; email: string; display_name: string; home_location_id: string };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(upsertPayload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  const profile = data as ProfileRow;

  if ((!profile.home_location_latitude || !profile.home_location_longitude) && profile.home_location_id) {
    const legacy = getLegacyLocationById(profile.home_location_id);
    if (legacy) {
      const { data: updated } = await supabase
        .from("profiles")
        .update({
          home_location_label: profile.home_location_label ?? legacy.description,
          home_location_latitude: legacy.latitude,
          home_location_longitude: legacy.longitude,
        })
        .eq("id", profile.id)
        .select("*")
        .single();

      if (updated) {
        return updated as ProfileRow;
      }
    }
  }

  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }

    let isActive = true;
    setIsLoading(true);

    (async () => {
      try {
        const existingProfile = await fetchProfile(session.user.id);
        let ensuredProfile = existingProfile;

        if (!existingProfile) {
          ensuredProfile = await ensureProfile(session);
        } else if (!existingProfile.home_location_latitude || !existingProfile.home_location_longitude) {
          ensuredProfile = await ensureProfile(session);
        }

        if (isActive) {
          setProfile(ensuredProfile ?? null);
        }
      } catch (error: any) {
        console.warn("Failed to resolve profile", error.message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [session]);

  const signIn: AuthContextValue["signIn"] = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signUp: AuthContextValue["signUp"] = async ({ email, password, displayName, location }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          home_location_id: location.placeId,
          home_location_label: location.description ?? location.label,
          home_location_latitude: location.latitude,
          home_location_longitude: location.longitude,
          home_location_country_code: location.countryCode ?? null,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    const userId = data.user?.id;

    if (!userId) {
      return { error: "No user returned from sign up." };
    }

    if (data.session) {
      try {
        await ensureProfile(data.session);
      } catch (profileError: any) {
        console.warn("Failed to create profile immediately after sign up", profileError.message);
      }
    }

    await refreshProfile();
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!session?.user?.id) return;
    try {
      const profileData = await fetchProfile(session.user.id);
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error: any) {
      console.warn("Failed to refresh profile", error.message);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({ session, profile, isLoading, signIn, signUp, signOut, refreshProfile }),
    [session, profile, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
