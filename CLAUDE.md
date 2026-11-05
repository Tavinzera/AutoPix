# CLAUDE.md — Instruções para agentes de desenvolvimento

## Objetivo
Você está trabalhando no AutoPix, um sistema de gerenciamento de cobranças e pagamentos. Consulte `docs/CONTEXTO.md` (ou `CONTEXTO.md`, caso ainda esteja na raiz) antes de tarefas que afetem o projeto.

## Stack obrigatória
- HTML, CSS e JavaScript puro no frontend.
- Node.js + Express no backend.
- PostgreSQL como banco de dados.

Não introduza frameworks ou serviços adicionais sem explicar a necessidade e obter autorização.

## Regras essenciais
1. Antes de editar, inspecione a estrutura e os arquivos relevantes.
2. Não presuma que a documentação descreve perfeitamente o código atual: confirme no repositório.
3. Não reescreva arquivos inteiros quando uma alteração localizada for suficiente.
4. Preserve funcionalidades existentes, salvo solicitação explícita.
5. Não faça mudanças amplas ou destrutivas sem apresentar um plano e receber autorização.
6. Não invente resultados de testes, execução, integração bancária ou confirmação de pagamento.
7. Mantenha frontend, backend e acesso ao banco separados.
8. Toda regra de negócio e validação de segurança deve ser aplicada no backend.
9. Use consultas parametrizadas para acessar o PostgreSQL.
10. Nunca exponha credenciais no frontend nem versione arquivos `.env`.
11. Não use dados reais de clientes em exemplos, testes ou logs.
12. Ao terminar, informe resumo, arquivos alterados, verificações executadas e pendências.

## Gestão de contexto e tokens
- Leia primeiro o contexto e as tarefas; abra somente os arquivos necessários à tarefa.
- Não leia o projeto inteiro repetidamente.
- Evite reproduzir grandes trechos de código ou documentação sem necessidade.
- Não registre conversas completas. Registre decisões duradouras e estado técnico.
- Após uma tarefa concluída, atualize `docs/TAREFAS.md` e os documentos afetados.
- Se não existir `docs/TAREFAS.md`, proponha sua criação.
- Ao iniciar uma nova tarefa, confira o estado atual do Git e a documentação pertinente.

## Identidade visual
A interface deve seguir o tema escuro preto/vermelho descrito em `docs/CONTEXTO.md`. Mantenha consistência entre páginas, componentes, estados e responsividade.

## Pagamentos
A geração de Pix, código copia e cola ou QR Code não é prova de recebimento. Só marque pagamento como confirmado automaticamente quando houver integração oficial, validada e documentada. Até lá, identifique atualizações manuais como manuais.

## Fluxo obrigatório para tarefas grandes
1. Diagnóstico do estado atual.
2. Plano de implementação com arquivos afetados.
3. Aguardar autorização quando houver alteração estrutural ou destrutiva.
4. Implementar em etapas pequenas.
5. Testar e relatar o que foi efetivamente verificado.
6. Atualizar documentação.

## Primeira tarefa neste projeto
Se o usuário ainda não autorizou implementação, faça somente a análise do projeto local e apresente:
- estrutura de pastas;
- funcionalidades identificadas;
- dependências e tecnologias atuais;
- funcionalidades que precisam ser preservadas;
- lacunas para a migração para Node.js + Express + PostgreSQL;
- proposta de arquitetura e etapas.
Não modifique o código nessa primeira análise.
