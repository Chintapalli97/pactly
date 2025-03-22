
import React from 'react';
import { Agreement } from '@/context/AgreementContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Share2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface AgreementCardProps {
  agreement: Agreement;
  onRequestDelete?: () => void;
  isPreview?: boolean;
  truncate?: boolean;
  showActions?: boolean;
}

const AgreementCard: React.FC<AgreementCardProps> = ({ 
  agreement, 
  onRequestDelete,
  isPreview = false,
  truncate = true,
  showActions = true
}) => {
  const { user } = useAuth();
  const { id, message, createdAt, creatorName, recipientName, status, deleteRequestedBy } = agreement;
  
  const userRequested = user && deleteRequestedBy.includes(user.id);
  const isCreator = user?.id === agreement.creatorId;
  const isRecipient = user?.id === agreement.recipientId;
  
  const canRequestDelete = (status === 'accepted' && !userRequested);
  
  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/agreements/${id}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareUrl());
  };

  return (
    <Card className={cn(
      "w-full overflow-hidden transition-all duration-300",
      isPreview ? "hover:shadow-md" : "",
      status === 'accepted' ? "border-l-4 border-l-accent" : 
      status === 'declined' ? "border-l-4 border-l-destructive" : 
      "border-l-4 border-l-primary"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground">
            From <span className="font-medium text-foreground">{creatorName}</span>
            {recipientName && (
              <>
                {" to "}
                <span className="font-medium text-foreground">{recipientName}</span>
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent>
        <p className={cn(
          "text-foreground",
          truncate ? "line-clamp-3" : ""
        )}>
          {message}
        </p>
      </CardContent>
      {showActions && (
        <CardFooter className="flex justify-between pt-2">
          <div className="flex gap-2">
            {status === 'pending' && isCreator && (
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            )}
            
            {!isPreview && (
              <Link to={`/agreements/${id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </Link>
            )}
          </div>
          
          {canRequestDelete && onRequestDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRequestDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {deleteRequestedBy.length > 0 && !userRequested ? "Confirm Delete" : "Delete"}
            </Button>
          )}
          
          {userRequested && (
            <span className="text-xs text-muted-foreground">
              Waiting for other party to delete...
            </span>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default AgreementCard;
