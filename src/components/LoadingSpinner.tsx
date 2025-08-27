import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`
        ${sizeClasses[size]} border-4 border-muted-foreground/20 border-t-ton rounded-full animate-spin
      `} />
      {text && (
        <p className="text-muted-foreground mt-2 text-sm">{text}</p>
      )}
    </div>
  );
};
