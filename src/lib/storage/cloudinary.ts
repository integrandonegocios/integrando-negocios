import { createHash } from "node:crypto";

export const MAX_PORTFOLIO_IMAGE_BYTES = 5 * 1024 * 1024;
export const PORTFOLIO_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
};

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER || "integrando-negocios/portfolio";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("O armazenamento de imagens não está configurado. Defina as variáveis CLOUDINARY no ambiente.");
  }

  return { cloudName, apiKey, apiSecret, folder };
}

function signature(parameters: Record<string, string>, secret: string) {
  const value = Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${key}=${item}`)
    .join("&");
  return createHash("sha1").update(`${value}${secret}`).digest("hex");
}

async function hasValidSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";

  return (file.type === "image/jpeg" && jpeg) || (file.type === "image/png" && png) || (file.type === "image/webp" && webp);
}

export async function validatePortfolioImage(file: File) {
  if (!allowedMimeTypes.has(file.type)) throw new Error("Formato inválido. Envie uma imagem JPG, PNG ou WebP.");
  if (file.size > MAX_PORTFOLIO_IMAGE_BYTES) throw new Error("A imagem deve ter no máximo 5 MB.");
  if (!(await hasValidSignature(file))) throw new Error("O conteúdo do arquivo não corresponde a uma imagem válida.");
}

export async function uploadPortfolioImage(file: File) {
  await validatePortfolioImage(file);
  const { cloudName, apiKey, apiSecret, folder } = config();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const parameters = { folder, timestamp };
  const body = new FormData();
  body.set("file", file);
  body.set("api_key", apiKey);
  body.set("folder", folder);
  body.set("timestamp", timestamp);
  body.set("signature", signature(parameters, apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(30_000),
  });
  const result = await response.json() as CloudinaryUploadResponse;

  if (!response.ok || !result.secure_url || !result.public_id) {
    throw new Error(result.error?.message || "Não foi possível enviar a imagem. Tente novamente.");
  }

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deletePortfolioImage(publicId: string) {
  const { cloudName, apiKey, apiSecret } = config();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const parameters = { public_id: publicId, timestamp };
  const body = new URLSearchParams({
    api_key: apiKey,
    public_id: publicId,
    timestamp,
    signature: signature(parameters, apiSecret),
  });

  await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/destroy`, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(15_000),
  }).catch(() => undefined);
}

export async function deletePortfolioImageByUrl(url: string) {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return;
  }

  if (parsedUrl.hostname !== "res.cloudinary.com") return;
  const { cloudName } = config();
  const segments = parsedUrl.pathname.split("/").filter(Boolean);
  if (segments[0] !== cloudName || segments[1] !== "image" || segments[2] !== "upload") return;

  const assetSegments = segments.slice(3);
  if (/^v\d+$/.test(assetSegments[0] ?? "")) assetSegments.shift();
  if (!assetSegments.length) return;
  const publicId = decodeURIComponent(assetSegments.join("/").replace(/\.[^.]+$/, ""));
  if (publicId) await deletePortfolioImage(publicId);
}
