import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode; // Added icon prop
  multiline?: boolean; // Added multiline prop for textarea
  rows?: number; // For textarea rows
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      fullWidth = false,
      icon,
      multiline = false,
      rows = 4,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>} // Cast ref for textarea
              className={`
                px-4 py-2 border rounded-md shadow-sm
                ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                text-gray-900 dark:text-gray-200
                bg-white dark:bg-gray-700
                ${fullWidth ? 'w-full' : ''}
                ${className}
              `}
              rows={rows}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} // Cast props for textarea
            />
          ) : (
            <input
              ref={ref}
              className={`
                px-4 py-2 border rounded-md shadow-sm
                ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                text-gray-900 dark:text-gray-200
                bg-white dark:bg-gray-700
                ${fullWidth ? 'w-full' : ''}
                ${icon ? 'pl-10' : ''} // Add padding-left if icon exists
                ${className}
              `}
              {...props}
            />
          )}
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {icon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;