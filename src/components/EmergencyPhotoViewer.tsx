import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image, X } from 'lucide-react';

interface EmergencyPhotoViewerProps {
  photoUrl: string | null;
  emergencyType: string;
}

export function EmergencyPhotoViewer({ photoUrl, emergencyType }: EmergencyPhotoViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!photoUrl) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
        <Image className="w-4 h-4 mr-1" />
        No Photo
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-primary">
          <Image className="w-4 h-4 mr-1" />
          View Photo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="capitalize">{emergencyType} Emergency Photo</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <img
            src={photoUrl}
            alt="Emergency photo"
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          This photo was uploaded by the patient to help prepare for their arrival.
        </p>
      </DialogContent>
    </Dialog>
  );
}
