import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import ApplicationHapticsUtility from '../../Utilities/ApplicationHapticsUtility';

export interface ButtonSharedComponentProps {
  children: React.ReactNode;
  onClick?: () => void;
  onPointerDown?: React.PointerEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  leftIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
  id?: string;
}

export default function ButtonSharedComponent({
  children,
  onClick,
  onPointerDown,
  variant = 'primary',
  size = 'md',
  icon,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  isLoading = false,
  loadingText,
  type = 'button',
  className = '',
  title,
  id,
}: ButtonSharedComponentProps): React.JSX.Element {
  let baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl sm:rounded-lg cursor-pointer select-none transition-colors duration-200 focus:outline-none whitespace-nowrap';

  let sizeStyles = '';
  if (size === 'sm') {
    sizeStyles = 'px-3.5 sm:px-3 py-2 sm:py-1.5 text-sm sm:text-xs h-10 sm:h-8 gap-1.5';
  } else if (size === 'lg') {
    sizeStyles = 'px-5 py-3 sm:py-2.5 text-base sm:text-sm h-12 sm:h-11 gap-2.5';
  } else {
    sizeStyles = 'px-4 py-2.5 sm:py-2 text-sm sm:text-xs h-11 sm:h-9 gap-2';
  }

  let variantStyles = '';
  if (variant === 'primary') {
    variantStyles =
      'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-sm';
  } else if (variant === 'secondary') {
    variantStyles = 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 hairline-border';
  } else if (variant === 'ghost') {
    variantStyles =
      'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 hairline-border';
  } else if (variant === 'outline') {
    variantStyles =
      'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60 hairline-border-strong';
  } else if (variant === 'danger') {
    variantStyles = 'bg-red-600 text-white hover:bg-red-700 shadow-sm';
  }

  const widthStyle = fullWidth ? 'w-full' : '';
  const isButtonDisabled = disabled || isLoading;
  const disabledStyle = isButtonDisabled ? 'opacity-70 cursor-not-allowed pointer-events-none' : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      onPointerDown={(e) => {
        ApplicationHapticsUtility.current.triggerHapticFeedback(12);
        onPointerDown?.(e);
      }}
      disabled={isButtonDisabled}
      title={title}
      id={id}
      whileHover={isButtonDisabled ? {} : { scale: 1.01 }}
      whileTap={isButtonDisabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${disabledStyle} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 animate-spin shrink-0 text-current" />
      ) : (
        icon && <span className="inline-flex items-center shrink-0">{leftIcon || icon}</span>
      )}
      <span className="inline-flex items-center whitespace-nowrap">{isLoading && loadingText ? loadingText : children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex items-center shrink-0">{rightIcon}</span>
      )}
    </motion.button>
  );
}
