import type { Metadata } from 'next';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Financial Dashboard',
  description: 'Financial management dashboard',
};

export default function FinancialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
