'use client';

import { useParams } from 'next/navigation';
import { PatientPrescriptionContent } from '@/components/forms/patients';

export default function PrescriptionMedicinesPage() {
  const params = useParams();
  const patientId = params.id as string;
  const prescriptionId = params.prescriptionId as string;

  return (
    <PatientPrescriptionContent 
      patientId={patientId}
      prescriptionId={prescriptionId}
    />
  );
}
