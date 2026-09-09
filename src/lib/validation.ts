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
