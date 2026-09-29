# Auditoria e retomada — Integrando Negócios

Data: 28/09/2026. Base: commit `7a5c559`; árvore de trabalho inicialmente limpa.

## Resultado e limites

O projeto já possui site institucional, portfólio com galeria, contato, autenticação, recuperação de senha e painel administrativo. Há falhas de autorização e divergências entre painel e site que devem ser corrigidas antes de ampliar funcionalidades.

Esta é uma auditoria estática do repositório com verificações locais. Não certifica produção nem substitui testes reais no navegador e banco. Nenhum seed, migration ou alteração de dados foi executado. Nenhum deploy foi realizado.

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Passou |
| `npm run typecheck` | Passou |
| `npm test` | 20 testes passaram; execução inicial bloqueada pelo IPC do tsx, nova execução concluída |
| `npm run build` | Prisma Client gerado; Turbopack bloqueado ao abrir porta durante processamento de CSS (`Operation not permitted`), inclusive na nova tentativa com escalonamento |
| Navegador | Runtime consultado, lista de navegadores vazia; inspeção visual indisponível |
| Dependências | `npm audit --json` concluído na nova tentativa: 4 entradas de severidade alta, 0 críticas, na cadeia do CLI Prisma; detalhes abaixo |
| Banco e serviços externos | Disponibilidade, migrations aplicadas, entrega de e-mail e upload real não verificados |

Os testes existentes usam dependências isoladas para ações de senha, sessão, rate limiting e envio de e-mail. Não comprovam transações concorrentes em PostgreSQL real nem cobertura ponta a ponta.

## Inventário

- Público: `/`, `/contato`, `/projetos` e quatro páginas `/preview/*`.
- Acesso: `/login`, `/esqueci-senha`, `/redefinir-senha`.
- Administração: indicadores, contatos, usuários, perfis, serviços, portfólio, relatórios, auditoria, notificações, configurações e segurança da conta.
- Stack declarada: Next.js 16.3.3, React 19.2.8, Prisma 7.10, PostgreSQL, Tailwind 4.
- Integrações no código: Cloudinary para imagens e Resend para recuperação de senha.
- Última entrega no histórico: recuperação e alteração de senha, incorporada pela PR #1.

## Achados prioritários

### P1 — Corrigir antes de novas funcionalidades

1. **ADMIN pode criar SUPER_ADMIN.** `src/actions/admin.ts`, `createUser`, exige apenas `users.create` e persiste o `roleId` enviado. `src/lib/auth/permissions.ts` concede essa permissão a ADMIN, mas exclui `roles.manage`. A tela `src/app/admin/usuarios/page.tsx` oferece todos os perfis. Um ADMIN pode criar outra conta com senha conhecida e permissões superiores. Validar no servidor a delegação de cada perfil e filtrar as opções da interface. Aceite: ADMIN não concede permissões que não possui; SUPER_ADMIN mantém o fluxo autorizado.

2. **Dashboard expõe contatos a perfis sem `contacts.read`.** `src/app/admin/page.tsx:8` exige somente `dashboard.read`, depois consulta e renderiza nome, empresa ou e-mail dos cinco contatos mais recentes. EDITOR e AUDITOR possuem acesso ao dashboard, mas não aos contatos. Condicionar consulta e renderização à permissão específica. Aceite: esses perfis não recebem dados pessoais dos leads no HTML nem no payload de navegação.

3. **Login sem limitação de tentativas na aplicação.** `src/actions/auth.ts:31` consulta usuário e verifica senha sem chamar `allowAuthAttempt`. O limitador existe em `src/lib/security/rate-limit.ts`, mas só atende ações de senha. Integrá-lo antes da verificação e testar bloqueio, expiração e falha do limitador. Proteção eventualmente configurada na borda não foi verificada. Há também diferença de processamento entre e-mail inexistente e existente; avaliar verificação com hash substituto para reduzir enumeração por tempo.

4. **Seed redefine credenciais sem revogar acessos anteriores.** `prisma/seed.ts:101` atualiza senha e status para ACTIVE em toda execução com as variáveis de administrador presentes, sem remover sessões e tokens de recuperação. O ramo de atualização também não garante o vínculo SUPER_ADMIN, embora o log anuncie provisionamento. Separar bootstrap de rotação explícita; tornar a operação transacional e revogar sessões/tokens se houver troca de senha. A substituição de permissões (`deleteMany` seguido de `createMany`, linhas 68–79) também precisa de transação para não deixar perfis vazios em falha intermediária.

5. **ADMIN pode desativar contas superiores.** `setUserStatus`, em `src/actions/admin.ts`, só impede desativar a própria conta. Não verifica os perfis do alvo nem preserva o último SUPER_ADMIN ativo. Definir e aplicar hierarquia de gestão; testar proteção contra bloqueio administrativo e concorrência.

### P2 — Confiabilidade e funcionamento

6. **Catálogo do painel não controla o catálogo público.** `src/components/home/sections.tsx:18` percorre uma lista fixa de cinco serviços e usa o banco apenas para substituir descrição e ícone quando o título coincide. Novos serviços não aparecem, a posição cadastrada não define a ordem e desativar um serviço faz retornar o texto estático em vez de removê-lo. Definir uma única fonte de dados e preservar o destaque visual de forma explícita. O painel aceita ícones livres, enquanto o site espera nomes de ícones predefinidos.

7. **Contato sem rate limiting e com gravação parcial.** `src/actions/public.ts:12` cria o lead antes das notificações, sem transação ou tratamento de falhas. Se a notificação falhar, o lead pode existir enquanto o visitante recebe erro e tenta novamente. Usar operação atômica ou notificação desacoplada com estado de sucesso coerente; adicionar proteção contra abuso. O honeypot bloqueia entradas preenchidas pela validação, mas o ramo de falso sucesso da linha 11 é inalcançável porque o schema exige comprimento zero.

8. **Validação administrativa incompleta.** `setUserStatus`, `setLeadStatus`, `saveService` e `saveSetting` usam casts ou strings sem validação completa. Em `src/app/admin/contatos/page.tsx:8`, `status` da URL chega ao Prisma via `as never`; valor arbitrário pode produzir erro da página. Validar enums, IDs, limites e números no servidor. A senha inicial exige 10 caracteres (`userSchema`), enquanto seed e recuperação exigem 12; uniformizar a política.

9. **Configurações não são consumidas pelo site.** `saveSetting` e a tela de configurações persistem parâmetros, mas a busca no código não encontrou consumo público de `AppSetting`. Telefone e redes sociais estão fixos no rodapé. Definir chaves suportadas, validação e consumidores antes de apresentar o formulário como configuração funcional do site.

10. **Operações e auditoria podem divergir.** Em várias ações administrativas, a gravação principal ocorre antes de `audit`. Falha no log pode devolver erro após persistir a alteração. No portfólio, limpeza de imagens também ocorre após persistência. Tornar escrita e auditoria atômicas quando necessário; tratar limpeza externa separadamente e evitar retornar erros internos do provedor/banco diretamente (`savePortfolioCase`).

11. **Disponibilidade pública depende do banco.** Home e projetos consultam portfólio sem tratamento local de indisponibilidade; a seção de serviços, por outro lado, silencia qualquer falha com `.catch(() => [])`. Definir comportamento consistente de erro, observabilidade e cache. Não foi medida latência nem comprovada indisponibilidade real.

12. **Exclusão de imagens precisa considerar compartilhamento.** URLs manuais podem apontar para um recurso do mesmo Cloudinary; `deletePortfolioImageByUrl` pode apagá-lo ao remover ou editar um case, sem verificar referências em outros cases ou restringir ao diretório do portfólio. Rastrear propriedade e referências; também verificar respostas HTTP de exclusão, hoje ignoradas.

### P2/P3 — Experiência, conteúdo e descoberta

13. **Links de serviços levam a previews não indexáveis.** A home aponta para `/preview/inteligencia-artificial` e `/preview/sites-sistemas-web`, ambas com `robots: noindex`. Publicar páginas definitivas com conteúdo e metadados próprios quando prontas; manter previews separados e planejar redirecionamentos.

14. **SEO básico incompleto.** Não foram encontrados sitemap, robots de aplicação, canonical, Open Graph ou dados estruturados. O login não declara `noindex`; o layout administrativo também não. Configurar o domínio canônico somente depois de confirmar a URL de produção. Ausência desses recursos não comprova problema de indexação já ocorrido.

15. **Acessibilidade requer ajustes e validação real.** A galeria em `src/components/home/portfolio-showcase.tsx` declara modal, mas não implementa contenção de foco nem restauração ao acionador. Diversos campos administrativos usam apenas placeholder, sem label associado. Revisar teclado, nomes acessíveis, contraste e leitura dos estados. O site já usa `lang="pt-BR"`, textos alternativos e redução de movimento parcial. Responsividade e contraste não foram medidos em navegador.

16. **Portfólio tem conteúdo não aproveitado.** `src/lib/portfolio.ts` atribui categoria fixa “Sites” e serviços fixos a todo projeto; os cards exibem apenas imagem e título. `content` é editável no painel, mas não há página pública de detalhe. Definir se o produto será galeria ou cases completos antes de ampliar o modelo.

17. **Listagens não têm paginação completa.** Contatos e notificações limitam a 100, auditoria a 200, sem navegação para registros anteriores. Usuários e portfólio podem carregar todos os registros. Implementar paginação, estados vazios e filtros validados conforme volume real.

18. **Privacidade não é explicada no formulário.** Não foi encontrada página de privacidade nem referência ao uso dos dados junto à coleta. Preparar texto conforme o processo real de tratamento e retenção; este achado é de produto/documentação, não uma conclusão jurídica.

## Operação e manutenção

### Dependências: resultado do registro npm

O audit retornou quatro pacotes afetados: `prisma`, `@prisma/config`, `deepmerge-ts` e `mysql2`. Isso inclui propagação de impacto entre dependências, não quatro falhas independentes exploradas no site. O CLI Prisma está em `devDependencies`; a aplicação usa PostgreSQL, portanto presença de `mysql2` no lockfile não comprova uso do protocolo MySQL em produção.

- `deepmerge-ts`: esgotamento de pilha ao mesclar grafos recursivos, aviso [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx).
- `mysql2`: downgrade de autenticação, aviso [GHSA-3f6p-5ww8-9rcr](https://github.com/advisories/GHSA-3f6p-5ww8-9rcr), e descompressão sem limite, aviso [GHSA-rgwj-5xj2-c3m3](https://github.com/advisories/GHSA-rgwj-5xj2-c3m3).
- A sugestão automática do npm foi Prisma 6.19.3, uma mudança de versão principal para trás. Não foi aplicado `audit fix --force`. A correção deve verificar compatibilidade do CLI, client e adapter e a exposição efetiva no pipeline antes de alterar dependências.

Prioridade: investigar e resolver no ciclo de segurança; manter a distinção entre alerta do pacote e exploração comprovada no produto.

### Configuração e operação

- `.env*` está ignorado e `git ls-files '.env*'` não retornou arquivos. Há cópias locais de ambientes; valores não foram expostos. O `.env.example` também está ignorado e não está versionado, apesar de ser requisito do README: incluir um exemplo sem segredos para tornar o onboarding reproduzível.
- Não foi encontrada pasta `.github` com pipeline. Adicionar lint, typecheck, testes e build em CI após validar o build em ambiente funcional.
- Os assets locais somam aproximadamente 26 MB; isso não representa o peso transferido de uma página. Imagens locais usam Next Image em parte do site; URLs externas do portfólio usam `img` sem transformação de tamanho. Medir transferência, LCP, CLS e INP antes de decidir otimizações.
- Sessões expiradas e tokens consumidos não têm rotina de retenção identificada. Definir manutenção e observabilidade junto com backups e ensaio de restauração.
- Os headers de proteção incluem anti-sniffing, anti-frame, referrer e permissions policy. CSP e configuração efetiva de HTTPS/HSTS na hospedagem não foram verificados.
- Ações de senha possuem proteção útil: tokens aleatórios armazenados por hash, uso único, expiração, resposta pública genérica, revogação de sessões e auditoria transacional. Sessões usam cookie HttpOnly e hash do token; login revalida o hash após concorrência com redefinição.

## Plano de retomada e critérios de aceite

1. **Segurança e bootstrap:** resolver achados 1–5, cobrir ações reais de criação e status de usuário e a visibilidade do dashboard; testar fluxo de login limitado. Seed deve ser previsível e não alterar credenciais existentes numa reexecução comum.
2. **Fluxos funcionais:** catálogo administrável, contato resiliente, validação administrativa e configurações conectadas. Criar/desativar/ordenar serviço deve refletir no público; enviar contato deve produzir um único resultado coerente.
3. **Site comercial:** substituir previews por páginas definitivas, decidir profundidade dos cases, completar metadados e conteúdo de privacidade. Revisar galeria, formulários e navegação móvel com teclado e leitor de tela.
4. **Homologação e publicação:** build concluído, auditoria de dependências, migrations verificadas em banco de homologação, e-mail e upload reais, fluxos por perfil, regressão visual em desktop e celular, métricas de desempenho e plano de rollback.

### Evidências ainda necessárias para fechar a auditoria completa

- URL e versão efetiva do site publicado, headers, redirecionamentos, links e indexação.
- Navegador conectado para inspeção visual e testes ponta a ponta em desktop/mobile.
- Ambiente de homologação com contas por perfil e dados de teste para comprovar autorização, upload, contato, e-mail e concorrência de banco.
- Build em ambiente que permita os processos/portas locais exigidos pelo Turbopack.
- Estado das migrations, backups, retenção, monitoramento e regras da borda na infraestrutura real.

Nenhum dos achados acima foi marcado como corrigido nesta auditoria. A ordem proposta permite retomar o desenvolvimento com escopo verificável.
