import { cn } from '@/lib/utils';

interface QueueIndicatorProps {
  count: number;
  type: 'emergency' | 'general';
  className?: string;
}

export function QueueIndicator({ count, type, className }: QueueIndicatorProps) {
  const getColor = () => {
    if (type === 'emergency') {
      if (count <= 2) return 'bg-success';
      if (count <= 5) return 'bg-warning';
      return 'bg-destructive';
    }
    if (count <= 5) return 'bg-success';
    if (count <= 15) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "w-3 h-3 rounded-full",
        getColor(),
        type === 'emergency' && count > 0 && "animate-pulse"
      )} />
      <span className="text-sm font-medium">
        {count} {type === 'emergency' ? 'Emergency' : 'General'}
      </span>
    </div>
  );
}
