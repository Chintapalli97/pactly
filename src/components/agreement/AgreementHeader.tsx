
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft } from 'lucide-react';
import { AgreementStatus } from '@/types/agreement';

interface AgreementHeaderProps {
  status: AgreementStatus;
}

const AgreementHeader: React.FC<AgreementHeaderProps> = ({ status }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agreement Details</h1>
        <StatusBadge status={status} className="text-sm ml-4" />
      </div>
    </div>
  );
};

export default AgreementHeader;
