
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import { Link, PencilIcon, Send, ArrowLeft } from 'lucide-react';
import { toast } from '@/lib/toast';
import { verifyAgreementExists } from '@/utils/agreementStorage';
import { useAgreementCreation } from '@/hooks/useAgreementCreation';

const CreateAgreement = () => {
  const [message, setMessage] = useState('');
  const { createAgreement, loading, error, agreementId, shareLink, clearState } = useAgreementCreation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to create an agreement');
      return;
    }
    
    try {
      const id = await createAgreement(message);
      
      if (!id) {
        throw new Error('Failed to create agreement');
      }
      
      // Verify that the agreement was created and exists
      if (!verifyAgreementExists(id)) {
        console.warn('Agreement creation succeeded but agreement not found in storage');
      }
      
      // Trigger a storage event to ensure other components update
      const event = new Event('agreementsUpdated');
      document.dispatchEvent(event);
      
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to create agreement');
    }
  };

  const copyToClipboard = () => {
    try {
      if (shareLink) {
        navigator.clipboard.writeText(shareLink);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link to clipboard');
    }
  };

  const handleViewAgreement = () => {
    if (agreementId) {
      navigate(`/agreements/${agreementId}`);
    }
  };

  const handleCreateAnother = () => {
    setMessage('');
    clearState();
  };

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
        
        {!agreementId ? (
          <Card className="glass-card p-6 animate-scale-in delay-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center mb-2">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Write your agreement
                </label>
                <Textarea
                  placeholder="e.g., I promise to bring coffee every Monday morning for the next month."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Be clear and specific about what you're agreeing to. The recipient will be able to accept or decline.
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !message.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Agreement'}
              </Button>
              
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </form>
          </Card>
        ) : (
          <Card className="glass-card p-6 animate-scale-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Agreement Created!</h2>
              <p className="text-muted-foreground">
                Share this link with your friend so they can respond
              </p>
            </div>
            
            {shareLink && (
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-muted rounded-md p-3 flex-1 text-sm break-all">
                  {shareLink}
                </div>
                <Button 
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  <Link className="h-4 w-4 mr-1" />
                  Copy Link
                </Button>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleViewAgreement}
              >
                View Agreement
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleCreateAnother}
              >
                Create Another Agreement
              </Button>
              
              <Button 
                className="w-full" 
                onClick={() => navigate('/my-agreements')}
              >
                View My Agreements
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CreateAgreement;
