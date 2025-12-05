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
  className = '',
}) => {
  return (
    <div
      className={`mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4 items-stretch sm:items-center ${className}`}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
        <div className="flex-1 w-full sm:w-auto min-w-0">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="w-full"
          />
        </div>

        {filters.length > 0 && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
            {filters.map((filter, idx) => (
              <div key={idx} className="w-full sm:w-auto sm:min-w-[150px]">
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
      </div>

      {actions && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
