
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PencilIcon, Send } from 'lucide-react';

interface CreateAgreementFormProps {
  message: string;
  setMessage: (message: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
}

const CreateAgreementForm: React.FC<CreateAgreementFormProps> = ({
  message,
  setMessage,
  handleSubmit,
  loading
}) => {
  return (
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
    </form>
  );
};

export default CreateAgreementForm;
