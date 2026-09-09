import React from 'react';
import { Plus } from 'lucide-react';
import ButtonSharedComponent from './ButtonSharedComponent';

export interface PrimaryActionButtonSharedComponentProps {
  label?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  onPointerDown?: React.PointerEventHandler<HTMLButtonElement>;
  icon?: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'navy' | 'green';
  id?: string;
}

export default function PrimaryActionButtonSharedComponent({
  label,
  children,
  onClick,
  onPointerDown,
  icon = <Plus className="w-3.5 h-3.5 !text-white" />,
  disabled = false,
  isLoading = false,
  loadingText,
  type = 'button',
  className = '',
  size = 'sm',
  color = 'navy',
  id,
}: PrimaryActionButtonSharedComponentProps): React.JSX.Element {
  const colorStyles =
    color === 'green'
      ? '!bg-emerald-600 hover:!bg-emerald-700'
      : '!bg-[#0C2086] hover:!bg-[#081765]';

  return (
    <ButtonSharedComponent
      variant="primary"
      size={size}
      type={type}
      id={id}
      onClick={onClick}
      onPointerDown={onPointerDown}
      disabled={disabled}
      isLoading={isLoading}
      loadingText={loadingText}
      className={`${colorStyles} !text-white border-none shadow-sm font-semibold shrink-0 ${className}`}
      icon={icon}
    >
      <span className="!text-white font-medium">{children || label}</span>
    </ButtonSharedComponent>
  );
}
