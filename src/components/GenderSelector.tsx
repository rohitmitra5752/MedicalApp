import React from 'react';

interface GenderSelectorProps {
  value: 'male' | 'female' | '';
  onChange: (gender: 'male' | 'female') => void;
  className?: string;
}

export function GenderSelector({ value, onChange, className = '' }: GenderSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        {/* Male Option */}
        <button
          type="button"
          onClick={() => onChange('male')}
          className={`
            relative p-6 rounded-lg border-2 transition-all duration-200 
            flex flex-col items-center justify-center min-h-[120px]
            ${value === 'male' 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }
          `}
        >
          {/* Male silhouette SVG */}
          <svg 
            className={`w-12 h-12 mb-2 ${value === 'male' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 9.55 14.55 10 14 10C13.45 10 13 9.55 13 9V7H11V9C11 9.55 10.55 10 10 10C9.45 10 9 9.55 9 9V7H3V9C3 10.1 3.9 11 5 11V20C5 21.1 5.9 22 7 22H9V16H11V22H13V16H15V22H17C18.1 22 19 21.1 19 20V11C20.1 11 21 10.1 21 9Z"/>
          </svg>
          
          {/* Selection indicator */}
          {value === 'male' && (
            <div className="absolute top-2 right-2">
              <div className="w-5 h-5 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
          
          <span className={`text-sm font-medium ${value === 'male' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
            Male
          </span>
        </button>

        {/* Female Option */}
        <button
          type="button"
          onClick={() => onChange('female')}
          className={`
            relative p-6 rounded-lg border-2 transition-all duration-200 
            flex flex-col items-center justify-center min-h-[120px]
            ${value === 'female' 
              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' 
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }
          `}
        >
          {/* Female silhouette SVG */}
          <svg 
            className={`w-12 h-12 mb-2 ${value === 'female' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-400'}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM16 8C16 8.55 15.55 9 15 9C14.45 9 14 8.55 14 8V7H10V8C10 8.55 9.55 9 9 9C8.45 9 8 8.55 8 8V7H6V17C6 18.1 6.9 19 8 19V21C8 21.55 8.45 22 9 22C9.55 22 10 21.55 10 21V19H14V21C14 21.55 14.45 22 15 22C15.55 22 16 21.55 16 21V19C17.1 19 18 18.1 18 17V7H16V8Z"/>
          </svg>
          
          {/* Selection indicator */}
          {value === 'female' && (
            <div className="absolute top-2 right-2">
              <div className="w-5 h-5 bg-pink-600 dark:bg-pink-400 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
          
          <span className={`text-sm font-medium ${value === 'female' ? 'text-pink-700 dark:text-pink-300' : 'text-gray-600 dark:text-gray-400'}`}>
            Female
          </span>
        </button>
      </div>
    </div>
  );
}
