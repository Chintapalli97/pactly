
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateAgreementSuccessProps {
  shareLink: string | null;
  agreementId: string | null;
  onCreateAnother: () => void;
}

const CreateAgreementSuccess: React.FC<CreateAgreementSuccessProps> = ({
  shareLink,
  agreementId,
  onCreateAnother
}) => {
  const navigate = useNavigate();

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      // Toast is called in the parent component
    }
  };

  const handleViewAgreement = () => {
    if (agreementId) {
      navigate(`/agreements/${agreementId}`);
    }
  };

  return (
    <>
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
          onClick={onCreateAnother}
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
    </>
  );
};

export default CreateAgreementSuccess;
