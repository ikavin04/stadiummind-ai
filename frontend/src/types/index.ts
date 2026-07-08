// ─── Shared TypeScript interfaces mirroring backend Pydantic schemas ───

export type Severity = 'normal' | 'watch' | 'alert';

export type UserRole = 'fan' | 'manager' | 'security' | 'medical' | 'volunteer';

export type Language = 'en' | 'es' | 'fr' | 'hi' | 'ar' | 'pt';

export interface Zone {
  id: string;
  name: string;
  zone_type: 'gate' | 'concourse' | 'section' | 'facility';
  capacity: number;
  current_count: number;
  occupancy_pct: number;
  severity: Severity;
  latitude?: number;
  longitude?: number;
  latest_prediction?: CrowdPrediction | null;
}

export interface CrowdPrediction {
  id: string;
  zone_id: string;
  zone_name?: string;
  minutes_until_overcapacity: number | null;
  recommended_action: string | null;
  confidence: number | null;
  severity: Severity;
  current_count?: number;
  occupancy_pct?: number;
  capacity?: number;
  created_at: string;
}

export interface DashboardAlert {
  zone_id: string;
  zone_name: string;
  severity: Severity;
  message: string;
  timestamp: string;
}

export interface MatchInfo {
  match: string;
  kickoff: string;
  venue: string;
  date: string;
  attendance_target: number;
  status: string;
}

export interface WeatherInfo {
  condition: string;
  temperature_c: number;
  humidity_pct: number;
  wind_kph: number;
  icon: string;
}

export interface DashboardSummary {
  total_zones: number;
  total_fans_inside: number;
  active_alerts: DashboardAlert[];
  zones: Zone[];
  latest_predictions: CrowdPrediction[];
  match_info: MatchInfo;
  weather: WeatherInfo;
}

export interface ZoneHistory {
  zone_id: string;
  zone_name: string;
  capacity: number;
  readings: Array<{
    count: number;
    occupancy_pct: number;
    recorded_at: string;
  }>;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant';
  content: string;
  original_language?: string;
  created_at: string;
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  reply: string;
  language: string;
}

export interface AuthUser {
  user_id: string;
  role: UserRole;
  email: string;
  display_name: string | null;
  dashboard_config: {
    modules: string[];
    default_view: string;
  };
}

// WebSocket events pushed from backend
export type WSEventType = 'initial_state' | 'crowd_update' | 'alert' | 'new_prediction' | 'pong';

export interface WSEvent {
  event_type: WSEventType;
  data: Record<string, unknown>;
}

// Roadmap module definition (UI-only, no backend)
export interface RoadmapModule {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  architecture: string;
}
