# Integrando Negócios

Site institucional e área administrativa em Next.js 16, React 19, Tailwind CSS 4, PostgreSQL e Prisma ORM 7.

## Requisitos

- Node.js 20.19 ou superior
- PostgreSQL e npm

## Configuração local

1. Copie `.env.example` para `.env` e configure `DATABASE_URL`.
2. Defina `ADMIN_NAME`, `ADMIN_EMAIL` e uma `ADMIN_PASSWORD` com pelo menos 12 caracteres.
3. Execute `npm install`, `npm run db:generate`, `npm run db:deploy` e `npm run db:seed`.
4. Inicie com `npm run dev`.

O site fica em `http://localhost:3000`; a área interna, em `/login` e `/admin`.

## Recuperação de senha em produção

O envio do link usa o Resend. Configure `APP_URL` com a URL HTTPS pública do site, `RESEND_API_KEY` com uma chave válida e `EMAIL_FROM` com um remetente/domínio verificado no Resend. Na Vercel, adicione as três variáveis em **Project Settings → Environment Variables** para **Production** e faça um novo deploy para aplicá-las.

Sem essas variáveis ou com `APP_URL` inválida, o formulário informa que a recuperação está temporariamente indisponível. Falhas de entrega do Resend ficam registradas nos logs da função da Vercel como `PASSWORD_RESET_EMAIL_FAILED`; o código HTTP ajuda a identificar a causa. Consulte também os logs de e-mail no painel do Resend. A confirmação normal do formulário é intencionalmente igual para e-mails cadastrados e não cadastrados.

## Scripts

- `npm run dev`, `npm run build`, `npm run start`
- `npm run lint`, `npm run typecheck`
- `npm run db:generate`, `npm run db:migrate`, `npm run db:deploy`, `npm run db:seed`

## Segurança

As sessões usam tokens aleatórios em cookie `HttpOnly`; somente o hash SHA-256 é persistido. Senhas são derivadas com `scrypt`. Páginas e ações administrativas revalidam usuário e permissões no servidor.

Nunca versione `.env` ou credenciais. Em produção, use HTTPS, credenciais exclusivas, backups, rate limiting na borda e rotação periódica de segredos.
