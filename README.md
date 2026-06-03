# KP-3DSM-API-FRONTEND

Frontend da aplicação KernelPanic de Controle de Apontamento de Horas  
Desenvolvido para o cliente GSW Soluções Integradas | FATEC São José dos Campos - DSM 3 Semestre

## Tecnologias

- Next.js 14
- TypeScript
- CSS Modules

## Como rodar

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

`bash
cd frontend
npm install
`

### Executar em desenvolvimento

`bash
cd frontend
npm run dev
`

A aplicação estarr disponível em http://localhost:3000

## Variáveis de ambiente

Crie um arquivo .env.local dentro da pasta frontend com as seguintes variáveis:

`env
NEXT_PUBLIC_APONTAMENTO_API_URL=http://localhost:8084
NEXT_PUBLIC_PROJETO_API_URL=http://localhost:8082
NEXT_PUBLIC_TASK_API_URL=http://localhost:8085
NEXT_PUBLIC_USUARIO_API_URL=http://localhost:8083
`

## Observação

O projeto possui uma pasta aninhadac e todos os comandos devem ser executados dentro de frontend/.
