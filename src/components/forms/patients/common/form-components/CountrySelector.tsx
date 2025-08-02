import { useState, useEffect, useRef } from 'react';
import { FlagIcon } from './FlagIcon';
import { Icon, Icons } from '@/components/icons';

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Common country codes
const countryCodes = [
  { code: '+91', country: 'India', flag: 'IN' },
  { code: '+1', country: 'US/CA', flag: 'US' },
  { code: '+44', country: 'UK', flag: 'GB' },
  { code: '+86', country: 'China', flag: 'CN' },
  { code: '+49', country: 'Germany', flag: 'DE' },
  { code: '+33', country: 'France', flag: 'FR' },
  { code: '+81', country: 'Japan', flag: 'JP' },
  { code: '+61', country: 'Australia', flag: 'AU' },
  { code: '+55', country: 'Brazil', flag: 'BR' },
  { code: '+52', country: 'Mexico', flag: 'MX' },
  { code: '+34', country: 'Spain', flag: 'ES' },
  { code: '+39', country: 'Italy', flag: 'IT' },
  { code: '+7', country: 'Russia', flag: 'RU' },
  { code: '+82', country: 'South Korea', flag: 'KR' },
  { code: '+31', country: 'Netherlands', flag: 'NL' },
  { code: '+46', country: 'Sweden', flag: 'SE' },
  { code: '+47', country: 'Norway', flag: 'NO' },
  { code: '+45', country: 'Denmark', flag: 'DK' },
  { code: '+41', country: 'Switzerland', flag: 'CH' },
  { code: '+43', country: 'Austria', flag: 'AT' }
];

export const CountrySelector = ({ 
  value, 
  onChange, 
  className 
}: CountrySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCountry = countryCodes.find(c => c.code === value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} flex items-center justify-between w-full text-left overflow-hidden`}
      >
        <div className="flex items-center min-w-0 flex-1">
          <FlagIcon countryCode={selectedCountry?.flag || 'IN'} />
          <span className="truncate">{selectedCountry?.code}</span>
        </div>
        <Icon 
          name={Icons.CHEVRON_DOWN} 
          className={`ml-1 flex-shrink-0 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          size="sm"
        />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {countryCodes.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => {
                onChange(country.code);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center transition-colors relative group overflow-hidden"
              title={country.country}
            >
              <div className="flex items-center min-w-0 flex-1">
                <FlagIcon countryCode={country.flag} />
                <span className="font-medium truncate">{country.code}</span>
              </div>
              {/* Tooltip */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                {country.country}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
