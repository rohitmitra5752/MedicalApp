import React from 'react';
import { Icons, iconPaths, type IconName } from './icons';

interface IconProps {
  name: IconName;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  strokeWidth?: number;
}

const getSizeClass = (size: IconProps['size']): string => {
  if (typeof size === 'number') {
    return `w-${size} h-${size}`;
  }
  
  switch (size) {
    case 'xs': return 'w-3 h-3';
    case 'sm': return 'w-4 h-4';
    case 'md': return 'w-5 h-5';
    case 'lg': return 'w-6 h-6';
    case 'xl': return 'w-8 h-8';
    case '2xl': return 'w-16 h-16';
    default: return 'w-5 h-5';
  }
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className = '', 
  size = 'md',
  strokeWidth = 2
}) => {
  const iconData = iconPaths[name];
  
  if (!iconData) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const sizeClass = getSizeClass(size);
  const viewBox = iconData.viewBox || '0 0 24 24';
  const paths = Array.isArray(iconData.path) ? iconData.path : [iconData.path];

  return (
    <svg
      data-name={`${name}`}
      className={`${sizeClass} ${className}`}
      fill={iconData.fill ? 'currentColor' : 'none'}
      stroke={iconData.fill ? 'none' : 'currentColor'}
      viewBox={viewBox}
      strokeWidth={iconData.fill ? undefined : strokeWidth}
      strokeLinecap={iconData.strokeLinecap}
      strokeLinejoin={iconData.strokeLinejoin}
    >
      {paths.map((path, index) => (
        <path key={index} d={path} />
      ))}
    </svg>
  );
};

// Export Icons for easy access
export { Icons };
export type { IconName };
export default Icon;
