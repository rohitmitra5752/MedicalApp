import React from 'react';
import { Icon, Icons } from '@/components/icons';
import { SexSelectorProps } from '../types';

export function SexSelector({ value, onChange, className = '' }: SexSelectorProps) {
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
          {/* Male silhouette */}
          <Icon 
            name={Icons.MALE}
            className={`mb-2 ${value === 'male' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
            size="xl"
          />
          
          {/* Selection indicator */}
          {value === 'male' && (
            <div className="absolute top-2 right-2">
              <div className="w-5 h-5 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center">
                <Icon name={Icons.CHECK} className="text-white" size="xs" />
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
          {/* Female silhouette */}
          <Icon
            name={Icons.FEMALE}
            className={`mb-2 ${value === 'female' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-400'}`}
            size="xl"
          />
          
          {/* Selection indicator */}
          {value === 'female' && (
            <div className="absolute top-2 right-2">
              <div className="w-5 h-5 bg-pink-600 dark:bg-pink-400 rounded-full flex items-center justify-center">
                <Icon name={Icons.CHECK} className="text-white" size="xs" />
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
