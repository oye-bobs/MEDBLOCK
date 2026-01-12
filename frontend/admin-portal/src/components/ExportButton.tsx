import React from 'react';
import { Download } from 'lucide-react';
import { exportToCSV, exportToPDF, exportToExcel } from '../utils/export';

interface ExportButtonProps {
  data: any[];
  filename: string;
  formats?: ('csv' | 'pdf' | 'excel')[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  data, 
  filename, 
  formats = ['csv', 'pdf', 'excel'] 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    switch (format) {
      case 'csv':
        exportToCSV(data, filename);
        break;
      case 'pdf':
        exportToPDF('export-content', filename);
        break;
      case 'excel':
        exportToExcel(data, filename);
        break;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-outline flex items-center gap-2"
      >
        <Download size={16} />
        Export
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20">
            {formats.includes('csv') && (
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm font-medium text-neutral-700"
              >
                Export as CSV
              </button>
            )}
            {formats.includes('excel') && (
              <button
                onClick={() => handleExport('excel')}
                className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm font-medium text-neutral-700"
              >
                Export as Excel
              </button>
            )}
            {formats.includes('pdf') && (
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm font-medium text-neutral-700"
              >
                Export as PDF
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
