'use client';

import { useParams, useSearchParams } from 'next/navigation';
import ReportForm from '@/components/ReportForm';

export default function EditReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params.id as string;
  const editDate = searchParams.get('date');

  if (!editDate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No Date Specified</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Please specify a date to edit.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReportForm 
      mode="edit" 
      patientId={patientId} 
      editDate={editDate}
    />
  );
}
