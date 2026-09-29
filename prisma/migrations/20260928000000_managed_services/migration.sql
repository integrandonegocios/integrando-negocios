-- Import the former public catalog once. Preserve existing titles, settings and inactive rows.
INSERT INTO "Service" ("id", "title", "slug", "description", "icon", "position", "updatedAt")
SELECT item.id, item.title, item.slug, item.description, item.icon, item.position, CURRENT_TIMESTAMP
FROM (VALUES
  ('initial-ai', 'Inteligência Artificial', 'inteligencia-artificial', 'Aplicações de IA para produtividade, automação, análise e novas soluções digitais.', 'ai', 0),
  ('initial-sites', 'Sites e Landing Pages', 'sites-e-landing-pages', 'Sites modernos e páginas estratégicas para fortalecer sua presença digital, divulgar serviços e gerar conversões.', 'site', 1),
  ('initial-marketing', 'Marketing e Redes Sociais', 'marketing-e-redes-sociais', 'Estratégia, conteúdo e presença digital para fortalecer marcas, aproximar clientes e gerar oportunidades.', 'marketing', 2),
  ('initial-identity', 'Identidade Visual', 'identidade-visual', 'Construção de uma identidade profissional e consistente para sua marca.', 'identity', 3),
  ('initial-systems', 'Sistemas Web', 'sistemas-web', 'Sistemas personalizados desenvolvidos para processos e necessidades específicas.', 'systems', 4)
) AS item(id, title, slug, description, icon, position)
WHERE NOT EXISTS (SELECT 1 FROM "Service" existing WHERE lower(existing."title") = lower(item.title) OR existing."slug" = item.slug)
ON CONFLICT DO NOTHING;
