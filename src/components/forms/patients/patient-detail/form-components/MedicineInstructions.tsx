'use client';

import Link from 'next/link';
import { Icon, Icons } from '@/components';
import { getMedicinesUrl } from '../utils';
import { MedicineInstructionsProps } from '../types';

export default function MedicineInstructions({ patientId }: MedicineInstructionsProps) {
  return (
    <div className="mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
              <Icon name={Icons.MEDICINE} size="sm" className="text-green-600 dark:text-green-400" />
            </div>
            Medicine Instructions
          </h2>
          <Link
            href={getMedicinesUrl(patientId)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            title="Edit prescription"
          >
            <Icon name={Icons.EDIT} size="xs" className="mr-2" />
            Edit Prescription
          </Link>
        </div>
        
        {/* Placeholder content */}
        <div className="text-center py-8">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Medicine instructions will be displayed here.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Click &quot;Edit Prescription&quot; to manage this patient&apos;s medicine schedule.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
