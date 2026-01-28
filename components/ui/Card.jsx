'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';


const Card = forwardRef(({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  ...props
}, ref) => {
  const baseStyles =
    'rounded-xl bg-white dark:bg-slate-900 transition-all duration-300';

  const variants = {
    default: 'border border-slate-200 dark:border-slate-700 shadow-card',
    elevated: 'shadow-card-hover border border-transparent',
    outlined: 'border-2 border-slate-200 dark:border-slate-700 shadow-none',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  const hoverStyles = hoverable
    ? 'hover:-translate-y-1 hover:shadow-card-hover cursor-pointer'
    : '';

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

const CardContent = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('mt-4 flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };