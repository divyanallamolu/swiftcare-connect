import { Hospital, HospitalWithScore } from '@/types/hospital';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, Users, Star, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HospitalCardProps {
  hospital: HospitalWithScore | Hospital;
  rank?: number;
  isTopChoice?: boolean;
  onSelect?: () => void;
  showScore?: boolean;
}

export function HospitalCard({ 
  hospital, 
  rank, 
  isTopChoice = false, 
  onSelect,
  showScore = true 
}: HospitalCardProps) {
  const isScored = 'score' in hospital;
  const scored = hospital as HospitalWithScore;

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        isTopChoice && "ring-2 ring-primary shadow-lg"
      )}
    >
      {isTopChoice && (
        <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {rank && (
                <span className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold",
                  isTopChoice 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {rank}
                </span>
              )}
              <h3 className="font-semibold text-foreground truncate">
                {hospital.name}
              </h3>
              {isTopChoice && (
                <Badge className="bg-primary text-primary-foreground">
                  Best Match
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{hospital.address}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {hospital.specializations.slice(0, 3).map((spec) => (
                <Badge 
                  key={spec} 
                  variant="secondary" 
                  className="text-xs capitalize"
                >
                  {spec}
                </Badge>
              ))}
              {hospital.specializations.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{hospital.specializations.length - 3}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{hospital.emergency_queue} in queue</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>~{hospital.avg_wait_time_minutes}min</span>
              </div>
              {isScored && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{scored.distance}km</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {showScore && isScored && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="text-lg font-bold text-foreground">
                  {scored.score}
                </span>
              </div>
            )}
            
            {onSelect && (
              <Button 
                size="sm" 
                onClick={onSelect}
                className={cn(
                  isTopChoice && "gradient-primary border-0"
                )}
              >
                Select
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {!hospital.accepting_emergencies && (
          <div className="mt-3 p-2 rounded bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive font-medium">
              Not accepting emergencies
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
