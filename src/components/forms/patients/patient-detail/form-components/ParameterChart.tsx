'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Icon, Icons } from '@/components';
import { formatDate } from '@/lib/utils';
import { ParameterChartProps, ParameterOption } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ParameterChart({ reports }: ParameterChartProps) {
  const [selectedParameter, setSelectedParameter] = useState<string>('');

  // Get unique parameters and their info
  const parameterOptions = useMemo(() => {
    const parameterMap = new Map<string, ParameterOption>();
    
    reports.forEach(report => {
      if (!parameterMap.has(report.parameter_name)) {
        // Check if this parameter has any abnormal values
        const parameterReports = reports.filter(r => r.parameter_name === report.parameter_name);
        const hasAbnormalValues = parameterReports.some(r => 
          r.value < r.parameter_minimum || r.value > r.parameter_maximum
        );
        
        parameterMap.set(report.parameter_name, {
          value: report.parameter_name,
          label: `${report.parameter_name} (${report.unit})`,
          unit: report.unit,
          minimum: report.parameter_minimum,
          maximum: report.parameter_maximum,
          isAbnormal: hasAbnormalValues
        });
      }
    });
    
    // Convert to array and sort: abnormal parameters first, then alphabetically
    return Array.from(parameterMap.values()).sort((a, b) => {
      if (a.isAbnormal && !b.isAbnormal) return -1;
      if (!a.isAbnormal && b.isAbnormal) return 1;
      return a.value.localeCompare(b.value);
    });
  }, [reports]);

  // Set default selected parameter (first abnormal parameter, or first parameter if none abnormal)
  useEffect(() => {
    if (parameterOptions.length > 0 && !selectedParameter) {
      const firstAbnormal = parameterOptions.find(p => p.isAbnormal);
      setSelectedParameter(firstAbnormal?.value || parameterOptions[0].value);
    }
  }, [parameterOptions, selectedParameter]);

  // Get chart data for selected parameter
  const chartData = useMemo(() => {
    if (!selectedParameter) return null;

    const parameterReports = reports
      .filter(report => report.parameter_name === selectedParameter)
      .sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime());

    if (parameterReports.length === 0) return null;

    const selectedParam = parameterOptions.find(p => p.value === selectedParameter);
    if (!selectedParam) return null;

    const labels = parameterReports.map(report => formatDate(report.report_date));
    const values = parameterReports.map(report => report.value);
    
    // Create reference lines for min/max values
    const minLine = Array(labels.length).fill(selectedParam.minimum);
    const maxLine = Array(labels.length).fill(selectedParam.maximum);

    return {
      labels,
      datasets: [
        {
          label: `${selectedParameter} (${selectedParam.unit})`,
          data: values,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: values.map(value => 
            value < selectedParam.minimum || value > selectedParam.maximum 
              ? 'rgb(239, 68, 68)' // Red for abnormal values
              : 'rgb(59, 130, 246)' // Blue for normal values
          ),
          pointBorderColor: values.map(value => 
            value < selectedParam.minimum || value > selectedParam.maximum 
              ? 'rgb(220, 38, 38)' // Darker red border for abnormal values
              : 'rgb(37, 99, 235)' // Darker blue border for normal values
          ),
          pointBorderWidth: 2,
        },
        {
          label: 'Minimum Normal',
          data: minLine,
          borderColor: 'rgba(34, 197, 94, 0.8)',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 0,
        },
        {
          label: 'Maximum Normal',
          data: maxLine,
          borderColor: 'rgba(34, 197, 94, 0.8)',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    };
  }, [selectedParameter, reports, parameterOptions]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: selectedParameter ? `${selectedParameter} Over Time` : 'Parameter Chart',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const selectedParam = parameterOptions.find(p => p.value === selectedParameter);
            if (!selectedParam) return context.formattedValue;
            
            const value = context.parsed.y;
            const isAbnormal = value < selectedParam.minimum || value > selectedParam.maximum;
            const status = isAbnormal ? ' (Abnormal)' : ' (Normal)';
            
            if (context.dataset.label?.includes('Normal')) {
              return `${context.dataset.label}: ${context.formattedValue}`;
            }
            
            return `${context.dataset.label}: ${context.formattedValue}${status}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: selectedParameter ? parameterOptions.find(p => p.value === selectedParameter)?.unit : 'Value',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      line: {
        borderWidth: 3,
      },
      point: {
        hoverRadius: 8,
      },
    },
  };

  if (parameterOptions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Parameter Trends
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Icon name={Icons.CHART} size="2xl" className="mx-auto" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No data available</h4>
          <p className="text-gray-500 dark:text-gray-400">
            Add some medical reports to see parameter trends.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Parameter Trends
        </h3>
        <div className="flex items-center space-x-2">
          <label htmlFor="parameter-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Parameter:
          </label>
          <select
            id="parameter-select"
            value={selectedParameter}
            onChange={(e) => setSelectedParameter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     dark:bg-gray-700 dark:text-white text-sm min-w-[200px]"
          >
            {parameterOptions.map((param) => (
              <option key={param.value} value={param.value}>
                {param.label} {param.isAbnormal ? '⚠️' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {chartData && (
        <>
          <div className="h-96 mb-4">
            <Line data={chartData} options={chartOptions} />
          </div>
          
          {/* Parameter Info */}
          {selectedParameter && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex flex-wrap items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Selected Parameter: {selectedParameter}
                  </span>
                  {(() => {
                    const param = parameterOptions.find(p => p.value === selectedParameter);
                    if (!param) return null;
                    
                    const dataPoints = reports.filter(r => r.parameter_name === selectedParameter).length;
                    const abnormalCount = reports.filter(r => 
                      r.parameter_name === selectedParameter && 
                      (r.value < param.minimum || r.value > param.maximum)
                    ).length;
                    
                    return (
                      <>
                        <span className="text-gray-600 dark:text-gray-400">
                          Normal Range: {param.minimum} - {param.maximum} {param.unit}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          Data Points: {dataPoints}
                        </span>
                        {abnormalCount > 0 && (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            Abnormal Values: {abnormalCount}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Normal Values</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Abnormal Values</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              <div className="w-6 h-0.5 bg-green-500 opacity-80" style={{
                backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 3px, currentColor 3px, currentColor 6px)',
                backgroundColor: 'transparent',
                color: 'rgb(34, 197, 94)'
              }}></div>
            </div>
            <span>Normal Range</span>
          </div>
        </div>
      </div>
    </div>
  );
}
