import { EmergencyType, EMERGENCY_TYPES } from '@/types/hospital';
import { cn } from '@/lib/utils';

interface EmergencyTypeSelectorProps {
  selected: EmergencyType;
  onSelect: (type: EmergencyType) => void;
}

export function EmergencyTypeSelector({ selected, onSelect }: EmergencyTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {EMERGENCY_TYPES.map((type) => (
        <button
          key={type.value}
          onClick={() => onSelect(type.value)}
          className={cn(
            "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-200",
            selected === type.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card hover:border-primary/50 hover:bg-accent"
          )}
        >
          <span className="text-2xl">{type.icon}</span>
          <span className="text-sm font-medium">{type.label}</span>
        </button>
      ))}
    </div>
  );
}
