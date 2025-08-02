'use client';

import Link from 'next/link';
import { Icon, Icons } from './icons';

interface BackButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function BackButton({ href, children, className = "" }: BackButtonProps) {
  const defaultClasses = "inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4";
  const combinedClasses = className ? `${defaultClasses} ${className}` : defaultClasses;

  return (
    <Link href={href} className={combinedClasses}>
      <Icon name={Icons.ARROW_LEFT} className="mr-2" />
      {children}
    </Link>
  );
}
