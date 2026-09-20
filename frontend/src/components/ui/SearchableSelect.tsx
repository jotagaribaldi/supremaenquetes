'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  onChange?: (value: string) => void;
  onBlur?: (e?: React.FocusEvent<any>) => void;
  value?: string;
  id?: string;
  className?: string;
}

export const SearchableSelect = forwardRef<HTMLInputElement, SearchableSelectProps>(
  ({ className, label, error, options, placeholder, searchPlaceholder = 'Buscar...', onChange, value = '', id, onBlur, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedValue, setSelectedValue] = useState(value);
    const [selectedLabel, setSelectedLabel] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(hiddenInputRef.current!);
        } else {
          ref.current = hiddenInputRef.current!;
        }
      }
    }, [ref]);

    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const filteredOptions = options.filter(opt =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (option: { value: string; label: string }) => {
      setSelectedValue(option.value);
      setSelectedLabel(option.label);
      setSearchQuery('');
      setIsOpen(false);
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = option.value;
        hiddenInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
      onChange?.(option.value);
      onBlur?.(undefined as any);
      inputRef.current?.blur();
    };

    const handleHiddenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const handleHiddenBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      if (e.key === 'Enter' && filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
      const option = options.find(o => o.value === value);
      if (option) {
        setSelectedLabel(option.label);
        setSelectedValue(option.value);
      } else if (!value) {
        setSelectedLabel('');
        setSelectedValue('');
      }
    }, [value, options]);

    const displayValue = selectedLabel || (placeholder ? placeholder : 'Selecione');

    const inputValue = isOpen ? searchQuery : (searchQuery || displayValue);

    return (
      <div ref={containerRef} className={cn('w-full', className)}>
        <input
          ref={hiddenInputRef}
          type="hidden"
          value={selectedValue}
          onChange={handleHiddenChange}
          onBlur={handleHiddenBlur}
          {...props}
        />
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <div
            className={cn(
              'flex items-center h-10 w-full rounded-md border px-3 py-2 text-sm bg-white cursor-pointer transition-colors',
              error ? 'border-red-500 focus-within:ring-red-500' : 'border-gray-300 focus-within:ring-primary-500 focus-within:border-transparent',
              isOpen && 'ring-2'
            )}
            onClick={() => {
              const wasOpen = isOpen;
              setIsOpen(!wasOpen);
              if (!wasOpen) {
                setSearchQuery('');
                setTimeout(() => inputRef.current?.focus(), 0);
              }
            }}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label={label}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              placeholder={!isOpen && !selectedValue ? placeholder : searchPlaceholder}
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
              readOnly={!isOpen}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onClick={(e) => {
                e.stopPropagation();
                if (!isOpen) {
                  setIsOpen(true);
                  setSearchQuery('');
                }
              }}
              aria-autocomplete="list"
              aria-controls={`${selectId}-options`}
            />
            <svg
              className={cn(
                'h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {isOpen && (
            <div
              ref={dropdownRef}
              id={`${selectId}-options`}
              className="absolute z-50 w-full mt-1 rounded-md border border-gray-300 bg-white shadow-lg max-h-60 overflow-auto"
              role="listbox"
            >
              {searchQuery && filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">Nenhuma opção encontrada</div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'px-3 py-2 text-sm cursor-pointer hover:bg-gray-100',
                      selectedValue === option.value && 'bg-primary-50 text-primary-700 font-medium'
                    )}
                    role="option"
                    aria-selected={selectedValue === option.value}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

SearchableSelect.displayName = 'SearchableSelect';