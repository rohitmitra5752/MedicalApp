'use client';

import React, { useState } from 'react';
import { Icon, Icons } from '@/components';

// This page is for development only - showcasing all available icons
// It should not be linked from the main navigation or production builds

export default function DevIconsPage() {
  const [selectedSize, setSelectedSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md');
  const [darkMode, setDarkMode] = useState(false);

  // Get all icon names from the Icons object
  const iconEntries = Object.entries(Icons) as [string, string][];

  // Group icons by category for better organization
  const categories = {
    'Basic Actions': ['EDIT', 'DELETE', 'ADD', 'CHECK', 'CLOSE'],
    'Navigation': ['ARROW_LEFT', 'ARROW_RIGHT', 'CHEVRON_RIGHT', 'CHEVRON_DOWN'],
    'User & Medical': ['USER', 'USERS', 'MEDICINE', 'SETTINGS'],
    'Documents & Data': ['DOCUMENT', 'DOWNLOAD', 'UPLOAD', 'CHART', 'TABLE'],
    'Status & Feedback': ['SPINNER', 'WARNING', 'INFO', 'SUCCESS', 'ERROR', 'SUCCESS_CIRCLE', 'WARNING_TRIANGLE'],
    'UI Elements': ['GRID', 'GRIP_VERTICAL'],
    'Gender Icons': ['MALE', 'FEMALE'],
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎨 Icon Showcase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Development-only page to preview all available icons in the system
          </p>
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Development Only:</strong> This page is for development purposes and should not be accessible in production.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-6">
            {/* Size Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="xs">XS (16px)</option>
                <option value="sm">SM (20px)</option>
                <option value="md">MD (24px)</option>
                <option value="lg">LG (32px)</option>
                <option value="xl">XL (48px)</option>
                <option value="2xl">2XL (64px)</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme:</label>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-white border border-gray-600'
                    : 'bg-gray-100 text-gray-900 border border-gray-300'
                }`}
              >
                {darkMode ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>

            {/* Icon Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Icons: <span className="font-semibold">{iconEntries.length}</span>
            </div>
          </div>
        </div>

        {/* Icon Categories */}
        <div className="space-y-8">
          {Object.entries(categories).map(([categoryName, iconNames]) => (
            <div key={categoryName} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {categoryName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {iconNames.length} icons
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                  {iconNames.map((iconKey) => {
                    const iconValue = Icons[iconKey as keyof typeof Icons];
                    return (
                      <div
                        key={iconKey}
                        className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="mb-3 p-2">
                          <Icon
                            name={iconValue}
                            size={selectedSize}
                            className="text-gray-700 dark:text-gray-300"
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                            {iconKey}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {iconValue}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Examples */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Usage Examples</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Import Example */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Import:</h3>
                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-sm overflow-x-auto">
                  <code className="text-gray-800 dark:text-gray-200">
{`import { Icon, Icons } from '@/components';`}
                  </code>
                </pre>
              </div>

              {/* Usage Example */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usage:</h3>
                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-sm overflow-x-auto">
                  <code className="text-gray-800 dark:text-gray-200">
{`<Icon name={Icons.EDIT} size="md" className="text-blue-600" />
<Icon name={Icons.DELETE} size="lg" className="text-red-500" />
<Icon name={Icons.ADD} size="xl" className="text-green-600" />`}
                  </code>
                </pre>
              </div>

              {/* Live Example */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Live Example:</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <Icon name={Icons.EDIT} size="md" className="text-blue-600" />
                  <Icon name={Icons.DELETE} size="lg" className="text-red-500" />
                  <Icon name={Icons.ADD} size="xl" className="text-green-600" />
                  <Icon name={Icons.MEDICINE} size="2xl" className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>This page is available only in development mode</p>
        </div>
      </div>
    </div>
  );
}
