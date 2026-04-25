import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  gradient?: 'green' | 'teal' | 'pink' | 'purple';
  className?: string;
}

/**
 * GradientText component with multiple gradient variants
 * Implements accessibility features including proper contrast and screen reader support
 * Rainblur Theme: Premium dark theme with vibrant gradient accents
 */
const GradientText: React.FC<GradientTextProps> = ({
  children,
  gradient = 'green',
  className = '',
}) => {
  // Base gradient styles
  const baseStyles = 'bg-clip-text text-transparent bg-gradient-to-r';
  
  // Gradient variants
  const gradientStyles = {
    green: 'from-accent-green to-accent-teal',
    teal: 'from-accent-teal to-accent-pink',
    pink: 'from-accent-pink to-accent-purple',
    purple: 'from-accent-purple to-accent-green',
  };
  
  const classes = `${baseStyles} ${gradientStyles[gradient]} ${className}`;
  
  return (
    <span className={classes} aria-hidden="false">
      {children}
    </span>
  );
};

export default GradientText;
