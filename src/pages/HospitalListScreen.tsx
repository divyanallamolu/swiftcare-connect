import { useHospitals } from '@/hooks/useHospitals';
import { HospitalCard } from '@/components/HospitalCard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Hospital } from '@/types/hospital';

export default function HospitalListScreen() {
  const { hospitals, isLoading } = useHospitals();
  const [search, setSearch] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);

  // Get all unique specializations
  const allSpecializations = Array.from(
    new Set(hospitals.flatMap(h => h.specializations))
  ).sort();

  // Filter hospitals
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(search.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = !selectedSpecialization || 
                       hospital.specializations.includes(selectedSpecialization);
    return matchesSearch && matchesSpec;
  });

  // Stats
  const activeCount = hospitals.filter(h => h.is_active).length;
  const acceptingCount = hospitals.filter(h => h.accepting_emergencies).length;
  const totalQueue = hospitals.reduce((sum, h) => sum + h.emergency_queue, 0);

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Building2 className="w-7 h-7 text-primary" />
          Hospitals
        </h1>
        <p className="text-muted-foreground">
          View all hospitals and their current status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{activeCount}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{acceptingCount}</div>
            <div className="text-xs text-muted-foreground">Accepting</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{totalQueue}</div>
            <div className="text-xs text-muted-foreground">In Queue</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search hospitals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedSpecialization === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedSpecialization(null)}
          >
            All
          </Badge>
          {allSpecializations.map((spec) => (
            <Badge
              key={spec}
              variant={selectedSpecialization === spec ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => setSelectedSpecialization(spec)}
            >
              {spec}
            </Badge>
          ))}
        </div>
      </div>

      {/* Hospital List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredHospitals.length > 0 ? (
        <div className="space-y-3">
          {filteredHospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              showScore={false}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No hospitals found matching your criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
