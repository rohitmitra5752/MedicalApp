'use client';

import Link from 'next/link';
import { Icon, Icons } from '@/components';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Med Tracking Application
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            A medical tracking application with database integration
          </p>
        </header>
        
        {/* Dashboard Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {/* Patient Records Tile */}
          <Link href="/patients" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <Icon name={Icons.USERS} className="text-blue-600 dark:text-blue-400" size="xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Patient Records
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  View and manage patient medical records and history
                </p>
              </div>
            </div>
          </Link>

          {/* Medicine Inventory Tile */}
          <Link href="/medicines" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                  <Icon name={Icons.MEDICINE} className="text-green-600 dark:text-green-400" size="xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Medicine Inventory
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Track and manage medicine stock and inventory
                </p>
              </div>
            </div>
          </Link>

          {/* Admin Panel Tile */}
          <Link href="/admin" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                  <Icon name={Icons.SETTINGS} className="text-purple-600 dark:text-purple-400" size="xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Administration
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Manage parameters, categories, and system settings
                </p>
              </div>
            </div>
          </Link>
        </div>
        
        <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Built with Next.js 15, TypeScript, Tailwind CSS, and SQLite3</p>
        </footer>
      </div>
    </div>
  );
}
