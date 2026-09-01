import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Search, Plus, Sparkles } from 'lucide-react';

export interface CreatableSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

export interface CreatableCustomSelectSharedComponentProps {
  label?: string;
  value: string;
  options: CreatableSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  size?: 'sm' | 'md';
  searchPlaceholder?: string;
  enableSearch?: boolean;
  enableCustomCreation?: boolean;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

export default function CreatableCustomSelectSharedComponent({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select or type custom value...',
  className = 'w-full',
  triggerClassName,
  dropdownClassName,
  size = 'md',
  searchPlaceholder = 'Search options or type custom value...',
  enableSearch = true,
  enableCustomCreation = true,
  required = false,
  disabled = false,
  helperText,
}: CreatableCustomSelectSharedComponentProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value;

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      return;
    }
    if (searchInputRef.current) {
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
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        opt.value.toLowerCase().includes(term) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(term))
    );
  }, [options, searchTerm]);

  const exactMatchExists = options.some(
    (opt) =>
      opt.label.toLowerCase().trim() === searchTerm.toLowerCase().trim() ||
      opt.value.toLowerCase().trim() === searchTerm.toLowerCase().trim()
  );

  const handleSelectOption = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleApplyCustomValue = () => {
    if (!searchTerm.trim()) return;
    onChange(searchTerm.trim());
    setIsOpen(false);
  };

  const heightClass = size === 'sm' ? 'h-9 px-2.5' : 'h-10 px-3';

  return (
    <div className={`space-y-1.5 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-500 font-bold">*</span>}
          </span>
          {enableCustomCreation && value && !selectedOption && (
            <span className="text-[10px] font-mono text-[#0C2086] dark:text-blue-400 flex items-center gap-1 font-semibold">
              <Sparkles className="w-2.5 h-2.5" />
              Custom Value
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between text-xs rounded-xl bg-white dark:bg-zinc-900/80 border border-slate-300 dark:border-zinc-700/80 text-slate-900 dark:text-zinc-100 hover:border-slate-400 dark:hover:border-zinc-600 transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0C2086]/50 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${heightClass} ${triggerClassName || ''}`}
        >
          <div className="flex items-center gap-2 truncate min-w-0 pr-2">
            {selectedOption?.icon}
            {displayLabel ? (
              <span className="truncate font-medium">{displayLabel}</span>
            ) : (
              <span className="text-slate-400 dark:text-zinc-500 truncate">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#0C2086] dark:text-blue-400' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-1.5 max-h-72 overflow-hidden flex flex-col ${
                dropdownClassName || ''
              }`}
            >
              {enableSearch && (
                <div className="p-1 border-b border-slate-100 dark:border-zinc-800/80 mb-1">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredOptions.length === 1) {
                            handleSelectOption(filteredOptions[0].value);
                          } else if (enableCustomCreation && searchTerm.trim()) {
                            handleApplyCustomValue();
                          }
                        }
                      }}
                      placeholder={searchPlaceholder}
                      className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700/60 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#0C2086]/50 focus:border-[#0C2086]"
                    />
                  </div>
                </div>
              )}

              <div className={`overflow-y-auto space-y-0.5 ${enableSearch ? 'max-h-52' : 'max-h-60'} pr-0.5`}>
                {enableCustomCreation && searchTerm.trim().length > 0 && !exactMatchExists && (
                  <button
                    type="button"
                    onClick={handleApplyCustomValue}
                    className="w-full flex items-center gap-2 p-2 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-[#0C2086] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors text-left font-medium mb-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 shrink-0 text-[#0C2086] dark:text-blue-400" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold">
                        Use custom: <span className="underline italic">"{searchTerm.trim()}"</span>
                      </div>
                      <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-mono">
                        Press Enter or click to apply
                      </div>
                    </div>
                  </button>
                )}

                {filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectOption(opt.value)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                        {opt.icon}
                        <div className="truncate min-w-0">
                          <div className="truncate font-medium">{opt.label}</div>
                          {opt.sublabel && (
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                              {opt.sublabel}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">{helperText}</p>
      )}
    </div>
  );
}
