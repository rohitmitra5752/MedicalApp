'use client';

import { useState, useEffect } from 'react';

interface DateReportCardProps {
  date: string;
  categories: string[];
  getParametersForDateAndCategory: (date: string, categoryName: string) => Array<{
    parameter_name: string;
    value: number;
    unit: string;
    minimum: number;
    maximum: number;
    isOutOfRange: boolean;
  }>;
  formatDate: (date: string) => string;
  patientId: string;
  onEdit: (date: string) => void;
  onDelete: (date: string) => void;
}

export default function DateReportCard({ date, categories, getParametersForDateAndCategory, formatDate, patientId, onEdit, onDelete }: DateReportCardProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0] || '');

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const parameters = getParametersForDateAndCategory(date, activeCategory);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Date Header */}
      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {formatDate(date)}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(date)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => onDelete(date)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeCategory === category
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Parameter Cards */}
      <div className="p-6">
        {parameters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No parameters found for {activeCategory}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parameters.map((param) => (
              <div 
                key={param.parameter_name} 
                className={`p-4 rounded-lg border-2 ${
                  param.isOutOfRange 
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <h4 className={`font-medium text-sm mb-2 ${
                  param.isOutOfRange 
                    ? 'text-red-700 dark:text-red-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {param.parameter_name}
                </h4>
                <div className={`text-xl font-bold mb-1 ${
                  param.isOutOfRange 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {param.value} {param.unit}
                </div>
                {param.isOutOfRange && (
                  <div className="text-xs text-red-600 dark:text-red-400">
                    Normal: {param.minimum}-{param.maximum} {param.unit}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
