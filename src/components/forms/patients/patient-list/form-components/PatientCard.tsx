'use client';

import Link from 'next/link';
import { Icon, Icons } from '@/components';
import { Patient } from '../types';

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export default function PatientCard({ patient, onEdit, onDelete }: PatientCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <Link
          href={`/patients/${patient.id}`}
          className="flex items-center space-x-4 flex-1 group"
        >
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
            <Icon name={Icons.USER} size="md" className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {patient.name}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>Medical ID: {patient.medical_id_number}</p>
              <p>Phone: {patient.phone_number}</p>
            </div>
          </div>
          <div className="text-gray-400 group-hover:text-blue-500">
            <Icon name={Icons.CHEVRON_RIGHT} size="sm" />
          </div>
        </Link>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(patient)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
            title="Edit patient"
          >
            <Icon name={Icons.EDIT} size="xs" />
          </button>
          <button
            onClick={() => onDelete(patient)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
            title="Delete patient"
          >
            <Icon name={Icons.DELETE} size="xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
