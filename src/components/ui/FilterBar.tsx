import React from 'react';
import SearchInput from './SearchInput';
import Select from './Select';

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  actions,
  className = ''
}) => {
  return (
    <div className={`mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${className}`}>
      <div className="flex-1 w-full sm:w-auto">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="w-full"
        />
      </div>
      
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {filters.map((filter, idx) => (
            <div key={idx} className="w-full sm:w-auto min-w-[150px]">
              <Select
                label={filter.label}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                options={filter.options}
              />
            </div>
          ))}
        </div>
      )}
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default FilterBar;

