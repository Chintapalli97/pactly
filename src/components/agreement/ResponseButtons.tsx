
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface ResponseButtonsProps {
  isResponding: boolean;
  onResponse: (accept: boolean) => Promise<void>;
}

const ResponseButtons: React.FC<ResponseButtonsProps> = ({
  isResponding,
  onResponse,
}) => {
  return (
    <>
      <Button 
        variant="outline" 
        className="text-destructive hover:bg-destructive/10"
        onClick={() => onResponse(false)}
        disabled={isResponding}
      >
        <XCircle className="h-4 w-4 mr-1" />
        {isResponding ? 'Processing...' : 'Decline'}
      </Button>
      
      <Button 
        onClick={() => onResponse(true)}
        disabled={isResponding}
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        {isResponding ? 'Processing...' : 'Accept'}
      </Button>
    </>
  );
};

export default ResponseButtons;
