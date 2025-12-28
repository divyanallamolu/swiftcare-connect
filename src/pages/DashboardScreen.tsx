import { useState, useEffect } from 'react';
import { useHospitals, useEmergencies, useUpdateHospitalQueue, useUpdateEmergency } from '@/hooks/useHospitals';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QueueIndicator } from '@/components/QueueIndicator';
import { EmergencyPhotoViewer } from '@/components/EmergencyPhotoViewer';
import { CallHospitalButton } from '@/components/CallHospitalButton';
import { 
  LayoutDashboard, 
  Plus, 
  Minus, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  MapPin,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardScreen() {
  const { hospitalId: userHospitalId } = useAuth();
  const { hospitals, isLoading: hospitalsLoading } = useHospitals();
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  
  // Auto-select hospital for hospital users
  useEffect(() => {
    if (userHospitalId && !selectedHospitalId) {
      setSelectedHospitalId(userHospitalId);
    }
  }, [userHospitalId, selectedHospitalId]);
  
  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId);
  const { emergencies, isLoading: emergenciesLoading } = useEmergencies(selectedHospitalId || undefined);
  const updateQueue = useUpdateHospitalQueue();
  const updateEmergency = useUpdateEmergency();

  const pendingEmergencies = emergencies.filter(e => e.status === 'pending');

  const handleQueueChange = async (type: 'emergency' | 'general', delta: number) => {
    if (!selectedHospital) return;
    
    const currentValue = type === 'emergency' 
      ? selectedHospital.emergency_queue 
      : selectedHospital.general_queue;
    const newValue = Math.max(0, (currentValue || 0) + delta);

    try {
      await updateQueue.mutateAsync({
        hospitalId: selectedHospital.id,
        ...(type === 'emergency' ? { emergencyQueue: newValue } : { generalQueue: newValue })
      });
      toast.success(`${type === 'emergency' ? 'Emergency' : 'General'} queue updated`);
    } catch (error) {
      toast.error('Failed to update queue');
    }
  };

  const handleEmergencyAction = async (emergencyId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateEmergency.mutateAsync({ id: emergencyId, status });
      toast.success(`Emergency ${status}`);
    } catch (error) {
      toast.error('Failed to update emergency');
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'accepted': return 'bg-success text-success-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (hospitalsLoading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-primary" />
            Hospital Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage queue and incoming emergencies
          </p>
        </div>
        
        {!userHospitalId && (
          <Select value={selectedHospitalId} onValueChange={setSelectedHospitalId}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select a hospital" />
            </SelectTrigger>
            <SelectContent>
              {hospitals.map((hospital) => (
                <SelectItem key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {!selectedHospitalId ? (
        <Card>
          <CardContent className="p-12 text-center">
            <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Select a Hospital</h3>
            <p className="text-muted-foreground">
              Choose a hospital from the dropdown to manage its queue and emergencies
            </p>
          </CardContent>
        </Card>
      ) : selectedHospital && (
        <>
          {/* Queue Management */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Emergency Queue */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Emergency Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-4xl font-bold text-destructive">
                    {selectedHospital.emergency_queue || 0}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleQueueChange('emergency', -1)}
                      disabled={(selectedHospital.emergency_queue || 0) === 0 || updateQueue.isPending}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleQueueChange('emergency', 1)}
                      disabled={updateQueue.isPending}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <QueueIndicator 
                  count={selectedHospital.emergency_queue || 0} 
                  type="emergency" 
                  className="mt-3"
                />
              </CardContent>
            </Card>

            {/* General Queue */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  General Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-4xl font-bold text-primary">
                    {selectedHospital.general_queue || 0}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleQueueChange('general', -1)}
                      disabled={(selectedHospital.general_queue || 0) === 0 || updateQueue.isPending}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleQueueChange('general', 1)}
                      disabled={updateQueue.isPending}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <QueueIndicator 
                  count={selectedHospital.general_queue || 0} 
                  type="general" 
                  className="mt-3"
                />
              </CardContent>
            </Card>
          </div>

          {/* Hospital Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{selectedHospital.avg_wait_time_minutes || 0}</div>
                  <div className="text-xs text-muted-foreground">Avg Wait (min)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{selectedHospital.specializations?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Specializations</div>
                </div>
                <div>
                  <Badge variant={selectedHospital.is_active ? "default" : "secondary"}>
                    {selectedHospital.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <Badge 
                    variant={selectedHospital.accepting_emergencies ? "default" : "destructive"}
                    className={selectedHospital.accepting_emergencies ? "bg-success" : ""}
                  >
                    {selectedHospital.accepting_emergencies ? 'Accepting' : 'Not Accepting'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incoming Emergencies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  Incoming Emergencies
                  {pendingEmergencies.length > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {pendingEmergencies.length} pending
                    </Badge>
                  )}
                </span>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {emergenciesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : emergencies.length > 0 ? (
                <div className="space-y-4">
                  {emergencies.slice(0, 10).map((emergency) => (
                    <Card key={emergency.id} className="border-l-4 border-l-warning">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(emergency.status)}>
                                {emergency.status}
                              </Badge>
                              <span className="font-medium capitalize">
                                {emergency.emergency_type} Emergency
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(emergency.created_at), { addSuffix: true })}
                              </span>
                              
                              {emergency.patient_latitude && emergency.patient_longitude && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {emergency.patient_latitude.toFixed(3)}, {emergency.patient_longitude.toFixed(3)}
                                </span>
                              )}
                              
                              {emergency.hospital_score && (
                                <span>Score: {emergency.hospital_score.toFixed(0)}</span>
                              )}
                            </div>
                            
                            {emergency.patient_phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `tel:${emergency.patient_phone}`}
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                Call Patient
                              </Button>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <EmergencyPhotoViewer 
                              photoUrl={emergency.photo_url}
                              emergencyType={emergency.emergency_type}
                            />
                            
                            {emergency.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-success border-success hover:bg-success hover:text-success-foreground"
                                  onClick={() => handleEmergencyAction(emergency.id, 'accepted')}
                                  disabled={updateEmergency.isPending}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => handleEmergencyAction(emergency.id, 'rejected')}
                                  disabled={updateEmergency.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No emergencies at this hospital
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
