import React from 'react';

interface ToggleSwitchProps {
  /** Current value of the toggle */
  value: boolean;
  /** Function called when toggle state changes */
  onChange: (value: boolean) => void;
  /** Label for the false state (left side) */
  falseLabel?: string;
  /** Label for the true state (right side) */
  trueLabel?: string;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Custom colors for the toggle */
  colors?: {
    /** Background color when false (unchecked) */
    falseBg?: string;
    /** Background color when true (checked) */
    trueBg?: string;
    /** Text color for false label when active */
    falseActiveText?: string;
    /** Text color for true label when active */
    trueActiveText?: string;
    /** Text color for inactive labels */
    inactiveText?: string;
  };
  /** Custom class names for the container */
  className?: string;
  /** Whether to show labels */
  showLabels?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onChange,
  falseLabel = 'No',
  trueLabel = 'Yes',
  disabled = false,
  colors = {
    falseBg: 'bg-gray-200 dark:bg-gray-700',
    trueBg: 'bg-green-600',
    falseActiveText: 'text-gray-700 dark:text-gray-300',
    trueActiveText: 'text-gray-700 dark:text-gray-300',
    inactiveText: 'text-gray-500 dark:text-gray-400'
  },
  className = '',
  showLabels = true
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!value);
    }
  };

  // Use default colors if not provided
  const actualColors = {
    falseBg: colors.falseBg || 'bg-gray-200 dark:bg-gray-700',
    trueBg: colors.trueBg || 'bg-green-600',
    falseActiveText: colors.falseActiveText || 'text-gray-700 dark:text-gray-300',
    trueActiveText: colors.trueActiveText || 'text-gray-700 dark:text-gray-300',
    inactiveText: colors.inactiveText || 'text-gray-500 dark:text-gray-400'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabels && (
        <span className={`text-sm ${!value ? actualColors.falseActiveText : actualColors.inactiveText}`}>
          {falseLabel}
        </span>
      )}
      
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full 
          transition-colors duration-200 focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:ring-offset-2 
          disabled:opacity-50 disabled:cursor-not-allowed
          ${value ? actualColors.trueBg : actualColors.falseBg}
        `}
        role="switch"
        aria-checked={value}
        aria-label={`Toggle ${falseLabel}/${trueLabel}`}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white 
            transition-transform duration-200 shadow-sm
            ${value ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      
      {showLabels && (
        <span className={`text-sm ${value ? actualColors.trueActiveText : actualColors.inactiveText}`}>
          {trueLabel}
        </span>
      )}
    </div>
  );
};
