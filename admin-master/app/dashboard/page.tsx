import { redirect } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function DashboardAlias() {
  redirect(PATHS.ADMIN);
}
