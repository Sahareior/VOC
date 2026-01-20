'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  rounded?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { children, className, variant = 'default', size = 'md', rounded = false, ...props },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center font-medium transition-colors duration-200';

    const variants = {
      default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
      success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
    };

    const roundedStyles = rounded ? 'rounded-full' : 'rounded-md';

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], roundedStyles, className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
