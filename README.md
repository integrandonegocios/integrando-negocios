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

## E-mails transacionais em produção

O envio usa o Resend. Configure `APP_URL` com a URL HTTPS pública do site, `RESEND_API_KEY` com uma chave válida e `EMAIL_FROM` com um remetente de domínio verificado no Resend. Na Vercel, adicione as três variáveis em **Project Settings → Environment Variables** para **Production** e faça um novo deploy para aplicá-las.

O formulário público cria o contato e a notificação interna mesmo sem e-mail configurado. Para receber avisos por e-mail, mantenha ao menos um usuário ativo com a permissão `contacts.read`; cada usuário autorizado recebe o aviso no endereço cadastrado na área administrativa. As mensagens são enviadas individualmente pelo Resend.

Para também receber alertas no WhatsApp, configure as variáveis `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_API_VERSION`, `CONTACT_NOTIFICATION_WHATSAPP_TO` e `WHATSAPP_TEMPLATE_NAME` na Vercel Production. `WHATSAPP_TEMPLATE_LANGUAGE` é opcional e usa `pt_BR` por padrão. A integração usa a WhatsApp Cloud API e requer uma conta WhatsApp Business Platform configurada, um número de envio, token de acesso e um modelo aprovado. O modelo deve ter cinco variáveis no corpo, nesta ordem: nome, e-mail, telefone, empresa e mensagem. Exemplo de texto para o modelo: `Novo contato pelo site. Nome: {{1}}. E-mail: {{2}}. Telefone: {{3}}. Empresa: {{4}}. Mensagem: {{5}}.` Informe `CONTACT_NOTIFICATION_WHATSAPP_TO` com o número de destino em formato internacional, somente dígitos, incluindo o código do país. Use em `WHATSAPP_API_VERSION` uma versão Graph API ativa na sua aplicação Meta. Depois de configurar as variáveis, faça novo deploy.

Sem as variáveis de e-mail ou com `APP_URL` inválida, o link de recuperação não é enviado e os avisos por e-mail são ignorados. As notificações WhatsApp são opcionais e só são enviadas quando as variáveis correspondentes estão configuradas. Falhas aparecem nos logs das funções da Vercel como `PASSWORD_RESET_EMAIL_CONFIGURATION_FAILED`, `PASSWORD_RESET_EMAIL_FAILED`, `CONTACT_NOTIFICATION_EMAIL_CONFIGURATION_FAILED`, `CONTACT_NOTIFICATION_EMAIL_FAILED`, `CONTACT_NOTIFICATION_WHATSAPP_CONFIGURATION_FAILED` ou `CONTACT_NOTIFICATION_WHATSAPP_FAILED`. Consulte também os logs de e-mail no painel do Resend e os logs da WhatsApp Cloud API. A confirmação normal do formulário continua sem revelar detalhes técnicos nem impedir que o contato seja salvo.

## Scripts

- `npm run dev`, `npm run build`, `npm run start`
- `npm run lint`, `npm run typecheck`
- `npm run db:generate`, `npm run db:migrate`, `npm run db:deploy`, `npm run db:seed`

## Segurança

As sessões usam tokens aleatórios em cookie `HttpOnly`; somente o hash SHA-256 é persistido. Senhas são derivadas com `scrypt`. Páginas e ações administrativas revalidam usuário e permissões no servidor.

Nunca versione `.env` ou credenciais. Em produção, use HTTPS, credenciais exclusivas, backups, rate limiting na borda e rotação periódica de segredos.
