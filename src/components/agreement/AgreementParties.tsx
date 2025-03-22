
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';

interface AgreementPartiesProps {
  creatorName: string;
  recipientName?: string;
  createdAt: string;
}

const AgreementParties: React.FC<AgreementPartiesProps> = ({ 
  creatorName, 
  recipientName, 
  createdAt 
}) => {
  return (
    <>
      <div className="flex flex-wrap justify-between mb-4">
        <div className="space-y-1 mb-2 mr-4">
          <p className="text-sm text-muted-foreground">From</p>
          <p className="font-medium">{creatorName}</p>
        </div>
        
        {recipientName && (
          <div className="space-y-1 mb-2">
            <p className="text-sm text-muted-foreground">To</p>
            <p className="font-medium">{recipientName}</p>
          </div>
        )}
      </div>
      
      <div className="space-y-1 mb-6">
        <p className="text-sm text-muted-foreground">Created</p>
        <p className="font-medium">
          {format(new Date(createdAt), 'PPP')} ({formatDistanceToNow(new Date(createdAt), { addSuffix: true })})
        </p>
      </div>
    </>
  );
};

export default AgreementParties;
