// Hand-maintained until a local Supabase stack is available, after which
// `npm run gen:types` regenerates this file from the live schema.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      works: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          synopsis: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string;
          title: string;
          synopsis?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          synopsis?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      volumes: {
        Row: {
          id: string;
          work_id: string;
          number: number;
          title: string;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          work_id: string;
          number: number;
          title: string;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          work_id?: string;
          number?: number;
          title?: string;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "volumes_work_id_fkey";
            columns: ["work_id"];
            referencedRelation: "works";
            referencedColumns: ["id"];
          },
        ];
      };
      chapters: {
        Row: {
          id: string;
          volume_id: string;
          position: number;
          title: string;
          body: Json;
          word_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          volume_id: string;
          position: number;
          title: string;
          body?: Json;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          volume_id?: string;
          position?: number;
          title?: string;
          body?: Json;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chapters_volume_id_fkey";
            columns: ["volume_id"];
            referencedRelation: "volumes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
