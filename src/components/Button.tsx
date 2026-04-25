import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Button component with multiple variants and sizes
 * Implements accessibility features including keyboard navigation and focus management
 * Rainblur Theme: Premium dark theme with gradient accents
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-accent-green to-accent-teal text-primary-foreground hover:shadow-glow-green hover:scale-[1.02]',
    secondary: 'bg-transparent border border-border text-foreground hover:bg-muted',
    ghost: 'bg-transparent text-foreground hover:bg-muted hover:text-foreground',
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <button
      className={classes}
      disabled={disabled}
      aria-disabled={disabled ? 'true' : 'false'}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
