import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgreements } from '@/context/AgreementContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import { Share2, PencilIcon, Send, ArrowLeft } from 'lucide-react';

const CreateAgreement = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState('');
  const { createAgreement } = useAgreements();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const id = await createAgreement(message);
      setAgreementId(id);
      const url = `${window.location.origin}/agreements/${id}`;
      setShareLink(url);
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
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
                disabled={isSubmitting || !message.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Creating...' : 'Create Agreement'}
              </Button>
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
            
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-muted rounded-md p-3 flex-1 text-sm break-all">
                {shareLink}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setAgreementId(null);
                  setMessage('');
                  setShareLink('');
                }}
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
