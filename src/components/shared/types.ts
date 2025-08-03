import React from 'react';

export interface BackButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export interface ToggleSwitchProps {
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
