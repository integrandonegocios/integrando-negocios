"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/session";
import { hashPassword } from "@/lib/security/password";

import {
  deletePortfolioImage,
  deletePortfolioImageByUrl,
  uploadPortfolioImage,
} from "@/lib/storage/cloudinary";

import { userSchema } from "@/lib/validation";

import type {
  LeadStatus,
  PublicationStatus,
  UserStatus,
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

export async function createUser(formData: FormData) {
  const actor = await requirePermission("users.create");

  const parsed = userSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error("Dados de usuário inválidos.");
  }

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      roles: {
        create: {
          roleId: parsed.data.roleId,
        },
      },
    },
  });

  await audit({
    actorUserId: actor.id,
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
  });

  revalidatePath("/admin/usuarios");
}

export async function setUserStatus(formData: FormData) {
  const actor = await requirePermission("users.disable");

  const id = text(formData, "id");
  const status = text(formData, "status") as UserStatus;

  if (id === actor.id && status !== "ACTIVE") {
    throw new Error("Você não pode desativar a própria conta.");
  }

  await db.$transaction([
    db.user.update({
      where: { id },
      data: { status },
    }),

    ...(status !== "ACTIVE"
      ? [
          db.session.deleteMany({
            where: {
              userId: id,
            },
          }),
        ]
      : []),
  ]);

  await audit({
    actorUserId: actor.id,
    action: "STATUS_UPDATE",
    entityType: "User",
    entityId: id,
    metadata: {
      status,
    },
  });

  revalidatePath("/admin/usuarios");
}

/* ============================================================
   CONTATOS
============================================================ */

export async function setLeadStatus(formData: FormData) {
  const actor = await requirePermission("contacts.update");

  const id = text(formData, "id");
  const status = text(formData, "status") as LeadStatus;

  await db.contactLead.update({
    where: { id },
    data: { status },
  });

  await audit({
    actorUserId: actor.id,
    action: "STATUS_UPDATE",
    entityType: "ContactLead",
    entityId: id,
    metadata: {
      status,
    },
  });

  revalidatePath("/admin/contatos");
  revalidatePath(`/admin/contatos/${id}`);
}

/* ============================================================
   SERVIÇOS
============================================================ */

export async function saveService(formData: FormData) {
  const actor = await requirePermission("services.manage");

  const title = text(formData, "title");

  const item = await db.service.create({
    data: {
      title,
      slug: slugify(title),
      description: text(formData, "description"),
      icon: text(formData, "icon") || "✦",
      position: Number(text(formData, "position") || 0),
    },
  });

  await audit({
    actorUserId: actor.id,
    action: "CREATE",
    entityType: "Service",
    entityId: item.id,
  });

  revalidatePath("/admin/servicos");
  revalidatePath("/");
}

export async function toggleService(formData: FormData) {
  const actor = await requirePermission("services.manage");

  const id = text(formData, "id");

  const item = await db.service.update({
    where: { id },
    data: {
      active: text(formData, "active") === "true",
    },
  });

  await audit({
    actorUserId: actor.id,
    action: "STATUS_UPDATE",
    entityType: "Service",
    entityId: id,
    metadata: {
      active: item.active,
    },
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
    !title ||
    !summary ||
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

  if (manualImageUrl && selectedImages.length === 0) {
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

    const item = existing
      ? await db.portfolioCase.update({
          where: {
            id: existing.id,
          },
          data,
        })
      : await db.portfolioCase.create({
          data,
        });

    persisted = true;
    revalidatePath("/admin/portfolio");
    revalidatePath("/");
    revalidatePath("/projetos");

    await audit({
      actorUserId: actor.id,
      action: existing ? "UPDATE" : "CREATE",
      entityType: "PortfolioCase",
      entityId: item.id,
      metadata: {
        uploadedImageCount: uploadedImages.length,
      },
    });

    if (
      existing &&
      (imageUrls.length || manualImageChanged)
    ) {
      const retainedUrls = new Set([
        imageUrl,
        ...galleryUrls,
      ]);

      const replacedUrls = [
        existing.imageUrl,
        ...existing.galleryUrls,
      ].filter(
        (url): url is string =>
          Boolean(url) && !retainedUrls.has(url),
      );

      await Promise.all(
        replacedUrls.map(deletePortfolioImageByUrl),
      );
    }

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
  } catch (error) {
    await Promise.all(
      (persisted ? [] : uploadedImages).map((image) =>
        deletePortfolioImage(image.publicId),
      ),
    );

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível criar o case.",
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

  await db.portfolioCase.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  revalidatePath("/projetos");

  await audit({
    actorUserId: actor.id,
    action: "DELETE",
    entityType: "PortfolioCase",
    entityId: id,
  });

  const imageUrls = [
    item.imageUrl,
    ...item.galleryUrls,
  ].filter(
    (url): url is string => Boolean(url),
  );

  await Promise.all(
    imageUrls.map(deletePortfolioImageByUrl),
  );
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

  const key = text(formData, "key");
  const value = text(formData, "value");

  await db.appSetting.upsert({
    where: {
      key,
    },
    create: {
      key,
      value,
    },
    update: {
      value,
    },
  });

  await audit({
    actorUserId: actor.id,
    action: "UPSERT",
    entityType: "AppSetting",
    entityId: key,
  });

  revalidatePath("/admin/configuracoes");
}