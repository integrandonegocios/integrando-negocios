import { PasswordForm } from "@/components/forms/password-form";
import { PasswordPage } from "@/components/forms/password-page";
export const metadata = { title: "Esqueci minha senha", robots: { index: false, follow: false } };
export default function ForgotPasswordPage() {
  return <PasswordPage title="Esqueci minha senha" description="Informe seu e-mail para receber as instruções de recuperação."><PasswordForm mode="forgot" /></PasswordPage>;
}
