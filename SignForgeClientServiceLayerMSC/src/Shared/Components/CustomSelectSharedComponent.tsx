import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

export interface SelectFooterAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface CustomSelectSharedComponentProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  size?: 'sm' | 'md';
  searchable?: boolean;
  searchPlaceholder?: string;
  footerAction?: SelectFooterAction;
}

export default function CustomSelectSharedComponent({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select option...',
  className = 'w-full',
  triggerClassName,
  dropdownClassName,
  size = 'md',
  searchable = false,
  searchPlaceholder = 'Search options...',
  footerAction,
}: CustomSelectSharedComponentProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      return;
    }
    if (searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
    }, 10);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, searchable]);

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        opt.value.toLowerCase().includes(term) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(term))
    );
  }, [options, searchable, searchTerm]);

  const heightClass = size === 'sm' ? 'h-9 px-2.5' : 'h-10 px-3';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1 block">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${className.includes('w-') ? 'w-full' : ''} ${heightClass} rounded-lg bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-zinc-100 border border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors focus:outline-none text-xs flex items-center justify-between gap-2 cursor-pointer select-none ${triggerClassName || ''}`}
      >
        <div className="flex items-center gap-2 truncate font-medium">
          {selectedOption?.icon}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-slate-700 dark:text-zinc-200' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute left-0 right-0 min-w-[200px] top-full mt-1.5 z-50 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-1 text-xs space-y-0.5 max-h-64 overflow-y-auto ${dropdownClassName || ''}`}
          >
            {searchable && (
              <div className="p-1.5 border-b border-slate-100 dark:border-zinc-800/80 mb-1">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-[#0C2086] transition-all"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="py-3 px-2 text-center text-xs text-slate-400 dark:text-zinc-500">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-zinc-800/90 text-slate-900 dark:text-white font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                      {option.icon}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{option.label}</div>
                        {option.sublabel && (
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">
                            {option.sublabel}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                    )}
                  </button>
                );
              })
            )}

            {footerAction && (
              <div className="pt-1 mt-1 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    footerAction.onClick();
                  }}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0C2086] dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer text-left"
                >
                  {footerAction.icon}
                  <span className="truncate">{footerAction.label}</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
