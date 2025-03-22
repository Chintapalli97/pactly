
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import AgreementHeader from '@/components/agreement/AgreementHeader';
import AgreementParties from '@/components/agreement/AgreementParties';
import AgreementMessage from '@/components/agreement/AgreementMessage';
import AgreementActions from '@/components/agreement/AgreementActions';
import LoginPrompt from '@/components/agreement/LoginPrompt';
import { Agreement } from '@/types/agreement';
import { Shield } from 'lucide-react';

interface AgreementDetailContentProps {
  agreement: Agreement;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isCreator: boolean;
  isRecipient: boolean;
  canRespond: boolean;
  canDelete: boolean;
  hasRequestedDelete: boolean;
  isResponding: boolean;
  onResponse: (accept: boolean) => Promise<void>;
  onRequestDelete: () => Promise<void>;
}

const AgreementDetailContent: React.FC<AgreementDetailContentProps> = ({
  agreement,
  isAdmin,
  isAuthenticated,
  isCreator,
  isRecipient,
  canRespond,
  canDelete,
  hasRequestedDelete,
  isResponding,
  onResponse,
  onRequestDelete
}) => {
  return (
    <div className="min-h-[80vh] max-w-2xl mx-auto animate-fade-in">
      <Card className="glass-card animate-scale-in overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex justify-between items-center">
            <AgreementHeader status={agreement.status} />
            {isAdmin && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                <Shield className="h-3 w-3" />
                Admin View
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="mb-6">
            <AgreementParties 
              creatorName={agreement.creatorName}
              recipientName={agreement.recipientName}
              createdAt={agreement.createdAt}
            />
            
            <AgreementMessage message={agreement.message} />
          </div>
          
          {!isAuthenticated && agreement.status === 'pending' && (
            <LoginPrompt />
          )}
        </CardContent>
        
        <CardFooter className="p-0">
          <AgreementActions
            id={agreement.id}
            status={agreement.status}
            canRespond={canRespond}
            canDelete={canDelete}
            isResponding={isResponding}
            isCreator={isCreator}
            hasRequestedDelete={hasRequestedDelete}
            onResponse={onResponse}
            onRequestDelete={onRequestDelete}
            isAdmin={isAdmin}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgreementDetailContent;
