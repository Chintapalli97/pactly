
import React from 'react';
import { AgreementStatus } from '@/types/agreement';
import ResponseButtons from './ResponseButtons';
import ShareLinkButton from './ShareLinkButton';
import DeleteButtons from './DeleteButtons';

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
  isAdmin?: boolean;
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
  isAdmin = false,
}) => {
  return (
    <div className="border-t bg-muted/30 flex flex-wrap gap-3 justify-between p-6 pt-4">
      <div className="flex gap-2">
        {canRespond && (
          <ResponseButtons
            isResponding={isResponding}
            onResponse={onResponse}
          />
        )}
        
        {status === 'pending' && isCreator && (
          <ShareLinkButton id={id} />
        )}
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <DeleteButtons
          isAdmin={isAdmin}
          canDelete={canDelete}
          hasRequestedDelete={hasRequestedDelete}
          onRequestDelete={onRequestDelete}
        />
      </div>
    </div>
  );
};

export default AgreementActions;
