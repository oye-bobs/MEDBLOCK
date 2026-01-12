import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string | number;
  color?: 'blue' | 'green' | 'indigo' | 'orange' | 'red' | 'purple' | 'yellow';
  subtitle?: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'bg-blue-500' },
  green: { bg: 'bg-green-50', text: 'text-green-600', ring: 'bg-green-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'bg-indigo-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'bg-orange-500' },
  red: { bg: 'bg-red-50', text: 'text-red-600', ring: 'bg-red-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'bg-purple-500' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'bg-yellow-500' },
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'blue',
  subtitle 
}) => {
  const colors = colorMap[color];

  return (
    <div className="card-hover group relative">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-110 transition-transform ${colors.ring}`}></div>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
          <Icon size={24} />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}%
          </div>
        )}
      </div>
      <p className="text-neutral-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-neutral-900 mt-1">{value}</h3>
      {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
