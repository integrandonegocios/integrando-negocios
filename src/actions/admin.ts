"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/session";
import { hashPassword } from "@/lib/security/password";

import {
  deletePortfolioImage,
  uploadPortfolioImage,
} from "@/lib/storage/cloudinary";

import { userSchema, userStatusSchema, leadStatusSchema, serviceSchema, serviceStatusSchema, settingSchema } from "@/lib/validation";
import { canManageRole } from "@/lib/auth/permissions";

import type {
  PublicationStatus,
} from "@/generated/prisma/client";

const text = (data: FormData, key: string) =>
  String(data.get(key) ?? "").trim();

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* ============================================================
   USUÁRIOS
============================================================ */

// Serialize account administration, including the last-super-admin check.
// Read the actor again under the same lock so a concurrent disable cannot authorize a write.
async function accountActor(tx: import("@/generated/prisma/client").Prisma.TransactionClient, id: string, permission: string) {
  await tx.$queryRaw`SELECT "id" FROM "Role" WHERE "name" = 'SUPER_ADMIN' FOR UPDATE`;
  await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${id} FOR UPDATE`;
  const user = await tx.user.findUnique({ where: { id }, include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } });
  const permissions = new Set(user?.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.key)));
  if (!user || user.status !== "ACTIVE" || !permissions.has(permission)) throw new Error("Acesso negado.");
  return { id, permissions };
}

export async function createUser(formData: FormData) {
  const session = await requirePermission("users.create");
  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Dados de usuário inválidos. Use uma senha de 12 a 128 caracteres.");
  const passwordHash = await hashPassword(parsed.data.password);
  await db.$transaction(async tx => {
    const actor = await accountActor(tx, session.id, "users.create");
    const role = await tx.role.findUnique({ where: { id: parsed.data.roleId }, include: { permissions: { include: { permission: true } } } });
    if (!role || !canManageRole(actor, role)) throw new Error("Você não pode conceder esse perfil.");
    const user = await tx.user.create({ data: {
      name: parsed.data.name, email: parsed.data.email, passwordHash,
      roles: { create: { roleId: role.id } },
    } });
    await audit({ actorUserId: actor.id, action: "CREATE", entityType: "User", entityId: user.id }, tx);
  });
  revalidatePath("/admin/usuarios");
}

export async function setUserStatus(formData: FormData) {
  const session = await requirePermission("users.disable");
  const { id, status } = userStatusSchema.parse(Object.fromEntries(formData));
  if (id === session.id && status !== "ACTIVE") throw new Error("Você não pode desativar a própria conta.");
  await db.$transaction(async tx => {
    const actor = await accountActor(tx, session.id, "users.disable");
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${id} FOR UPDATE`;
    const target = await tx.user.findUnique({ where: { id }, include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } });
    if (!target || !target.roles.every(({ role }) => canManageRole(actor, role))) throw new Error("Você não pode gerenciar essa conta.");
    if (status !== "ACTIVE" && target.status === "ACTIVE" && target.roles.some(({ role }) => role.name === "SUPER_ADMIN")) {
      const count = await tx.user.count({ where: { status: "ACTIVE", roles: { some: { role: { name: "SUPER_ADMIN" } } } } });
      if (count <= 1) throw new Error("Mantenha ao menos um SUPER_ADMIN ativo.");
    }
    await tx.user.update({ where: { id }, data: { status } });
    if (status !== "ACTIVE") {
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.passwordResetToken.deleteMany({ where: { userId: id } });
    }
    await audit({ actorUserId: actor.id, action: "STATUS_UPDATE", entityType: "User", entityId: id, metadata: { status } }, tx);
  });
  revalidatePath("/admin/usuarios");
}

export async function setLeadStatus(formData: FormData) {
  const actor = await requirePermission("contacts.update");
  const { id, status } = leadStatusSchema.parse(Object.fromEntries(formData));
  await db.$transaction(async tx => {
    await tx.contactLead.update({ where: { id }, data: { status } });
    await audit({ actorUserId: actor.id, action: "STATUS_UPDATE", entityType: "ContactLead", entityId: id, metadata: { status } }, tx);
  });
  revalidatePath("/admin/contatos");
  revalidatePath(`/admin/contatos/${id}`);
}

export async function saveService(formData: FormData) {
  const actor = await requirePermission("services.manage");
  const { id, ...fields } = serviceSchema.parse(Object.fromEntries(formData));
  const data = { ...fields, slug: slugify(fields.title) };
  await db.$transaction(async tx => {
    const item = id ? await tx.service.update({ where: { id }, data }) : await tx.service.create({ data });
    await audit({ actorUserId: actor.id, action: id ? "UPDATE" : "CREATE", entityType: "Service", entityId: item.id }, tx);
  });
  revalidatePath("/admin/servicos");
  revalidatePath("/");
}

export async function toggleService(formData: FormData) {
  const actor = await requirePermission("services.manage");
  const { id, active } = serviceStatusSchema.parse(Object.fromEntries(formData));
  await db.$transaction(async tx => {
    await tx.service.update({ where: { id }, data: { active: active === "true" } });
    await audit({ actorUserId: actor.id, action: "STATUS_UPDATE", entityType: "Service", entityId: id, metadata: { active: active === "true" } }, tx);
  });
  revalidatePath("/admin/servicos");
  revalidatePath("/");
}

/* ============================================================
   PORTFÓLIO
============================================================ */

export type PortfolioCaseFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function savePortfolioCase(
  _previousState: PortfolioCaseFormState,
  formData: FormData,
): Promise<PortfolioCaseFormState> {
  const actor = await requirePermission("portfolio.manage");

  const id = text(formData, "id");
  const title = text(formData, "title");
  const status = text(formData, "status") as PublicationStatus;
  const summary = text(formData, "summary");
  const manualImageUrl = text(formData, "imageUrl");

  const selectedImages = formData
    .getAll("imageFiles")
    .filter(
      (item): item is File =>
        item instanceof File && item.size > 0,
    );

  const uploadedImages: Array<{
    url: string;
    publicId: string;
  }> = [];

  const existing = id
    ? await db.portfolioCase.findUnique({
        where: { id },
      })
    : null;

  if (id && !existing) {
    return {
      status: "error",
      message: "O projeto não foi encontrado.",
    };
  }

  if (
    !slugify(title) || title.length > 160 ||
    !summary || summary.length > 3000 || text(formData, "content").length > 30000 ||
    !["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)
  ) {
    return {
      status: "error",
      message: "Preencha os campos obrigatórios corretamente.",
    };
  }

  if (selectedImages.length > 3) {
    return {
      status: "error",
      message: "Selecione no máximo 3 imagens por projeto.",
    };
  }

  if (manualImageUrl && manualImageUrl !== existing?.imageUrl && selectedImages.length === 0) {
    try {
      const parsedUrl = new URL(manualImageUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error();
      }
    } catch {
      return {
        status: "error",
        message: "Informe uma URL de imagem HTTP ou HTTPS válida.",
      };
    }
  }

  let persisted = false;

  try {
    for (const selectedImage of selectedImages) {
      uploadedImages.push(
        await uploadPortfolioImage(selectedImage),
      );
    }

    const imageUrls = uploadedImages.map(
      (image) => image.url,
    );

    const manualImageChanged =
      Boolean(existing) &&
      manualImageUrl !== (existing?.imageUrl ?? "");

    const imageUrl =
      imageUrls[0] ||
      (manualImageChanged
        ? manualImageUrl || null
        : existing?.imageUrl ?? (manualImageUrl || null));

    const galleryUrls = imageUrls.length
      ? imageUrls.slice(1)
      : manualImageChanged
        ? []
        : existing?.galleryUrls ?? [];

    const data = {
      title,
      slug: slugify(title),
      summary,
      content: text(formData, "content") || null,
      imageUrl,
      galleryUrls,
      status,
      publishedAt:
        status === "PUBLISHED"
          ? existing?.publishedAt ?? new Date()
          : null,
    };

    await db.$transaction(async tx => {
      let entityId: string;
      if (existing) {
        const updated = await tx.portfolioCase.updateMany({ where: { id: existing.id, updatedAt: existing.updatedAt }, data });
        if (updated.count !== 1) throw new Error("CONCURRENT_PORTFOLIO_EDIT");
        entityId = existing.id;
      } else {
        entityId = (await tx.portfolioCase.create({ data })).id;
      }
      await audit({ actorUserId: actor.id, action: existing ? "UPDATE" : "CREATE", entityType: "PortfolioCase", entityId, metadata: { uploadedImageCount: uploadedImages.length } }, tx);
    });
    persisted = true;
    revalidatePath("/admin/portfolio");
    revalidatePath("/");
    revalidatePath("/projetos");
    // Existing URLs may be shared or manually supplied. Retain them until an
    // explicit storage inventory can prove ownership and absence of references.

    const operation = existing
      ? "atualizado"
      : "criado";

    return {
      status: "success",
      message: uploadedImages.length
        ? `${uploadedImages.length} ${
            uploadedImages.length === 1
              ? "imagem enviada"
              : "imagens enviadas"
          } e case ${operation} com sucesso.`
        : `Case ${operation} com sucesso.`,
    };
  } catch {
    await Promise.allSettled(
      (persisted ? [] : uploadedImages).map((image) =>
        deletePortfolioImage(image.publicId),
      ),
    );

    return {
      status: "error",
      message: "Não foi possível salvar o projeto. Atualize a página e tente novamente.",
    };
  }
}

/* ============================================================
   EXCLUIR PROJETO
============================================================ */

export async function deletePortfolioCase(
  formData: FormData,
) {
  const actor = await requirePermission(
    "portfolio.manage",
  );

  const id = text(formData, "id");

  if (!id) {
    throw new Error("ID do projeto não informado.");
  }

  const item = await db.portfolioCase.findUnique({
    where: {
      id,
    },
  });

  if (!item) {
    throw new Error("Projeto não encontrado.");
  }

  await db.$transaction(async tx => {
    await tx.portfolioCase.delete({ where: { id } });
    await audit({ actorUserId: actor.id, action: "DELETE", entityType: "PortfolioCase", entityId: id }, tx);
  });
  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  revalidatePath("/projetos");
  // Shared/manual images are intentionally retained in storage.

}

/* ============================================================
   NOTIFICAÇÕES
============================================================ */

export async function markNotificationRead(
  formData: FormData,
) {
  const user = await requirePermission(
    "dashboard.read",
  );

  await db.notification.updateMany({
    where: {
      id: text(formData, "id"),
      userId: user.id,
    },
    data: {
      readAt: new Date(),
    },
  });

  revalidatePath("/admin/notificacoes");
}

/* ============================================================
   CONFIGURAÇÕES
============================================================ */

export async function saveSetting(
  formData: FormData,
) {
  const actor = await requirePermission(
    "settings.manage",
  );

  const { key, value } = settingSchema.parse(Object.fromEntries(formData));
  await db.$transaction(async tx => {
    await tx.appSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
    await audit({ actorUserId: actor.id, action: "UPSERT", entityType: "AppSetting", entityId: key }, tx);
  });
  revalidatePath("/", "layout");
}
