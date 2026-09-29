import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { settingSchema } from "@/lib/validation";

export const getPublicSettings = cache(async () => {
  const settings = { phone: "5585988952760", instagram: "https://instagram.com/integrandonegocios.oficial" };
  try {
    const rows = await db.appSetting.findMany({ where: { key: { in: ["company.phone", "company.instagram"] } }, select: { key: true, value: true } });
    for (const row of rows) {
      const parsed = settingSchema.safeParse(row);
      if (!parsed.success) continue;
      if (parsed.data.key === "company.phone") settings.phone = parsed.data.value;
      else settings.instagram = parsed.data.value;
    }
  } catch { console.error("PUBLIC_SETTINGS_UNAVAILABLE"); }
  return settings;
});
