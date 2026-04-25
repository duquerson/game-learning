import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Input component with focus, error, and disabled states
 * Implements accessibility features including proper form associations and error announcements
 * Rainblur Theme: Premium dark theme with light input background
 */
const Input: React.FC<InputProps> = ({
  error,
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  // Base styles
  const baseStyles = 'w-full bg-input text-input-foreground placeholder:text-muted-foreground px-4 py-3 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed';
  
  // State styles
  const stateStyles = error
    ? 'border-destructive focus:border-destructive focus:ring-destructive'
    : '';
  
  // Size styles
  const sizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  const classes = `${baseStyles} ${stateStyles} ${sizeStyles[size]} ${className}`;
  
  return (
    <div className="relative">
      <input
        className={classes}
        disabled={disabled}
        aria-disabled={disabled ? 'true' : 'false'}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${props.id}-error`}
          className="absolute top-full mt-1 text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
