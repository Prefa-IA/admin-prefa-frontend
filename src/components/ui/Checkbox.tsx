import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, error, className = '', id, ...props }) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          className={`
            h-4 w-4 rounded border-gray-300 text-primary-600
            focus:ring-primary-500 focus:ring-2
            dark:border-gray-600 dark:bg-gray-800
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {label && (
        <label
          htmlFor={checkboxId}
          className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400 ml-3">{error}</p>}
    </div>
  );
};

export default Checkbox;
