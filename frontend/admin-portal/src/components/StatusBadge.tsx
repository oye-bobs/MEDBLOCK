import React from 'react';
import { getStatusColor } from '../utils/colors';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showDot = true }) => {
  const colors = getStatusColor(status);
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${colors.bg} ${colors.text} ${sizeClasses[size]}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>}
      {status}
    </span>
  );
};

export default StatusBadge;
