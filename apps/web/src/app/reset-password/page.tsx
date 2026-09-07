import { PasswordRecoveryForm } from '@/components/auth/password-recovery-form';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <PasswordRecoveryForm token={token} />;
}
