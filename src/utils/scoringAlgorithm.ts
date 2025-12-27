import { Hospital, HospitalWithScore, EmergencyType } from '@/types/hospital';

// Haversine formula to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Normalize a value to a 0-100 score (lower is better for these metrics)
function normalizeScore(value: number, min: number, max: number, inverse: boolean = true): number {
  if (max === min) return 100;
  const normalized = ((value - min) / (max - min)) * 100;
  return inverse ? Math.max(0, 100 - normalized) : Math.min(100, normalized);
}

// Calculate hospital score based on multiple factors
export function calculateHospitalScore(
  hospital: Hospital,
  userLat: number,
  userLng: number,
  emergencyType: EmergencyType,
  allHospitals: Hospital[]
): HospitalWithScore {
  const distance = calculateDistance(userLat, userLng, Number(hospital.latitude), Number(hospital.longitude));
  
  // Get min/max values for normalization
  const distances = allHospitals.map(h => 
    calculateDistance(userLat, userLng, Number(h.latitude), Number(h.longitude))
  );
  const queues = allHospitals.map(h => h.emergency_queue);
  const waitTimes = allHospitals.map(h => h.avg_wait_time_minutes);
  
  const minDist = Math.min(...distances);
  const maxDist = Math.max(...distances);
  const minQueue = Math.min(...queues);
  const maxQueue = Math.max(...queues);
  const minWait = Math.min(...waitTimes);
  const maxWait = Math.max(...waitTimes);

  // Calculate individual scores (all normalized to 0-100, higher is better)
  const distanceScore = normalizeScore(distance, minDist, maxDist, true);
  const queueScore = normalizeScore(hospital.emergency_queue, minQueue, maxQueue, true);
  const waitTimeScore = normalizeScore(hospital.avg_wait_time_minutes, minWait, maxWait, true);
  
  // Specialization score: 100 if hospital has the needed specialty, 50 otherwise
  const hasSpecialization = hospital.specializations.includes(emergencyType) || 
                           hospital.specializations.includes('general');
  const specializationScore = hasSpecialization ? 100 : 50;

  // Weighted score calculation
  // Distance: 25%, Queue: 35%, Wait Time: 20%, Specialization: 15%, Traffic: 5% (simulated)
  const trafficScore = 80; // Simulated traffic score
  
  const score = 
    (distanceScore * 0.25) +
    (queueScore * 0.35) +
    (waitTimeScore * 0.20) +
    (specializationScore * 0.15) +
    (trafficScore * 0.05);

  return {
    ...hospital,
    score: Math.round(score * 10) / 10,
    distance: Math.round(distance * 10) / 10,
    distanceScore: Math.round(distanceScore),
    queueScore: Math.round(queueScore),
    waitTimeScore: Math.round(waitTimeScore),
    specializationScore: Math.round(specializationScore),
  };
}

// Get ranked hospitals for an emergency
export function rankHospitals(
  hospitals: Hospital[],
  userLat: number,
  userLng: number,
  emergencyType: EmergencyType
): HospitalWithScore[] {
  // Filter only active hospitals accepting emergencies
  const activeHospitals = hospitals.filter(h => h.is_active && h.accepting_emergencies);
  
  // Calculate scores for each hospital
  const scoredHospitals = activeHospitals.map(hospital =>
    calculateHospitalScore(hospital, userLat, userLng, emergencyType, activeHospitals)
  );
  
  // Sort by score (highest first)
  return scoredHospitals.sort((a, b) => b.score - a.score);
}
