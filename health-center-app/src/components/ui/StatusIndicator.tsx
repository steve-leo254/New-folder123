import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

const statusVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  {
    variants: {
      status: {
        online: 'bg-green-100 text-green-800',
        offline: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        pending: 'bg-blue-100 text-blue-800',
      },
    },
    defaultVariants: {
      status: 'online',
    },
  }
);

interface StatusIndicatorProps extends VariantProps<typeof statusVariants> {
  label: string;
  showIcon?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  label, 
  showIcon = true 
}) => {
  const getIcon = () => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'offline':
        return <XCircle className="w-3 h-3 mr-1" />;
      case 'warning':
        return <AlertCircle className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <span className={statusVariants({ status })}>
      {showIcon && getIcon()}
      {label}
    </span>
  );
};

export default StatusIndicator;