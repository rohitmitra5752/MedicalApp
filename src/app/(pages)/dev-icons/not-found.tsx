import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function DevIconsNotFound() {
  // This will be shown if the page is accessed but shouldn't be available
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Development Page Not Available
        </h1>
        <p className="text-gray-600 mb-6">
          This page is only available in development mode.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
