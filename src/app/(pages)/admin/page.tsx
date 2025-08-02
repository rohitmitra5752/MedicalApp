'use client';

import { BackButton, Icon, Icons } from '@/components';
import { ImportExportParameters, ParameterManagement } from '@/components/forms';

export default function AdminPage() {
  const handleDataUpdate = () => {
    // Data updates are now handled internally by each component
    // No need to force re-renders from the parent
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <BackButton href="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
              Back to Home
            </BackButton>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Administration Panel
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Manage medical parameter categories, parameters, and system settings
            </p>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="space-y-8">
          {/* Parameter Management Section */}
          <ParameterManagement onDataUpdate={handleDataUpdate} />

          {/* System Settings Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <Icon name={Icons.INFO} size="lg" className="mr-3 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">System Settings</h2>
            </div>
            
            <ImportExportParameters onDataUpdate={handleDataUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}
