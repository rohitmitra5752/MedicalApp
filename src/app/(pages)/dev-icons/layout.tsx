import { redirect } from 'next/navigation';

export default function DevIconsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect to home page if not in development environment
  if (process.env.NODE_ENV === 'production') {
    redirect('/');
  }

  return <>{children}</>;
}
