// Color utilities for status indicators and charts

export const statusColors = {
  active: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  suspended: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  inactive: { bg: 'bg-neutral-100', text: 'text-neutral-800', dot: 'bg-neutral-500' },
  online: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  offline: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  ready: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  partial: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  revoked: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  recovered: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
};

export const chartColors = {
  primary: '#007BFF',
  secondary: '#6C757D',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  purple: '#6F42C1',
  indigo: '#6610F2',
  pink: '#E83E8C',
  orange: '#FD7E14',
};

export const chartPalette = [
  '#007BFF', '#28A745', '#FFC107', '#DC3545', '#17A2B8',
  '#6F42C1', '#FD7E14', '#E83E8C', '#6610F2', '#20C997'
];

export function getStatusColor(status: string): { bg: string; text: string; dot: string } {
  const normalizedStatus = status.toLowerCase();
  return statusColors[normalizedStatus as keyof typeof statusColors] || statusColors.inactive;
}
