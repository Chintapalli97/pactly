
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { AgreementStatus } from '@/context/AgreementContext';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AgreementStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          Icon: Clock,
          label: 'Pending',
          variant: 'outline' as const
        };
      case 'accepted':
        return {
          Icon: CheckCircle,
          label: 'Accepted',
          variant: 'default' as const
        };
      case 'declined':
        return {
          Icon: XCircle,
          label: 'Declined',
          variant: 'destructive' as const
        };
      default:
        return {
          Icon: Clock,
          label: 'Unknown',
          variant: 'outline' as const
        };
    }
  };

  const { Icon, label, variant } = getStatusConfig();

  return (
    <Badge variant={variant} className={cn("flex items-center gap-1 font-medium", className)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Badge>
  );
};

export default StatusBadge;
