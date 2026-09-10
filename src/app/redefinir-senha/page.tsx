import { PasswordForm } from "@/components/forms/password-form";
import { PasswordPage } from "@/components/forms/password-page";
export const metadata = { title: "Redefinir senha", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default function ResetPasswordPage() {
  return <PasswordPage title="Redefinir senha" description="Escolha uma nova senha para sua conta. O link é válido por 30 minutos."><PasswordForm mode="reset" /></PasswordPage>;
}
