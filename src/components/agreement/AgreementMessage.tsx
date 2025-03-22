
import React from 'react';

interface AgreementMessageProps {
  message: string;
}

const AgreementMessage: React.FC<AgreementMessageProps> = ({ message }) => {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Agreement Terms</p>
      <div className="bg-muted/30 p-4 rounded-md border">
        <p className="whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
};

export default AgreementMessage;
