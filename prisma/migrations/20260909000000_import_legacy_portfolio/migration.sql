-- Import the former static projects once. Existing managed records take precedence.
INSERT INTO "PortfolioCase" ("id", "title", "slug", "summary", "imageUrl", "galleryUrls", "status", "publishedAt", "updatedAt")
SELECT legacy.id, legacy.title, legacy.slug, legacy.summary, legacy.image, legacy.gallery,
       'PUBLISHED'::"PublicationStatus", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
  ('legacy-waldonys', 'Waldonys — O forró nunca para', 'waldonys-o-forro-nunca-para', 'Uma experiência digital que reúne música, agenda e conteúdo em uma presença online marcante, rápida e responsiva.', '/assets/images/portfolio/waldonys.png', ARRAY['/assets/images/wal.png']::TEXT[]),
  ('legacy-papudim', 'Papudim', 'papudim', 'Comunicação pensada para traduzir o humor e a proximidade do artista em uma presença digital autêntica.', '/assets/images/portfolio/papudim.jpg', ARRAY[]::TEXT[]),
  ('legacy-aurineide', 'Aurineide Camurupim', 'aurineide-camurupim', 'Direção visual irreverente para valorizar a personagem e fortalecer sua conexão imediata com o público.', '/assets/images/portfolio/aurineide.png', ARRAY[]::TEXT[]),
  ('legacy-sbem-ceara', 'SBEM Regional Ceará', 'sbem-regional-ceara', 'Uma solução institucional clara e confiável para aproximar especialistas, divulgar conhecimento e apoiar a atuação regional.', '/assets/images/portfolio/sbem.png', ARRAY[]::TEXT[])
) AS legacy(id, title, slug, summary, image, gallery)
WHERE NOT EXISTS (
  SELECT 1 FROM "PortfolioCase" existing
  WHERE existing."slug" = legacy.slug
     OR lower(existing."title") = lower(legacy.title)
     OR existing."imageUrl" = legacy.image
)
ON CONFLICT DO NOTHING;
