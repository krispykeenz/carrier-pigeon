import type { Session, User } from '@supabase/supabase-js';
import type { MessageRow, ProfileRow } from '@/types/database';

const DEMO_MODE_FLAG = 'true';
const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === DEMO_MODE_FLAG;

type AuthListener = (event: string, session: Session | null) => void;

type DemoStore = {
  session: Session | null;
  profiles: ProfileRow[];
  messages: MessageRow[];
  authListeners: Set<AuthListener>;
};

function nowIso(): string {
  return new Date().toISOString();
}

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function createDemoUser(params?: { id?: string; email?: string; displayName?: string; metadata?: Record<string, unknown> }): User {
  const id = params?.id ?? 'demo-user-1';
  const email = params?.email ?? 'demo@carrierpigeon.post';
  const displayName = params?.displayName ?? 'Demo Courier';

  return {
    id,
    aud: 'authenticated',
    role: 'authenticated',
    email,
    phone: '',
    created_at: nowIso(),
    app_metadata: {},
    user_metadata: {
      display_name: displayName,
      // Provide a fallback loft for ensureProfile().
      home_location_id: 'nyc',
      ...params?.metadata,
    },
  } as any;
}

function createDemoSession(user: User): Session {
  return {
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    expires_in: 60 * 60,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    token_type: 'bearer',
    user,
  } as any;
}

function seedStore(): DemoStore {
  const demoUser = createDemoUser();
  const session = createDemoSession(demoUser);

  const profiles: ProfileRow[] = [
    {
      id: demoUser.id,
      email: demoUser.email ?? 'demo@carrierpigeon.post',
      display_name: (demoUser.user_metadata as any)?.display_name ?? 'Demo Courier',
      home_location_id: 'nyc',
      home_location_label: 'New York City, USA',
      home_location_latitude: 40.7128,
      home_location_longitude: -74.006,
      home_location_country_code: 'US',
      created_at: nowIso(),
    },
    {
      id: 'demo-user-2',
      email: 'london@carrierpigeon.post',
      display_name: 'Loftmaster London',
      home_location_id: 'ldn',
      home_location_label: 'London, United Kingdom',
      home_location_latitude: 51.5072,
      home_location_longitude: -0.1276,
      home_location_country_code: 'GB',
      created_at: nowIso(),
    },
    {
      id: 'demo-user-3',
      email: 'tokyo@carrierpigeon.post',
      display_name: 'Tokyo Roost',
      home_location_id: 'tko',
      home_location_label: 'Tokyo, Japan',
      home_location_latitude: 35.6762,
      home_location_longitude: 139.6503,
      home_location_country_code: 'JP',
      created_at: nowIso(),
    },
  ];

  const messages: MessageRow[] = [
    {
      id: 'm_demo_1',
      sender_id: 'demo-user-2',
      recipient_id: demoUser.id,
      title: 'A note from London',
      body: 'Your next courier leaves at dawn. The winds look favorable.',
      created_at: hoursFromNow(-10),
      departure_time: hoursFromNow(-9),
      arrival_time: hoursFromNow(-1),
      status: 'delivered',
      distance_km: 5570,
      pigeon_speed_kmh: 65,
      pigeon_name: 'Hazel',
    },
    {
      id: 'm_demo_2',
      sender_id: demoUser.id,
      recipient_id: 'demo-user-3',
      title: 'Across the Pacific',
      body: 'Sending a holiday greeting from my loft — safe travels, little pigeon.',
      created_at: hoursFromNow(-4),
      departure_time: hoursFromNow(-3.5),
      arrival_time: hoursFromNow(5.5),
      status: 'in_flight',
      distance_km: 10840,
      pigeon_speed_kmh: 90,
      pigeon_name: 'Marble',
    },
    {
      id: 'm_demo_3',
      sender_id: 'demo-user-3',
      recipient_id: demoUser.id,
      title: 'Tokyo says hello',
      body: 'A warm greeting from the neon skies. Your pigeon should arrive soon.',
      created_at: hoursFromNow(-2),
      departure_time: hoursFromNow(-2),
      arrival_time: hoursFromNow(2),
      status: 'in_flight',
      distance_km: 10840,
      pigeon_speed_kmh: 65,
      pigeon_name: 'Saffron',
    },
  ];

  return {
    session,
    profiles,
    messages,
    authListeners: new Set<AuthListener>(),
  };
}

const store: DemoStore = seedStore();

function notifyAuth(event: string, session: Session | null) {
  for (const listener of store.authListeners) {
    try {
      listener(event, session);
    } catch {
      // ignore demo listener errors
    }
  }
}

type OrderOptions = { ascending?: boolean };

type QueryMode = 'many' | 'single' | 'maybeSingle';

type TableName = 'profiles' | 'messages';

type EqFilter = { column: string; value: any };

class DemoQueryBuilder implements PromiseLike<{ data: any; error: any }> {
  private action: 'select' | 'insert' | 'update' | 'upsert' = 'select';
  private returning = false;
  private mode: QueryMode = 'many';
  private filters: EqFilter[] = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private payload: any = null;

  constructor(private table: TableName) {}

  select(_columns: string = '*') {
    this.returning = true;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, options?: OrderOptions) {
    this.orderBy = {
      column,
      ascending: options?.ascending ?? true,
    };
    return this;
  }

  insert(payload: any) {
    this.action = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.action = 'update';
    this.payload = payload;
    return this;
  }

  upsert(payload: any, _options?: any) {
    this.action = 'upsert';
    this.payload = payload;
    return this;
  }

  single() {
    this.mode = 'single';
    return this;
  }

  maybeSingle() {
    this.mode = 'maybeSingle';
    return this;
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled as any, onrejected as any);
  }

  private applyFilters<T extends Record<string, any>>(rows: T[]): T[] {
    return rows.filter((row) => this.filters.every((f) => row[f.column] === f.value));
  }

  private applyOrder<T extends Record<string, any>>(rows: T[]): T[] {
    if (!this.orderBy) return rows;
    const { column, ascending } = this.orderBy;
    const sorted = [...rows].sort((a, b) => {
      const av = a[column];
      const bv = b[column];
      if (av === bv) return 0;
      return av > bv ? 1 : -1;
    });
    return ascending ? sorted : sorted.reverse();
  }

  private formatResult(rowsOrRow: any): { data: any; error: any } {
    if (this.mode === 'many') {
      return { data: rowsOrRow, error: null };
    }

    const rows = Array.isArray(rowsOrRow) ? rowsOrRow : rowsOrRow ? [rowsOrRow] : [];

    if (rows.length === 0) {
      if (this.mode === 'maybeSingle') {
        return { data: null, error: null };
      }
      return { data: null, error: new Error('Row not found (demo)') };
    }

    return { data: rows[0], error: null };
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      if (this.table === 'profiles') {
        return this.executeProfiles();
      }
      if (this.table === 'messages') {
        return this.executeMessages();
      }
      return { data: null, error: new Error(`Unknown table ${this.table} (demo)`) };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  private executeProfiles(): { data: any; error: any } {
    if (this.action === 'select') {
      const filtered = this.applyOrder(this.applyFilters(store.profiles));
      return this.formatResult(this.mode === 'many' ? filtered : filtered);
    }

    if (this.action === 'upsert') {
      const payload = this.payload as Partial<ProfileRow> & { id: string };
      const idx = store.profiles.findIndex((p) => p.id === payload.id);
      const next: ProfileRow = {
        ...(idx >= 0 ? store.profiles[idx] : ({} as ProfileRow)),
        ...payload,
        created_at: (idx >= 0 ? store.profiles[idx].created_at : payload.created_at) ?? nowIso(),
      } as ProfileRow;

      if (idx >= 0) {
        store.profiles[idx] = next;
      } else {
        store.profiles.push(next);
      }

      return this.returning ? this.formatResult(next) : { data: null, error: null };
    }

    if (this.action === 'update') {
      const updates = this.payload as Partial<ProfileRow>;
      const targets = this.applyFilters(store.profiles);

      targets.forEach((row) => Object.assign(row, updates));

      const updated = this.applyOrder(this.applyFilters(store.profiles));
      return this.returning ? this.formatResult(updated) : { data: null, error: null };
    }

    return { data: null, error: new Error(`Unsupported action ${this.action} on profiles (demo)`) };
  }

  private executeMessages(): { data: any; error: any } {
    if (this.action === 'select') {
      const filtered = this.applyOrder(this.applyFilters(store.messages));
      return this.formatResult(filtered);
    }

    if (this.action === 'insert') {
      const payload = this.payload as Partial<MessageRow> & {
        sender_id: string;
        recipient_id: string;
        body: string;
        departure_time: string;
        arrival_time: string;
        distance_km: number;
        pigeon_speed_kmh: number;
      };

      const next: MessageRow = {
        id: payload.id ?? `m_demo_${Date.now()}`,
        sender_id: payload.sender_id,
        recipient_id: payload.recipient_id,
        body: payload.body,
        title: payload.title ?? null,
        pigeon_name: payload.pigeon_name ?? null,
        created_at: payload.created_at ?? nowIso(),
        departure_time: payload.departure_time,
        arrival_time: payload.arrival_time,
        status: (payload.status as any) ?? 'in_flight',
        distance_km: payload.distance_km,
        pigeon_speed_kmh: payload.pigeon_speed_kmh,
      };

      store.messages.unshift(next);

      return this.returning ? this.formatResult(next) : { data: null, error: null };
    }

    if (this.action === 'update') {
      const updates = this.payload as Partial<MessageRow>;
      const targets = this.applyFilters(store.messages);
      targets.forEach((row) => Object.assign(row, updates));
      const updated = this.applyOrder(this.applyFilters(store.messages));
      return this.returning ? this.formatResult(updated) : { data: null, error: null };
    }

    return { data: null, error: new Error(`Unsupported action ${this.action} on messages (demo)`) };
  }
}

export function createDemoSupabase() {
  if (!isDemoMode) {
    throw new Error('createDemoSupabase() should only be used when EXPO_PUBLIC_DEMO_MODE=true');
  }

  const auth = {
    getSession: async () => ({ data: { session: store.session }, error: null }),
    onAuthStateChange: (callback: AuthListener) => {
      store.authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => store.authListeners.delete(callback),
          },
        },
      };
    },
    signInWithPassword: async ({ email }: { email: string; password: string }) => {
      const user = createDemoUser({ email, displayName: email.split('@')[0] ?? 'Demo Courier' });
      store.session = createDemoSession(user);
      notifyAuth('SIGNED_IN', store.session);
      return { data: { session: store.session, user }, error: null };
    },
    signUp: async ({
      email,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    }) => {
      const id = `demo-user-${Math.floor(Math.random() * 100000)}`;
      const displayName = (options?.data?.display_name as string) ?? email.split('@')[0] ?? 'Courier';
      const user = createDemoUser({ id, email, displayName, metadata: options?.data });
      store.session = createDemoSession(user);

      // Insert a profile row immediately so the app can render without needing a round-trip.
      const existingIdx = store.profiles.findIndex((p) => p.id === id);
      if (existingIdx === -1) {
        store.profiles.push({
          id,
          email,
          display_name: displayName,
          home_location_id: (options?.data?.home_location_id as string) ?? 'nyc',
          home_location_label: (options?.data?.home_location_label as string) ?? 'New York City, USA',
          home_location_latitude: (options?.data?.home_location_latitude as number) ?? 40.7128,
          home_location_longitude: (options?.data?.home_location_longitude as number) ?? -74.006,
          home_location_country_code: (options?.data?.home_location_country_code as string) ?? 'US',
          created_at: nowIso(),
        });
      }

      notifyAuth('SIGNED_IN', store.session);
      return { data: { user, session: store.session }, error: null };
    },
    signOut: async () => {
      store.session = null;
      notifyAuth('SIGNED_OUT', null);
      return { error: null };
    },
  };

  return {
    auth,
    from: (table: TableName) => new DemoQueryBuilder(table),
  };
}
