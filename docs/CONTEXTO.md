# CONTEXTO DO PROJETO — AUTOPIX

## 1. Visão geral
AutoPix é um sistema web para administrar cobranças de alunos/clientes, organizar pagamentos e facilitar o envio de links de cobrança pelo WhatsApp.

Este documento registra os requisitos e decisões conhecidos até agora. Ele não substitui uma análise do código existente. Antes de alterar funcionalidades, o agente deve inspecionar o projeto real e comparar a implementação atual com este contexto.

## 2. Objetivo
Transformar o AutoPix existente em uma aplicação Full Stack organizada, segura e preparada para evolução, mantendo as funcionalidades úteis já implementadas.

## 3. Tecnologias obrigatórias
- Frontend: HTML, CSS e JavaScript puro (sem framework frontend, salvo autorização posterior).
- Backend: Node.js + Express.
- Banco de dados: PostgreSQL.
- Comunicação frontend/backend: API HTTP com JSON.
- Controle de versão: Git.

## 4. Identidade visual
- Tema escuro.
- Preto como cor predominante.
- Vermelho como cor de destaque para ações e elementos importantes.
- Interface limpa, moderna, profissional e responsiva.
- Paleta inicial sugerida:
  - Fundo principal: #0A0A0A
  - Superfícies/cards: #171717
  - Bordas: #303030
  - Vermelho principal: #B91C1C
  - Vermelho de ação/hover: #DC2626
  - Texto principal: #F5F5F5
  - Texto secundário: #A3A3A3
- Garantir contraste e estados visuais claros para sucesso, alerta, erro e informação. Não usar vermelho como única indicação de erro.

## 5. Funcionalidades desejadas
Preservar, validar e planejar a implementação das seguintes funcionalidades:
- Cadastro e gerenciamento de alunos/clientes.
- Cadastro e gerenciamento de chaves Pix.
- Criação de cobranças com valores variáveis por cliente.
- Registro de observações.
- Controle da situação de pagamento.
- Data de pagamento preenchida automaticamente com a data atual, mas editável pelo usuário.
- Consulta e histórico de cobranças/pagamentos.
- Relatórios de cobranças e pagamentos.
- Geração de dados Pix/QR Code, conforme o funcionamento já existente e as regras técnicas aplicáveis.
- Compartilhamento de link de cobrança pelo WhatsApp.

Não presumir que todas essas funcionalidades já existem no código atual. Fazer inventário antes de implementar.

## 6. Pagamentos e integração bancária
- Gerar um QR Code ou código Pix não comprova que houve pagamento.
- Não exibir confirmação de pagamento real sem retorno de uma integração oficial e validada.
- Integração com Banco do Brasil ou outro provedor depende de análise de API, credenciais, custos, homologação e autorização.
- Nunca armazenar segredos, tokens ou credenciais no frontend ou no repositório.
- Até existir integração oficial, qualquer atualização de situação deve ser identificada como manual ou administrativa.

## 7. Arquitetura desejada
Separar responsabilidades:
- frontend/: páginas, estilos e JavaScript do navegador.
- backend/: servidor Express, rotas, controladores, serviços, repositórios e acesso ao banco.
- docs/: contexto, arquitetura, banco de dados e tarefas.
- Configurações sensíveis por variáveis de ambiente.
- Scripts e dependências documentados no package.json.

Estrutura proposta (ajustar após inspecionar o repositório):
```text
autopix/
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
├── backend/
│   └── src/
│       ├── server.js
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── middlewares/
│       └── database/
├── docs/
│   ├── CONTEXTO.md
│   ├── ARQUITETURA.md
│   ├── BANCO_DE_DADOS.md
│   └── TAREFAS.md
├── .env.example
├── .gitignore
├── CLAUDE.md
└── README.md
```

## 8. Banco de dados
PostgreSQL será a fonte persistente dos dados. O modelo definitivo ainda precisa ser levantado. Antes de criar tabelas:
- Identificar entidades e relacionamentos.
- Definir chaves primárias e estrangeiras.
- Definir restrições e índices necessários.
- Planejar migrações versionadas.
- Definir regras de exclusão e integridade.
- Evitar duplicar dados que possam ser derivados com segurança.

Possíveis entidades a avaliar: usuários, clientes/alunos, chaves Pix, cobranças, pagamentos e registros de histórico. Não criar todas sem validar os requisitos e o código existente.

## 9. Segurança
- Validar dados no backend; validação no frontend é apenas apoio à experiência.
- Usar consultas parametrizadas ou um mecanismo seguro de acesso ao PostgreSQL.
- Proteger rotas privadas com autenticação quando essa funcionalidade for planejada.
- Aplicar autorização no backend, não apenas ocultar botões.
- Usar HTTPS em produção.
- Não versionar .env, senhas, tokens, certificados ou dados reais de clientes.
- Criar .env.example sem valores secretos.
- Não usar dados reais de clientes em testes ou exemplos.
- Evitar registrar informações sensíveis em logs.

## 10. Regras de trabalho do agente
1. Inspecionar os arquivos existentes antes de propor mudanças.
2. Não afirmar que analisou ou executou algo sem realmente fazê-lo.
3. Não apagar nem reescrever funcionalidades sem necessidade e autorização.
4. Antes de mudanças estruturais, apresentar diagnóstico e plano.
5. Fazer alterações pequenas e coerentes, preservando o que funciona.
6. Explicar quais arquivos foram alterados e por quê.
7. Executar testes ou verificações disponíveis após mudanças e informar limitações.
8. Atualizar a documentação quando arquitetura, banco ou comportamento mudar.
9. Não inventar endpoints, tabelas, integrações ou resultados.
10. Pedir autorização antes de operações destrutivas, migrações que removam dados ou mudanças amplas.

## 11. Estado atual conhecido
- O usuário possui os arquivos do projeto AutoPix localmente.
- O repositório informado anteriormente: https://github.com/Tavinzera/AutoPix
- O usuário pretende trabalhar usando Google Antigravity.
- A stack desejada é HTML, CSS, JavaScript, Node.js, Express e PostgreSQL.
- A identidade visual desejada é preta e vermelha.
- Ainda não foi feita, nesta documentação, uma auditoria do código local nem uma confirmação da estrutura atual do repositório.

## 12. Próximos passos
1. Abrir a pasta existente no Antigravity.
2. Fazer inventário dos arquivos e funcionalidades.
3. Comparar a implementação com este contexto.
4. Apresentar diagnóstico sem modificar código.
5. Propor arquitetura final e modelo inicial do PostgreSQL.
6. Aguardar autorização para iniciar a implementação.
