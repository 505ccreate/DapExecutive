export interface BookingDetails {
  service_type?: string;
  vehicle_type?: string;
  pickup_date?: string;
  pickup_time?: string;
  pickup_address?: string;
  dropoff_address?: string;
  passenger_count?: number;
  luggage_count?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  flight_number?: string;
  special_requests?: string;
}

export type ConnectionStatus = 'offline' | 'connecting' | 'listening' | 'speaking' | 'error';

export interface DebugInfo {
  micPermission: 'prompt' | 'granted' | 'denied';
  wsStatus: 'closed' | 'connecting' | 'open' | 'error';
  lastToolCall?: string;
  lastError?: string;
}

export interface TranscriptMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    videoUrl: string;
  };
  about: {
    label: string;
    title: string;
    description: string[];
    quote: string;
    tags: string[];
  };
  fleet: {
    id: string;
    name: string;
    class: string;
    passengers: number;
    luggage: number;
    description: string;
    image: string;
  }[];
  services: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
  ai: {
    label: string;
    title: string;
    description: string;
    features: {
      title: string;
      description: string;
      icon: string;
    }[];
  };
}
