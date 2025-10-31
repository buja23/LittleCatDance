export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          host_id: string;
          status: string;
          master_sequence: string | null;
          started_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          status?: string;
          master_sequence?: string | null;
          started_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          status?: string;
          master_sequence?: string | null;
          started_at?: string | null;
          created_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          room_id: string;
          player_name: string;
          score: number;
          combo: number;
          excellent_hits: number;
          good_hits: number;
          miss_count: number;
          is_ready: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          player_name: string;
          score?: number;
          combo?: number;
          excellent_hits?: number;
          good_hits?: number;
          miss_count?: number;
          is_ready?: boolean;
          joined_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          player_name?: string;
          score?: number;
          combo?: number;
          excellent_hits?: number;
          good_hits?: number;
          miss_count?: number;
          is_ready?: boolean;
          joined_at?: string;
        };
      };
    };
  };
}
