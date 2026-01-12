import React, { useState } from 'react';
import { Search, X, Calendar, ChevronDown } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  type: 'text' | 'select' | 'date' | 'multiselect';
  label: string;
  field: string;
  options?: FilterOption[];
}

interface FilterPanelProps {
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
  onClear?: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onClear }) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...activeFilters, [field]: value };
    if (!value || value === '') {
      delete newFilters[field];
    }
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    setActiveFilters({});
    onFilterChange({});
    onClear?.();
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-neutral-400" />
          <h3 className="font-semibold text-neutral-800">Filters</h3>
          {hasActiveFilters && (
            <span className="badge-primary">{Object.keys(activeFilters).length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button onClick={handleClear} className="text-sm text-red-600 hover:text-red-700 font-medium">
              Clear All
            </button>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-neutral-100 rounded"
          >
            <ChevronDown size={16} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
          {filters.map((filter) => (
            <div key={filter.field}>
              <label className="label">{filter.label}</label>
              {filter.type === 'text' && (
                <input
                  type="text"
                  className="input"
                  placeholder={`Search ${filter.label.toLowerCase()}...`}
                  value={activeFilters[filter.field] || ''}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                />
              )}
              {filter.type === 'select' && (
                <select
                  className="input"
                  value={activeFilters[filter.field] || ''}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                >
                  <option value="">All</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              {filter.type === 'date' && (
                <input
                  type="date"
                  className="input"
                  value={activeFilters[filter.field] || ''}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
