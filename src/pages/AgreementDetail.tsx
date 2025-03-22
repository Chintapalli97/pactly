
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgreements } from '@/context/AgreementContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import { formatDistanceToNow, format } from 'date-fns';
import { Loader2, ArrowLeft, CheckCircle, XCircle, Trash2, Share2 } from 'lucide-react';

const AgreementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getAgreementById, respondToAgreement, requestDeleteAgreement, loading } = useAgreements();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isResponding, setIsResponding] = useState(false);
  
  const agreement = id ? getAgreementById(id) : undefined;
  
  const isCreator = user?.id === agreement?.creatorId;
  const isRecipient = user?.id === agreement?.recipientId;
  const canRespond = isAuthenticated && agreement?.status === 'pending' && !isCreator;
  const canDelete = isAuthenticated && 
                    agreement?.status === 'accepted' && 
                    (isCreator || isRecipient) && 
                    !agreement.deleteRequestedBy.includes(user?.id || '');
  
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
  
  const copyShareLink = () => {
    const url = `${window.location.origin}/agreements/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };
  
  useEffect(() => {
    if (agreement) {
      document.title = `Agreement | PactPal`;
    }
  }, [agreement]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }
  
  if (!agreement) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-fade-in">
          <h1 className="text-3xl font-bold mb-4">Agreement Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The agreement you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-[80vh] max-w-2xl mx-auto animate-fade-in">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <Card className="glass-card animate-scale-in overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Agreement Details</h1>
              <StatusBadge status={agreement.status} className="text-sm" />
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="flex flex-wrap justify-between mb-4">
                <div className="space-y-1 mb-2 mr-4">
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">{agreement.creatorName}</p>
                </div>
                
                {agreement.recipientName && (
                  <div className="space-y-1 mb-2">
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-medium">{agreement.recipientName}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-1 mb-6">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {format(new Date(agreement.createdAt), 'PPP')} ({formatDistanceToNow(new Date(agreement.createdAt), { addSuffix: true })})
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Agreement Terms</p>
                <div className="bg-muted/30 p-4 rounded-md border">
                  <p className="whitespace-pre-wrap">{agreement.message}</p>
                </div>
              </div>
            </div>
            
            {!isAuthenticated && agreement.status === 'pending' && (
              <div className="bg-primary/10 border border-primary/20 rounded-md p-4 text-center">
                <p className="mb-2">You need to log in or sign up to respond to this agreement.</p>
                <div className="flex justify-center gap-2 mt-4">
                  <Button onClick={() => navigate('/login')}>Log In</Button>
                  <Button variant="outline" onClick={() => navigate('/signup')}>Sign Up</Button>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t bg-muted/30 flex flex-wrap gap-3 justify-between">
            <div className="flex gap-2">
              {canRespond && (
                <>
                  <Button 
                    variant="outline" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleResponse(false)}
                    disabled={isResponding}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {isResponding ? 'Processing...' : 'Decline'}
                  </Button>
                  
                  <Button 
                    onClick={() => handleResponse(true)}
                    disabled={isResponding}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {isResponding ? 'Processing...' : 'Accept'}
                  </Button>
                </>
              )}
              
              {agreement.status === 'pending' && isCreator && (
                <Button
                  variant="outline"
                  onClick={copyShareLink}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              )}
            </div>
            
            {canDelete && (
              <Button 
                variant="ghost" 
                className="text-destructive hover:bg-destructive/10"
                onClick={handleRequestDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {agreement.deleteRequestedBy.length > 0 ? 'Confirm Delete' : 'Request Delete'}
              </Button>
            )}
            
            {agreement.deleteRequestedBy.includes(user?.id || '') && (
              <p className="text-xs text-muted-foreground">
                Waiting for other party to delete...
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default AgreementDetail;
