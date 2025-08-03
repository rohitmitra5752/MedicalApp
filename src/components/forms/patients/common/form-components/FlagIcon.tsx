import Image from 'next/image';
import { FlagIconProps } from '../types';

export const FlagIcon = ({ countryCode, className = "inline-block mr-2" }: FlagIconProps) => {
  return (
    <Image 
      src={`https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`}
      alt={`${countryCode} flag`}
      width={16}
      height={12}
      className={className}
      style={{ minWidth: '16px' }}
      onError={(e) => {
        // Fallback to text if image fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        target.nextSibling!.textContent = countryCode;
      }}
    />
  );
};
