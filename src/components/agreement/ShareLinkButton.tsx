
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';
import { toast } from '@/lib/toast';
import { verifyAgreementExists } from '@/utils/agreementStorage';

interface ShareLinkButtonProps {
  id: string;
}

const ShareLinkButton: React.FC<ShareLinkButtonProps> = ({ id }) => {
  const copyShareLink = () => {
    try {
      // Verify the agreement exists before copying the link
      if (verifyAgreementExists(id)) {
        const url = `${window.location.origin}/agreements/${id}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } else {
        toast.error('Cannot copy link: Agreement not found');
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link to clipboard');
    }
  };

  return (
    <Button
      variant="outline"
      onClick={copyShareLink}
      className="flex items-center"
    >
      <Link className="h-4 w-4 mr-1" />
      Copy Link
    </Button>
  );
};

export default ShareLinkButton;
