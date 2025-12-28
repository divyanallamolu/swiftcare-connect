import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EmergencyTypeSelector } from '@/components/EmergencyTypeSelector';
import { HospitalCard } from '@/components/HospitalCard';
import { PhotoUpload } from '@/components/PhotoUpload';
import { AIAnalysis } from '@/components/AIAnalysis';
import { CallHospitalButton } from '@/components/CallHospitalButton';
import { useHospitals, useCreateEmergency } from '@/hooks/useHospitals';
import { rankHospitals, calculateDistance } from '@/utils/scoringAlgorithm';
import { EmergencyType, HospitalWithScore } from '@/types/hospital';
import { Ambulance, MapPin, Loader2, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

// Default location (NYC for demo)
const DEFAULT_LOCATION = { lat: 40.7505, lng: -73.9934 };

export default function EmergencyScreen() {
  const navigate = useNavigate();
  const { hospitals, isLoading } = useHospitals();
  const createEmergency = useCreateEmergency();
  
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('general');
  const [emergencyDescription, setEmergencyDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [rankedHospitals, setRankedHospitals] = useState<HospitalWithScore[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<HospitalWithScore | null>(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success('Location updated');
        },
        () => {
          toast.error('Could not get location, using default');
        }
      );
    }
  };

  const handleFindHospitals = async () => {
    setIsSearching(true);
    
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const ranked = rankHospitals(
      hospitals,
      userLocation.lat,
      userLocation.lng,
      emergencyType
    );
    
    setRankedHospitals(ranked.slice(0, 5));
    setHasSearched(true);
    setIsSearching(false);
    setSelectedHospital(null);
    
    if (ranked.length > 0) {
      toast.success(`Found ${ranked.length} hospitals nearby`);
    } else {
      toast.error('No hospitals found');
    }
  };

  const handleSelectHospital = async (hospital: HospitalWithScore) => {
    setSelectedHospital(hospital);
  };

  const handleConfirmRouting = async () => {
    if (!selectedHospital) return;
    
    try {
      await createEmergency.mutateAsync({
        hospital_id: selectedHospital.id,
        emergency_type: emergencyType,
        patient_latitude: userLocation.lat,
        patient_longitude: userLocation.lng,
        status: 'pending',
        hospital_score: selectedHospital.score,
        patient_name: null,
        patient_phone: null,
        photo_url: photoUrl || null,
      });
      
      toast.success(`Emergency routed to ${selectedHospital.name}`);
      navigate('/hospitals');
    } catch (error) {
      toast.error('Failed to create emergency');
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container py-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-4">
            <Ambulance className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Emergency Routing
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Find the best hospital based on distance, queue length, wait time, and specialization.
          </p>
        </div>

        {/* Emergency Type Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Select Emergency Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmergencyTypeSelector
              selected={emergencyType}
              onSelect={setEmergencyType}
            />
          </CardContent>
        </Card>

        {/* Emergency Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Describe the Emergency (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Briefly describe the emergency situation to help the AI provide better recommendations..."
              value={emergencyDescription}
              onChange={(e) => setEmergencyDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <PhotoUpload 
          onPhotoUploaded={setPhotoUrl}
          currentPhotoUrl={photoUrl}
        />

        {/* Location */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleGetLocation}>
                Update Location
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Find Hospital Button */}
        <Button
          size="lg"
          className="w-full h-16 text-lg font-semibold gradient-emergency text-destructive-foreground border-0 animate-emergency"
          onClick={handleFindHospitals}
          disabled={isSearching || isLoading}
        >
          {isSearching ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Finding Best Hospital...
            </>
          ) : (
            <>
              <Ambulance className="w-6 h-6 mr-2" />
              FIND BEST HOSPITAL
            </>
          )}
        </Button>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Recommended Hospitals
              <span className="text-sm font-normal text-muted-foreground">
                (Ranked by score)
              </span>
            </h2>
            
            {rankedHospitals.length > 0 ? (
              <div className="space-y-3">
                {rankedHospitals.map((hospital, index) => (
                  <div key={hospital.id} className="space-y-2">
                    <HospitalCard
                      hospital={hospital}
                      rank={index + 1}
                      isTopChoice={index === 0}
                      onSelect={() => handleSelectHospital(hospital)}
                    />
                    
                    {/* Show AI Analysis and Call button for selected hospital */}
                    {selectedHospital?.id === hospital.id && (
                      <div className="ml-4 space-y-3">
                        <AIAnalysis
                          emergencyDescription={emergencyDescription}
                          emergencyType={emergencyType}
                          hospitalName={hospital.name}
                          hospitalSpecializations={hospital.specializations || []}
                          queueLength={hospital.emergency_queue || 0}
                          distance={calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            hospital.latitude,
                            hospital.longitude
                          )}
                        />
                        
                        <div className="flex gap-2">
                          <CallHospitalButton 
                            phone={hospital.phone}
                            hospitalName={hospital.name}
                            className="flex-1"
                          />
                          <Button 
                            className="flex-1 gradient-primary"
                            onClick={handleConfirmRouting}
                            disabled={createEmergency.isPending}
                          >
                            {createEmergency.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            Confirm & Route
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No hospitals found accepting emergencies
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
