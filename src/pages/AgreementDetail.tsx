
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAgreements } from '@/hooks/useAgreementsContext';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import AgreementHeader from '@/components/agreement/AgreementHeader';
import AgreementParties from '@/components/agreement/AgreementParties';
import AgreementMessage from '@/components/agreement/AgreementMessage';
import AgreementActions from '@/components/agreement/AgreementActions';
import LoginPrompt from '@/components/agreement/LoginPrompt';
import LoadingState from '@/components/agreement/LoadingState';
import NotFoundState from '@/components/agreement/NotFoundState';

const AgreementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getAgreementById, respondToAgreement, requestDeleteAgreement, loading } = useAgreements();
  const { user, isAuthenticated } = useAuth();
  const [isResponding, setIsResponding] = useState(false);
  const [agreement, setAgreement] = useState(null);
  const [notFound, setNotFound] = useState(false);
  
  useEffect(() => {
    if (id) {
      const foundAgreement = getAgreementById(id);
      setAgreement(foundAgreement);
      setNotFound(!foundAgreement);
      
      if (foundAgreement) {
        document.title = `Agreement | PactPal`;
      }
    }
  }, [id, getAgreementById]);
  
  const isCreator = user?.id === agreement?.creatorId;
  const isRecipient = user?.id === agreement?.recipientId;
  const canRespond = isAuthenticated && agreement?.status === 'pending' && !isCreator;
  const canDelete = isAuthenticated && 
                    agreement?.status === 'accepted' && 
                    (isCreator || isRecipient) && 
                    !agreement.deleteRequestedBy.includes(user?.id || '');
  const hasRequestedDelete = user?.id ? agreement?.deleteRequestedBy.includes(user.id) : false;
  
  const handleResponse = async (accept: boolean) => {
    if (!id) return;
    
    try {
      setIsResponding(true);
      await respondToAgreement(id, accept);
    } finally {
      setIsResponding(false);
    }
  };
  
  const handleRequestDelete = async () => {
    if (!id) return;
    await requestDeleteAgreement(id);
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (notFound) {
    return <NotFoundState />;
  }
  
  if (!agreement) {
    return <LoadingState />;
  }
  
  return (
    <Layout>
      <div className="min-h-[80vh] max-w-2xl mx-auto animate-fade-in">
        <Card className="glass-card animate-scale-in overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <AgreementHeader status={agreement.status} />
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
              onResponse={handleResponse}
              onRequestDelete={handleRequestDelete}
            />
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default AgreementDetail;
