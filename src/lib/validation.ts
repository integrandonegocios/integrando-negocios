import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().max(254).email("Informe um e-mail válido.").toLowerCase(),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres.").max(128),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().max(254).email().toLowerCase(),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0).optional(),
});

export const userSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().max(254).email().toLowerCase(),
  password: z.string().min(12).max(128),
  roleId: z.string().trim().min(1).max(128),
});

export const recordId = z.string().trim().min(1).max(128);
export const leadStatus = z.enum(["NEW", "IN_PROGRESS", "WON", "LOST"]);
export const userStatusSchema = z.object({ id: recordId, status: z.enum(["ACTIVE", "INACTIVE", "INVITED"]) });
export const leadStatusSchema = z.object({ id: recordId, status: leadStatus });
export const serviceIcons = ["site", "page", "marketing", "social", "identity", "systems", "automation", "ai"] as const;
export const serviceSchema = z.object({
  id: z.union([recordId, z.literal("")]).optional(),
  title: z.string().trim().min(2).max(120).refine(value => /[a-z0-9]/i.test(value.normalize("NFD")), "Informe um título válido."),
  description: z.string().trim().min(10).max(2000),
  icon: z.enum(serviceIcons),
  position: z.coerce.number().int().min(0).max(10000),
});
export const serviceStatusSchema = z.object({ id: recordId, active: z.enum(["true", "false"]) });

export const settingSchema = z.discriminatedUnion("key", [
  z.object({ key: z.literal("company.phone"), value: z.string().trim().regex(/^\d{10,15}$/, "Use apenas dígitos, incluindo o código do país.") }),
  z.object({ key: z.literal("company.instagram"), value: z.string().trim().max(200).url().refine(value => {
    const url = new URL(value);
    return url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname) && !url.username && !url.password;
  }, "Informe uma URL HTTPS do Instagram.") }),
]);

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
