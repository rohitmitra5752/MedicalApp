import { Icon, Icons } from '@/components';
import type { ParameterInputCardProps } from '../types';
import { getParameterMinimum, getParameterMaximum, isValueOutOfRange } from '../utils';

export default function ParameterInputCard({
  parameter,
  patient,
  value,
  hasExistingValue,
  onChange
}: ParameterInputCardProps) {
  const handleChange = (newValue: string) => {
    onChange(parameter.id, newValue);
  };

  const renderRangeIndicator = () => {
    if (!value) return null;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;

    const isOutOfRange = isValueOutOfRange(value, parameter, patient);

    if (isOutOfRange) {
      return (
        <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 mt-1">
          <Icon name={Icons.WARNING_TRIANGLE} size="xs" className="mr-1" />
          Value outside normal range
        </div>
      );
    }

    return (
      <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
        <Icon name={Icons.SUCCESS_CIRCLE} size="xs" className="mr-1" />
        Within normal range
      </div>
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {parameter.parameter_name}
        {hasExistingValue && (
          <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
            existing
          </span>
        )}
      </label>
      <div className="relative">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-16"
          placeholder={`${getParameterMinimum(parameter, patient)}-${getParameterMaximum(parameter, patient)}`}
        />
        <span className="absolute right-3 top-2 text-sm text-gray-500 dark:text-gray-400">
          {parameter.unit}
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Normal range: {getParameterMinimum(parameter, patient)} - {getParameterMaximum(parameter, patient)} {parameter.unit}
      </p>
      
      {/* Visual indicator for out-of-range values */}
      {renderRangeIndicator()}
    </div>
  );
}
