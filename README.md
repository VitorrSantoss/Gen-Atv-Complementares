# Sistema de Gestão de Atividades Complementares — SENAC

<div align="center">

![Status](https://img.shields.io/badge/Status-Em%20Produção-green?style=for-the-badge)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

**🔗 [Acessar Aplicação](https://progress-hub-six.vercel.app)**

</div>

---

> Plataforma web para gestão e validação de atividades complementares acadêmicas do SENAC, com suporte a múltiplos perfis de usuário, notificações por e-mail e instalação como PWA.

---

## 🏫 Informações Acadêmicas

| Campo           | Descrição                                   |
| --------------- | ------------------------------------------- |
| **Instituição** | SENAC                                       |
| **Curso**       | Análise e Desenvolvimento de Sistemas (ADS) |
| **Disciplina**  | Projeto Integrador                          |
| **Semestre**    | 2026.1                                      |

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 18 | Biblioteca principal de UI |
| TypeScript | 5 | Tipagem estática |
| Vite | 5 | Bundler e dev server |
| TailwindCSS | 3 | Estilização |
| React Router DOM | 6 | Roteamento client-side |
| Axios | — | Requisições HTTP |
| Recharts | — | Gráficos e dashboards |
| shadcn/ui | — | Componentes de UI (Radix UI) |
| vite-plugin-pwa | — | Progressive Web App |

---

## 📋 Funcionalidades Implementadas

### 👨‍🎓 Aluno (`/aluno`)
- Dashboard com progresso de horas por curso (aprovadas, pendentes, rejeitadas)
- Seletor de cursos — exibe apenas os cursos nos quais o aluno está matriculado
- Barras de progresso por categoria (Ensino, Pesquisa, Extensão)
- Submissão de atividades com upload de comprovante (PDF/imagem, até 5MB) com ferramenta de corte de imagem
- Auto-save de rascunho por curso
- Extrato em PDF via impressão do browser
- Central de notificações com status em tempo real, fixar e marcar como lida
- Regras do curso — exibe as regras de atividades configuradas pelo coordenador
- Recuperação de senha via código por e-mail

### 👩‍🏫 Coordenador (`/coordenador`)
- Dashboard analítico com gráficos de horas por área e distribuição de status
- Gestão de turmas com criação, edição e exclusão
- Vinculação de alunos a turmas com validação de matrícula no curso
- Gestão de alunos com busca e filtros
- Motor de regras — configuração de limites de horas por área de atividade
- Soma automática das regras atualiza a carga horária mínima do curso
- Fila de solicitações pendentes com visualização de certificado inline
- Aprovação/reprovação com feedback enviado por e-mail ao aluno
- Histórico em modo somente leitura (botão olho) — submissões já avaliadas não podem ser reeditadas
- Envio de e-mail automático ao aprovar ou reprovar (SendGrid)

### 🔐 Super Admin (`/admin`)
- Dashboard com métricas globais, gráfico de crescimento de alunos e distribuição de perfis
- Gestão de usuários com paginação, busca e filtro por perfil
- Gestão de cursos com CRUD completo
- Gestão de turmas
- Gestão de coordenadores com vínculo a cursos (regra: 1 coordenador por curso, 1 coordenador pode ter N cursos)

### 🔒 Autenticação
- Login com seleção de perfil e validação cruzada (impede login no perfil errado)
- JWT armazenado em `sessionStorage` — sessão expira ao fechar o navegador
- Recuperação de senha em 3 etapas: e-mail → código de 6 dígitos → nova senha

### 📱 PWA
- Instalável como aplicativo no celular e desktop
- Ícones adaptáveis para Android e iOS
- Service Worker com atualização automática

---

## 🗂️ Estrutura do Projeto

```
src/
├── assets/                  # Imagens e recursos estáticos
├── components/
│   ├── layout/              # Layouts por perfil (Admin, Coordenador, Aluno)
│   └── ui/                  # Componentes shadcn/ui
├── contexts/
│   ├── AuthContext.tsx      # Autenticação JWT e controle de perfil
│   └── CourseContext.tsx    # Cursos do aluno logado
├── hooks/                   # use-mobile, use-toast
├── lib/
│   ├── api.ts               # Instância axios com interceptor de token
│   └── utils.ts             # Utilitários (cn, clsx)
├── pages/
│   ├── admin/               # AdminDashboard, AdminCourses, AdminCoordinators, AdminClasses, AdminUsers
│   ├── coordinator/         # CoordinatorDashboard, CoordinatorStudents, CoordinatorRules,
│   │                        # CoordinatorSubmissions, CoordinatorClasses
│   ├── student/             # StudentDashboard, StudentSubmission, StudentNotifications, StudentRules
│   ├── Login.tsx
│   ├── EsqueciSenha.tsx
│   ├── ValidarCodigo.tsx
│   └── RedefinirSenha.tsx
├── services/
│   ├── admin/               # courseService, classService, coordService, userService
│   ├── aluno/               # SubmissaoService
│   ├── coordenador/         # CertificadoService, TurmaService, TurmaAlunoService,
│   │                        # AlunoService, RegraService, CursoService, DashboardService
│   └── authService.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## ⚙️ Como Executar

### Pré-requisitos
- Node.js v18+
- npm v9+

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Gen-Atv-Complementares.git
cd Gen-Atv-Complementares

# Instale as dependências
npm install

# Configure a URL da API
# Crie um arquivo .env.local na raiz:
echo "VITE_API_URL=http://localhost:8080" > .env.local

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

### Scripts

```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run preview   # Visualiza o build localmente
npm run test      # Testes unitários (Vitest)
```

---

## 🌐 Deploy

| Serviço | URL |
|---|---|
| Frontend (Vercel) | https://progress-hub-six.vercel.app |
| API (Render) | https://api-senac-5zz7.onrender.com |

### Variáveis de ambiente (Vercel)
```
VITE_API_URL=https://api-senac-5zz7.onrender.com
```

---

## 🔄 Fluxo Principal

```
Aluno → Login → Dashboard → Submete atividade com comprovante
                                        ↓
                              Coordenador recebe na fila
                                        ↓
                         Visualiza certificado → Feedback → Aprova/Rejeita
                                        ↓
                         Aluno recebe e-mail automático + notificação no sistema
```

---

## 👥 Autores

| Integrante |
|---|
| Jorge Figueredo |
| Vitor Santos |
| Lucas Vinícius |
| Renan Souza |
| Antonio Vinícius |
| Maria Vitória |

---

<div align="center">
Feito com ❤️ para o SENAC · 2026
</div>
