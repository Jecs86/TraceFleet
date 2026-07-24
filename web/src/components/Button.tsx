import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  to?: string;
  className?: string;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  to,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyle = 'font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary text-text-on-primary hover:bg-primary-variant shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none',
    secondary: 'bg-secondary text-white hover:bg-opacity-90 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none',
    danger: 'bg-error text-white hover:bg-opacity-90 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none',
    outline: 'border border-border bg-surface text-text-muted hover:bg-card hover:text-text-heading shadow-sm disabled:opacity-50',
    ghost: 'text-text-muted hover:bg-card hover:text-text-heading rounded-full transition-colors p-2 disabled:opacity-50'
  };

  const combinedClassName = `${baseStyle} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
