
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
    <div className="border-t bg-muted/30 p-6 pt-4">
      <div className="flex flex-wrap gap-3 justify-between">
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
        
        <div>
          <DeleteButtons
            isAdmin={isAdmin}
            canDelete={canDelete}
            hasRequestedDelete={hasRequestedDelete}
            onRequestDelete={onRequestDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default AgreementActions;
