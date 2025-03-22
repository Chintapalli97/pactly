
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Shield } from 'lucide-react';

interface DeleteButtonsProps {
  isAdmin: boolean;
  canDelete: boolean;
  hasRequestedDelete: boolean;
  onRequestDelete: () => Promise<void>;
}

const DeleteButtons: React.FC<DeleteButtonsProps> = ({
  isAdmin,
  canDelete,
  hasRequestedDelete,
  onRequestDelete,
}) => {
  if (isAdmin) {
    return (
      <Button 
        variant="destructive"
        onClick={onRequestDelete}
        className="flex items-center"
      >
        <Shield className="h-4 w-4 mr-1" />
        <Trash2 className="h-4 w-4 mr-1" />
        Admin Delete
      </Button>
    );
  }
  
  if (canDelete) {
    return (
      <>
        <Button 
          variant="ghost" 
          className="text-destructive hover:bg-destructive/10"
          onClick={onRequestDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {hasRequestedDelete ? 'Confirm Delete' : 'Request Delete'}
        </Button>
        
        {hasRequestedDelete && (
          <p className="text-xs text-muted-foreground w-full text-right mt-2">
            Waiting for other party to delete...
          </p>
        )}
      </>
    );
  }
  
  return null;
};

export default DeleteButtons;
