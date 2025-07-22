'use client';

import { useParams } from 'next/navigation';
import ReportForm from '@/components/ReportForm';

export default function AddReportPage() {
  const params = useParams();
  const patientId = params.id as string;

  return (
    <ReportForm 
      patientId={patientId} 
      mode="add" 
    />
  );
}
