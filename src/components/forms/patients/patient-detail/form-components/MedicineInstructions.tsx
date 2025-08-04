'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Icon, Icons } from '@/components';
import { getMedicinesUrl } from '../utils';
import { MedicineInstructionsProps } from '../types';
import type { MedicineInstruction, PrescriptionInstructions } from '@/lib';

export default function MedicineInstructions({ patientId }: MedicineInstructionsProps) {
  const [instructions, setInstructions] = useState<PrescriptionInstructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/patients/${patientId}/medicine-instructions`);
      const data = await response.json();
    
      if (data.success) {
        setInstructions(data.data);
      } else {
        setError(data.error || 'Failed to fetch instructions');
      }
    } catch (err) {
      setError('Error fetching medicine instructions');
      console.error('Error fetching instructions:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchInstructions();
  }, [fetchInstructions]);

  const markAsCompleted = async (prescriptionMedicineId: number) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/medicine-instructions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prescriptionMedicineId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh instructions after marking as completed
        fetchInstructions();
      } else {
        setError(data.error || 'Failed to mark as completed');
      }
    } catch (err) {
      setError('Error marking medicine instruction as completed');
      console.error('Error:', err);
    }
  };

  const renderInstructionCard = (instruction: MedicineInstruction) => {
    const isWeeklyRefill = instruction.prescription_type === 'weekly_refill';
    
    return (
      <div key={instruction.prescription_medicine_id} 
           className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center">
              <Icon name={Icons.MEDICINE} size="xs" className="mr-2 text-blue-600 dark:text-blue-400" />
              {instruction.medicine_name}
              {instruction.medicine_strength && (
                <span className="ml-2 text-sm font-normal text-blue-700 dark:text-blue-300">
                  ({instruction.medicine_strength})
                </span>
              )}
            </h4>
            
            <div className="mt-2 space-y-1">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Total tablets needed:</strong> {instruction.total_tablets}
                {isWeeklyRefill && <span className="text-xs ml-1">(for the week)</span>}
              </div>
              
              {!isWeeklyRefill && (
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Timing:</strong> {instruction.timing.join(', ')}
                  {instruction.morning_count > 0 && ` (${instruction.morning_count} morning)`}
                  {instruction.afternoon_count > 0 && ` (${instruction.afternoon_count} afternoon)`}
                  {instruction.evening_count > 0 && ` (${instruction.evening_count} evening)`}
                </div>
              )}
              
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {isWeeklyRefill ? 'Weekly refill reminder' : 'Daily monitoring reminder'}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => markAsCompleted(instruction.prescription_medicine_id)}
            className="ml-4 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center"
            title="Mark as completed"
          >
            <Icon name={Icons.CHECK} size="xs" className="mr-1" />
            Done
          </button>
        </div>
      </div>
    );
  };

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
            title="Edit prescriptions"
          >
            <Icon name={Icons.EDIT} size="xs" className="mr-2" />
            Edit Prescriptions
          </Link>
        </div>
        
        {loading && (
          <div className="text-center py-8">
            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-6">
              <p className="text-gray-600 dark:text-gray-400">
                Loading medicine instructions...
              </p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
              <p className="text-red-600 dark:text-red-400 mb-2">
                Error loading instructions: {error}
              </p>
              <button
                onClick={fetchInstructions}
                className="text-red-700 dark:text-red-300 hover:underline text-sm"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        
        {!loading && !error && instructions && (
          <>
            {instructions.has_instructions ? (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Based on your prescription schedule, here are the medicines you need to take:
                </p>
                {instructions.instructions.map(renderInstructionCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <Icon name={Icons.CHECK} size="lg" className="mx-auto text-green-600 dark:text-green-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    No medicine instructions due at this time.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    All prescriptions are up to date. Check back later or click &quot;Edit Prescription&quot; to manage schedules.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
