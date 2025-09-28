export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          home_location_id: string;
          home_location_label: string | null;
          home_location_latitude: number | null;
          home_location_longitude: number | null;
          home_location_country_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name: string;
          home_location_id: string;
          home_location_label?: string | null;
          home_location_latitude?: number | null;
          home_location_longitude?: number | null;
          home_location_country_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          home_location_id?: string;
          home_location_label?: string | null;
          home_location_latitude?: number | null;
          home_location_longitude?: number | null;
          home_location_country_code?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          body: string;
          created_at: string;
          departure_time: string;
          arrival_time: string;
          status: "preparing" | "in_flight" | "delivered";
          distance_km: number;
          pigeon_speed_kmh: number;
          title: string | null;
          pigeon_name: string | null;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          body: string;
          created_at?: string;
          departure_time: string;
          arrival_time: string;
          status?: "preparing" | "in_flight" | "delivered";
          distance_km: number;
          pigeon_speed_kmh: number;
          title?: string | null;
          pigeon_name?: string | null;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_id?: string;
          body?: string;
          created_at?: string;
          departure_time?: string;
          arrival_time?: string;
          status?: "preparing" | "in_flight" | "delivered";
          distance_km?: number;
          pigeon_speed_kmh?: number;
          title?: string | null;
          pigeon_name?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
