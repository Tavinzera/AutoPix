# AutoPix

Sistema web para gerenciamento de cobranças e pagamentos, com compartilhamento de links de cobrança pelo WhatsApp.

> **Estado:** em planejamento de evolução para Full Stack. A estrutura e as funcionalidades atuais precisam ser auditadas no código local antes de qualquer migração.

## Tecnologias desejadas

- HTML, CSS e JavaScript puro
- Node.js
- Express
- PostgreSQL

## Identidade visual

Tema escuro, com preto predominante e vermelho para destaques e ações. Consulte `docs/CONTEXTO.md` para a paleta inicial e as diretrizes visuais.

## Funcionalidades previstas

- Cadastro de alunos/clientes
- Gerenciamento de chaves Pix
- Criação de cobranças com valores variáveis
- Situação e histórico de pagamentos
- Observações
- Data de pagamento automática e editável
- Relatórios
- Compartilhamento de link de cobrança pelo WhatsApp

A lista é uma referência de requisitos, não uma declaração de que tudo já está implementado.

## Documentação

- [`docs/CONTEXTO.md`](docs/CONTEXTO.md): visão geral, requisitos, decisões e estado conhecido.
- [`CLAUDE.md`](CLAUDE.md): instruções para agentes de programação compatíveis com esse arquivo.

## Como começar

1. Abra a pasta do projeto no Google Antigravity.
2. Leia `docs/CONTEXTO.md` e `CLAUDE.md`.
3. Faça uma análise do código existente antes de modificar arquivos.
4. Registre a arquitetura atual e as etapas de migração.
5. Configure as variáveis de ambiente somente depois de definir a estrutura real do backend e do banco.

Os comandos de instalação e execução serão documentados aqui após a definição do `package.json` e da estrutura efetiva do projeto. Não execute comandos presumidos.

## Segurança

- Não envie arquivos `.env` ao Git.
- Use `.env.example` apenas com nomes de variáveis e valores fictícios.
- Não coloque credenciais ou chaves privadas no frontend.
- Não considere um QR Code ou código Pix gerado como confirmação de pagamento.
- Use dados fictícios nos testes.

## Repositório

https://github.com/Tavinzera/AutoPix
