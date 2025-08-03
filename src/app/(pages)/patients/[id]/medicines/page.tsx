'use client';

import { useParams } from 'next/navigation';
import { PatientMedicinePageContent } from '@/components/forms/patients';

export default function PatientMedicinesPage() {
  const params = useParams();
  const patientId = params.id as string;

  return <PatientMedicinePageContent patientId={patientId} />;
}
