import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Card component with interactive variants, header and footer sections
 * Implements accessibility features including semantic HTML and focus management
 * Rainblur Theme: Premium dark theme with glassmorphism effect
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  header,
  footer,
}) => {
  // Base card styles
  const baseStyles = 'bg-card backdrop-blur-sm border border-border rounded-xl p-6 shadow-card';
  
  // Interactive styles
  const interactiveStyles = onClick
    ? 'cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
    : '';
  
  // Hover styles for interactive cards
  const hoverStyles = hoverable && onClick
    ? 'hover:shadow-glow-purple'
    : '';
  
  const classes = `${baseStyles} ${interactiveStyles} ${hoverStyles} ${className}`;
  
  const cardContent = (
    <>
      {header && (
        <div className="mb-4 pb-4 border-b border-border">
          {header}
        </div>
      )}
      
      <div className="flex-1">
        {children}
      </div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-border">
          {footer}
        </div>
      )}
    </>
  );
  
  if (onClick) {
    return (
      <div
        className={classes}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={typeof children === 'string' ? children : undefined}
      >
        {cardContent}
      </div>
    );
  }
  
  return <div className={classes}>{cardContent}</div>;
};

export default Card;
