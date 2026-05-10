<div align="center">

# KernelPanic — Frontend

**Projeto Integrador 3º Semestre · DSM · FATEC São José dos Campos**  
Cliente: **GSW Soluções Integradas**

**Next.js 16.2 · React 19 · TypeScript 5 · Tailwind CSS 4 · Axios**

 Repositório principal do projeto: **[Kernel-Panic-FatecSjc/KernelPanic-3DSM-API](https://github.com/Kernel-Panic-FatecSjc/KernelPanic-3DSM-API)**

</div>

---

## Sobre

Interface web do sistema de **controle de horas e apontamentos** desenvolvido para a GSW Soluções Integradas. Permite que profissionais registrem seus apontamentos de trabalho, gestores aprovem ou rejeitem horas, e que todos os perfis acompanhem projetos e atividades em tempo real.

---

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16.2.0 | Framework principal (App Router) |
| React | 19.2.4 | Biblioteca de UI |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 4.x | Estilização utilitária |
| Axios | 1.14.0 | Requisições HTTP |

---

## Pré-requisitos

- **Node.js** 18 ou superior
- **npm** 9 ou superior
- Backend em execução (ver repositório principal)

---

## Como executar

```powershell
# 1. Clone o repositório
git clone https://github.com/Kernel-Panic-FatecSjc/KP-3DSM-API-FRONTEND.git
cd KP-3DSM-API-FRONTEND\frontend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
#    Crie um arquivo .env.local na pasta frontend com:
#    NEXT_PUBLIC_APONTAMENTO_API_URL=http://localhost:8080
#    NEXT_PUBLIC_USUARIO_API_URL=http://localhost:8080

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Outros comandos úteis

```powershell
# Build de produção
npm run build

# Iniciar em modo produção (após build)
npm run start

# Lint
npm run lint
```

---

## Estrutura do projeto - EM ANDAMENTO

```
frontend/
├── app/
│   ├── cadastro_usuario/       # Cadastro de usuários
│   ├── controleHoras/
│   │   ├── entrada-saida/      # Registro de apontamentos
│   │   ├── aguardando-aprovacao/
│   │   ├── aprovados/
│   │   ├── rejeitados/
│   │   └── historico/
│   ├── login/                  # Autenticação
│   ├── projetos/               # Visualização de projetos
│   ├── services/               # Camada de comunicação com a API
│   └── layout.tsx              # Layout global
├── components/
│   └── layout/
│       └── navegationBar/      # Barra de navegação lateral
└── public/
    └── images/                 # Ícones e assets SVG
```

---

## Variáveis de ambiente

Crie o arquivo `.env.local` dentro de `frontend/`:

```env
NEXT_PUBLIC_APONTAMENTO_API_URL=http://localhost:8080
NEXT_PUBLIC_USUARIO_API_URL=http://localhost:8080
```

## Módulos implementados - EM ANDAMENTO

| Rota | Descrição | Perfil |
|---|---|---|
| `/login` | Autenticação de usuários | Todos |
| `/cadastro_usuario` | Cadastro de novos usuários | Administrador |
| `/projetos` | Visualização de projetos | Profissional / Gestor |
| `/controleHoras/entrada-saida` | Registro de apontamentos | Profissional |
| `/controleHoras/aguardando-aprovacao` | Horas aguardando aprovação | Gestor |
| `/controleHoras/aprovados` | Histórico de horas aprovadas | Todos |
| `/controleHoras/rejeitados` | Horas rejeitadas | Todos |
| `/controleHoras/historico` | Histórico completo | Todos |

