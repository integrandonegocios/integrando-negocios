import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido.").toLowerCase(),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres.").max(128),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0).optional(),
});

export const userSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(10).max(128),
  roleId: z.string().min(1),
});

const newPassword = z.string().min(12, "A nova senha deve ter pelo menos 12 caracteres.").max(128, "A senha deve ter no máximo 128 caracteres.");
const confirmation = z.string().max(128);
export const resetTokenSchema = z.string().regex(/^[a-f0-9]{64}$/, "Link inválido ou expirado. Solicite uma nova recuperação.");
export const forgotPasswordSchema = z.object({
  email: z.string().trim().max(254).email("Informe um e-mail válido.").toLowerCase(),
});
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual.").max(128),
  newPassword,
  confirmPassword: confirmation,
}).refine(data => data.newPassword === data.confirmPassword, { message: "As senhas não coincidem.", path: ["confirmPassword"] })
  .refine(data => data.currentPassword !== data.newPassword, { message: "A nova senha deve ser diferente da senha atual.", path: ["newPassword"] });
export const resetPasswordSchema = z.object({
  token: resetTokenSchema,
  newPassword,
  confirmPassword: confirmation,
}).refine(data => data.newPassword === data.confirmPassword, { message: "As senhas não coincidem.", path: ["confirmPassword"] });
