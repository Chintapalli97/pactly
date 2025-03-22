
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trash2, Link } from 'lucide-react';
import { toast } from '@/lib/toast';
import { AgreementStatus } from '@/types/agreement';

interface AgreementActionsProps {
  id: string;
  status: AgreementStatus;
  canRespond: boolean;
  canDelete: boolean;
  isResponding: boolean;
  isCreator: boolean;
  hasRequestedDelete: boolean;
  onResponse: (accept: boolean) => Promise<void>;
  onRequestDelete: () => Promise<void>;
}

const AgreementActions: React.FC<AgreementActionsProps> = ({
  id,
  status,
  canRespond,
  canDelete,
  isResponding,
  isCreator,
  hasRequestedDelete,
  onResponse,
  onRequestDelete,
}) => {
  const navigate = useNavigate();

  const copyShareLink = () => {
    try {
      const url = `${window.location.origin}/agreements/${id}`;
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link to clipboard');
    }
  };

  return (
    <div className="border-t bg-muted/30 flex flex-wrap gap-3 justify-between p-6 pt-4">
      <div className="flex gap-2">
        {canRespond && (
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
        )}
        
        {status === 'pending' && isCreator && (
          <Button
            variant="outline"
            onClick={copyShareLink}
          >
            <Link className="h-4 w-4 mr-1" />
            Copy Link
          </Button>
        )}
      </div>
      
      {canDelete && (
        <Button 
          variant="ghost" 
          className="text-destructive hover:bg-destructive/10"
          onClick={onRequestDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {hasRequestedDelete ? 'Confirm Delete' : 'Request Delete'}
        </Button>
      )}
      
      {hasRequestedDelete && (
        <p className="text-xs text-muted-foreground">
          Waiting for other party to delete...
        </p>
      )}
    </div>
  );
};

export default AgreementActions;
