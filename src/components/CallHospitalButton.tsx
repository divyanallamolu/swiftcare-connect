import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

interface CallHospitalButtonProps {
  phone: string | null;
  hospitalName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function CallHospitalButton({ 
  phone, 
  hospitalName, 
  variant = 'outline',
  size = 'default',
  className 
}: CallHospitalButtonProps) {
  const handleCall = () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  if (!phone) return null;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCall}
      title={`Call ${hospitalName}`}
    >
      <Phone className="w-4 h-4 mr-2" />
      Call Hospital
    </Button>
  );
}
