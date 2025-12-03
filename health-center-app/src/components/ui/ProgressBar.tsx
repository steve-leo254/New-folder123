import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const progressBarVariants = cva(
  'w-full h-2 rounded-full',
  {
    variants: {
      color: {
        primary: 'bg-primary-200',
        success: 'bg-green-200',
        warning: 'bg-yellow-200',
        danger: 'bg-red-200',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  }
);

const progressFillVariants = cva(
  'h-2 rounded-full',
  {
    variants: {
      color: {
        primary: 'bg-primary-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        danger: 'bg-red-600',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  }
);

interface ProgressBarProps extends VariantProps<typeof progressBarVariants> {
  value: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max = 100, 
  showLabel = false,
  color,
  className = '' 
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={progressBarVariants({ color })}>
        <div 
          className={progressFillVariants({ color })} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;