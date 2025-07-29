'use client';

import Link from 'next/link';

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
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      {children}
    </Link>
  );
}
