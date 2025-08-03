'use client';

import Link from 'next/link';
import { Icon, Icons } from '@/components';
import type { PrescriptionCardProps } from '../types';
import { isPrescriptionActive, formatDate, getTypeLabel, getTypeColor } from '../utils';

export function PrescriptionCard({
  prescription,
  patientId,
  onEdit,
  onDelete
}: PrescriptionCardProps) {
  const isActive = isPrescriptionActive(prescription);

  const handleEdit = () => {
    onEdit(prescription);
  };

  const handleDelete = () => {
    console.log('Delete button clicked for prescription:', prescription.id);
    onDelete(prescription);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className={`p-3 rounded-full ${isActive ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <Icon 
              name={Icons.MEDICINE} 
              size="md" 
              className={isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'} 
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Prescription #{prescription.id}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(prescription.prescription_type)}`}>
                {getTypeLabel(prescription.prescription_type)}
              </span>
              {isActive ? (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full font-medium">
                  Active
                </span>
              ) : (
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full font-medium">
                  Inactive
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p><span className="font-medium">Created:</span> {formatDate(prescription.created_at)}</p>
              <p><span className="font-medium">Last Updated:</span> {formatDate(prescription.updated_at)}</p>
              {prescription.valid_till && (
                <p><span className="font-medium">Valid Till:</span> {formatDate(prescription.valid_till)}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          <Link
            href={`/patients/${patientId}/medicines/${prescription.id}`}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
            title="Edit medicines"
          >
            <Icon name={Icons.MEDICINE} size="xs" />
          </Link>
          <button
            onClick={handleEdit}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
            title="Edit prescription details"
          >
            <Icon name={Icons.EDIT} size="xs" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
            title="Delete prescription"
          >
            <Icon name={Icons.DELETE} size="xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
