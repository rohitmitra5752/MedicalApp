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
  const [activeCategory, setActiveCategory] = useState('abnormal');

  useEffect(() => {
    if (categories.length > 0 && !['abnormal', ...categories].includes(activeCategory)) {
      setActiveCategory('abnormal');
    }
  }, [categories, activeCategory]);

  // Get all abnormal parameters across all categories
  const getAbnormalParameters = (): Array<{
    parameter_name: string;
    value: number;
    unit: string;
    minimum: number;
    maximum: number;
    isOutOfRange: boolean;
    categoryName: string;
  }> => {
    const abnormalParams: Array<{
      parameter_name: string;
      value: number;
      unit: string;
      minimum: number;
      maximum: number;
      isOutOfRange: boolean;
      categoryName: string;
    }> = [];

    categories.forEach(category => {
      const categoryParams = getParametersForDateAndCategory(date, category);
      categoryParams.forEach(param => {
        if (param.isOutOfRange) {
          abnormalParams.push({
            ...param,
            categoryName: category
          });
        }
      });
    });

    return abnormalParams;
  };

  const abnormalParameters = getAbnormalParameters();
  const parameters = activeCategory === 'abnormal' 
    ? abnormalParameters
    : getParametersForDateAndCategory(date, activeCategory);

  // Create tabs array with "Abnormal Parameters" first
  const allTabs = ['abnormal', ...categories];
  const abnormalCount = abnormalParameters.length;

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
        {allTabs.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative ${
              activeCategory === category
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {category === 'abnormal' ? (
              <div className="flex items-center">
                <span>Abnormal Parameters</span>
                {abnormalCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {abnormalCount}
                  </span>
                )}
              </div>
            ) : (
              category
            )}
          </button>
        ))}
      </div>

      {/* Parameter Cards */}
      <div className="p-6">
        {parameters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {activeCategory === 'abnormal' 
                ? 'No abnormal parameters found. All values are within normal ranges!'
                : `No parameters found for ${activeCategory}`
              }
            </p>
            {activeCategory === 'abnormal' && (
              <div className="mt-2 text-green-600 dark:text-green-400">
                <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Great health indicators!</span>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parameters.map((param, index) => {
              const isAbnormalTab = activeCategory === 'abnormal';
              const abnormalParam = isAbnormalTab ? param as (typeof param & { categoryName: string }) : null;
              
              return (
                <div 
                  key={isAbnormalTab ? `${param.parameter_name}-${index}` : param.parameter_name} 
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
                    {isAbnormalTab && abnormalParam && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {abnormalParam.categoryName}
                      </span>
                    )}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
