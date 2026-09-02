'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  /** When true, an "Other" option is appended. Selecting it reveals a text input. */
  allowOther?: boolean;
  /** Placeholder for the "Other" text input */
  otherPlaceholder?: string;
  error?: string;
}

const OTHER_VALUE = '__OTHER__';

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  label,
  allowOther = false,
  otherPlaceholder = 'Type a custom value...',
  error,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOtherMode, setIsOtherMode] = useState(false);
  const [otherValue, setOtherValue] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  // Determine if current value is a custom "other" value
  const isCurrentValueOther = value && !options.some(opt => opt.value === value);

  useEffect(() => {
    if (isCurrentValueOther && value) {
      setIsOtherMode(true);
      setOtherValue(value);
    }
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOtherMode && otherInputRef.current) {
      otherInputRef.current.focus();
    }
  }, [isOtherMode]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (optionValue === OTHER_VALUE) {
      setIsOtherMode(true);
      setOtherValue('');
      setIsOpen(false);
      setSearchQuery('');
      return;
    }
    setIsOtherMode(false);
    setOtherValue('');
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleOtherConfirm = () => {
    if (otherValue.trim()) {
      onChange(otherValue.trim());
    }
  };

  const handleClearOther = () => {
    setIsOtherMode(false);
    setOtherValue('');
    onChange('');
  };

  const displayValue = isOtherMode
    ? (otherValue || 'Custom value...')
    : (selectedOption ? selectedOption.label : '');

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {isOtherMode ? (
        <div className="flex gap-2">
          <input
            ref={otherInputRef}
            type="text"
            value={otherValue}
            onChange={(e) => {
              setOtherValue(e.target.value);
              onChange(e.target.value);
            }}
            onBlur={handleOtherConfirm}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleOtherConfirm();
              }
            }}
            placeholder={otherPlaceholder}
            className="flex-1 px-3 py-2 text-sm bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
          />
          <button
            type="button"
            onClick={handleClearOther}
            className="px-2 py-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Back to dropdown"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div ref={selectRef} className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`w-full px-3 py-2 text-sm text-left bg-white border rounded-lg focus:ring-2 focus:ring-[#5B94E5] focus:border-[#5B94E5] transition-colors flex items-center justify-between ${
              error ? 'border-red-300' : 'border-gray-300'
            } ${
              disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-gray-400'
            }`}
          >
            <span className={displayValue ? 'text-gray-900' : 'text-gray-500'}>
              {displayValue || placeholder}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {/* Search input */}
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#5B94E5] focus:border-[#5B94E5] outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && filteredOptions.length === 1) {
                        handleSelect(filteredOptions[0].value);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Options list */}
              <div className="max-h-52 overflow-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-gray-500 text-center">
                    No matches found
                    {allowOther && (
                      <button
                        type="button"
                        onClick={() => handleSelect(OTHER_VALUE)}
                        className="block w-full mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        + Enter a custom value
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {filteredOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                          value === option.value ? 'bg-blue-50' : ''
                        }`}
                      >
                        <span className={value === option.value ? 'text-gray-900 font-medium' : 'text-gray-700'}>
                          {option.label}
                        </span>
                        {value === option.value && (
                          <Check className="w-4 h-4 text-[#5B94E5]" />
                        )}
                      </button>
                    ))}

                    {allowOther && !searchQuery && (
                      <>
                        <div className="border-t border-gray-100" />
                        <button
                          type="button"
                          onClick={() => handleSelect(OTHER_VALUE)}
                          className="w-full px-3 py-2 text-sm text-left text-amber-600 hover:bg-amber-50 transition-colors font-medium"
                        >
                          + Other (type custom value)
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
