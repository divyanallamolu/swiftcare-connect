export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  specializations: string[];
  emergency_queue: number;
  general_queue: number;
  avg_wait_time_minutes: number;
  is_active: boolean;
  accepting_emergencies: boolean;
  last_queue_update: string;
  created_at: string;
  updated_at: string;
}

export interface Emergency {
  id: string;
  hospital_id: string | null;
  emergency_type: string;
  patient_name: string | null;
  patient_phone: string | null;
  patient_latitude: number | null;
  patient_longitude: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  hospital_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface HospitalWithScore extends Hospital {
  score: number;
  distance: number;
  distanceScore: number;
  queueScore: number;
  waitTimeScore: number;
  specializationScore: number;
}

export type EmergencyType = 
  | 'cardiac'
  | 'trauma'
  | 'stroke'
  | 'burns'
  | 'pediatric'
  | 'respiratory'
  | 'general';

export const EMERGENCY_TYPES: { value: EmergencyType; label: string; icon: string }[] = [
  { value: 'cardiac', label: 'Cardiac', icon: '❤️' },
  { value: 'trauma', label: 'Trauma', icon: '🚨' },
  { value: 'stroke', label: 'Stroke', icon: '🧠' },
  { value: 'burns', label: 'Burns', icon: '🔥' },
  { value: 'pediatric', label: 'Pediatric', icon: '👶' },
  { value: 'respiratory', label: 'Respiratory', icon: '🫁' },
  { value: 'general', label: 'General', icon: '🏥' },
];
