
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import LoadingState from '@/components/agreement/LoadingState';
import NotFoundState from '@/components/agreement/NotFoundState';
import AccessDeniedView from '@/components/agreement/AccessDeniedView';
import AgreementDetailContent from '@/components/agreement/AgreementDetailContent';
import { useAgreementDetail } from '@/hooks/useAgreementDetail';

const AgreementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  
  const {
    agreement,
    notFound,
    accessDenied,
    localLoading,
    isResponding,
    isCreator,
    isRecipient,
    canRespond,
    canDelete,
    hasRequestedDelete,
    handleResponse,
    handleRequestDelete
  } = useAgreementDetail(id);
  
  if (localLoading) {
    return <LoadingState />;
  }
  
  if (notFound) {
    return <NotFoundState />;
  }
  
  if (accessDenied) {
    return <AccessDeniedView />;
  }
  
  if (!agreement) {
    return <NotFoundState />;
  }
  
  const onRequestDelete = async () => {
    const shouldNavigate = await handleRequestDelete();
    if (shouldNavigate) {
      navigate('/dashboard');
    }
  };
  
  return (
    <Layout>
      <AgreementDetailContent
        agreement={agreement}
        isAdmin={isAdmin}
        isAuthenticated={isAuthenticated}
        isCreator={isCreator}
        isRecipient={isRecipient}
        canRespond={canRespond}
        canDelete={canDelete}
        hasRequestedDelete={hasRequestedDelete}
        isResponding={isResponding}
        onResponse={handleResponse}
        onRequestDelete={onRequestDelete}
      />
    </Layout>
  );
};

export default AgreementDetail;
