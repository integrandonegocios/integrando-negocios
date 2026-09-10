# Alteração e recuperação de senha

Páginas: `/admin/configuracoes/seguranca`, `/esqueci-senha`, `/redefinir-senha`.
Actions em `src/actions/password.ts`: `changePassword`, `requestPasswordReset`, `resetPassword`.
O login continua usando User.passwordHash/scrypt. A criação de sessão confere novamente o hash sob bloqueio do usuário para impedir um login com senha antiga concorrente à redefinição. ADMIN_PASSWORD permanece exclusivo do provisionamento.

## Banco e publicação

Migration: `prisma/migrations/20260910000000_password_recovery/migration.sql`.
Adiciona apenas PasswordResetToken e AuthRateLimit com índices e relacionamento ao User.
A migration foi gerada por comparação de schemas, sem conexão ou alteração no banco existente.
Antes de publicar a aplicação, aplique as migrations no banco do ambiente escolhido com `npm run db:deploy` (DATABASE_URL precisa estar disponível ao Prisma CLI). Não use db push/reset.
Depois execute `npm run build` e publique na Vercel.

Configure em Vercel → Project → Settings → Environment Variables, no ambiente Production:

- APP_URL: origem HTTPS pública definitiva do site, sem credenciais, caminho ou parâmetros.
- RESEND_API_KEY: chave de envio do Resend, exclusivamente no servidor.
- EMAIL_FROM: remetente de domínio verificado no Resend.
- DATABASE_URL: manter a configuração existente.

Faça novo deploy após configurar. Configure separadamente Preview, com banco e origem próprios.
Referência de envio: https://resend.com/docs/api-reference/emails/send-email
Desative click tracking do provedor para esses e-mails, para preservar o fragmento do link.
Não configure captura de corpos de requisições, campos de formulário ou conteúdo desses e-mails em ferramentas de observabilidade.

## Teste local

Use um banco de desenvolvimento separado, com um usuário ACTIVE conhecido. Exporte DATABASE_URL no terminal sem imprimir seu conteúdo, aplique `npm run db:deploy` e configure as variáveis de e-mail em `.env.local`. APP_URL local: `http://localhost:3000` ao usar `npm run dev`.
Use um destinatário autorizado pelo Resend; o fluxo local envia e-mail real, sem imprimir links/tokens no console. Não é usado mock de entrega em produção.

1. Entre e abra Segurança no cabeçalho do painel. Teste senha atual incorreta, senha com 11 caracteres, confirmação diferente e senha repetida. Nenhuma deve alterar a conta.
2. Abra outra sessão em navegador separado. Altere a senha corretamente: confira a mensagem, manutenção da sessão atual e encerramento da outra sessão. Saia e confirme que somente a nova senha autentica.
3. Solicite recuperação com e-mail ativo, inexistente e inativo. A resposta deve ser idêntica. Somente a conta ativa recebe o e-mail.
4. Abra o link recebido: o fragmento é removido da barra de endereço e enviado apenas no corpo da Server Action. Se atualizar a página, reabra o link do e-mail.
5. Redefina a senha e confira redirecionamento e mensagem no login. Confira login com a nova senha e encerramento de todas as sessões antigas.
6. Reabra o link usado, tente dois envios simultâneos, solicite novo link antes de usar o antigo e teste um link após 30 minutos. Apenas um consumo válido deve alterar a senha. Links vencidos/usados mostram erro ao enviar; tokens ausentes/malformados mostram erro imediatamente.
7. Confira CHANGE_PASSWORD e RESET_PASSWORD na auditoria, sem senha/token. No banco, somente o hash do token é persistido.
8. Mais de 5 solicitações por e-mail ou 20 por IP em 15 minutos devem impedir novos envios sem mudar a resposta genérica. Alterações têm limites equivalentes por usuário; redefinições têm limite por IP.

O IP vem do cabeçalho sobrescrito pela Vercel. Fora da Vercel usa-se um bucket local compartilhado; não confie em cabeçalhos fornecidos pelo cliente ao hospedar em outro proxy.
Contadores vencidos são removidos nas próximas tentativas. Tokens anteriores são removidos a cada nova emissão; a redefinição marca os tokens pendentes como usados.
Falhas de entrega registram apenas PASSWORD_RESET_EMAIL_FAILED; falhas internas da solicitação registram apenas PASSWORD_RESET_REQUEST_FAILED. Verifique também o painel do provedor, sem copiar conteúdo sensível para logs.

## Verificações automatizadas

`npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

Neste ambiente, Turbopack não conseguiu abrir uma porta local para processar CSS, mesmo após tentativa com permissão ampliada. O build de produção foi validado com `npm run build -- --webpack`, sem alterar o script padrão do projeto.
A suíte possui 20 testes. Ela executa as Actions reais com dependências isoladas e usa o scrypt real: autenticação, senha incorreta/repetida/curta, confirmação, conta inexistente/inativa, rate limit, emissão/substituição/consumo de tokens, revogação de sessões, auditoria e rollback. Também testa o contrato de envio com fetch interceptado, sem envio real.
O banco em memória serializa transações para testar as decisões das Actions; isso não valida locks, SQL, rollback ou concorrência do PostgreSQL real. Esses itens e a entrega real ainda exigem os testes de integração descritos acima.

## Resultado da revisão de preparação para produção

- Prisma validate/generate, TypeScript, lint e os 20 testes passaram.
- Build de produção validado com `npm run build -- --webpack`; Turbopack bloqueado pela abertura de porta local neste ambiente.
- `prisma migrate status` consultou o banco selecionado pelo Prisma CLI: a migration `20260910000000_password_recovery` está pendente. Essa consulta não confirma que a conexão é o destino de produção pretendido.
- Nenhuma migration foi aplicada e nenhum deploy foi realizado nesta revisão.
- `.env`: APP_URL, RESEND_API_KEY, EMAIL_FROM e DATABASE_URL presentes. Presença não comprova domínio correto, credencial válida ou remetente verificado.
- `.env.production.local`: DATABASE_URL presente; APP_URL, RESEND_API_KEY e EMAIL_FROM ausentes. O Next pode herdar valores do `.env` local, mas isso não configura as variáveis do projeto na Vercel.
- `.env`, `.env.production.local` e `.env.vercel-check` estão ignorados pelo Git e não versionados.
- Corrigida a aceitação de hashes scrypt malformados: o verificador exige o formato completo que hashPassword já produz. Não há alteração de algoritmo nem regravação de hashes existentes.

Após configurar as três variáveis de e-mail/origem e confirmar o banco esperado, execute `npm run db:deploy`. Atenção: o Prisma CLI carrega `.env` pela configuração existente; ele não seleciona automaticamente `.env.production.local`. Para outro destino, disponibilize DATABASE_URL no ambiente de execução por seu gerenciador de segredos, sem imprimir ou colocar o valor no histórico do terminal.
Depois publique pelo fluxo habitual da Vercel e teste `/admin/configuracoes/seguranca`, `/esqueci-senha` e o link recebido para `/redefinir-senha`.
