
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import CreateAgreementForm from '@/components/agreement/CreateAgreementForm';
import CreateAgreementSuccess from '@/components/agreement/CreateAgreementSuccess';
import { useCreateAgreementPage } from '@/hooks/useCreateAgreementPage';

const CreateAgreement = () => {
  const {
    message,
    setMessage,
    handleSubmit,
    loading,
    error,
    agreementId,
    shareLink,
    handleCreateAnother
  } = useCreateAgreementPage();
  
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-[80vh] animate-fade-in max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 animate-slide-down">
            Create a New Agreement
          </h1>
          <p className="text-muted-foreground animate-slide-down delay-100">
            Write your agreement, create it, and share the link with your friend
          </p>
        </div>
        
        <Card className={`glass-card p-6 ${!agreementId ? 'animate-scale-in delay-200' : 'animate-scale-in'}`}>
          {!agreementId ? (
            <CreateAgreementForm
              message={message}
              setMessage={setMessage}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          ) : (
            <CreateAgreementSuccess
              shareLink={shareLink}
              agreementId={agreementId}
              onCreateAnother={handleCreateAnother}
            />
          )}
          
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default CreateAgreement;
