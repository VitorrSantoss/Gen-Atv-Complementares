# Sistema de Gestão de Atividades Complementares - SENAC

<div align="center">

## 🚧 Status do Projeto

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)

## 🛠️ Tecnologias Utilizadas

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=for-the-badge&logo=tailwind-css" />
</p>

</div>

---

> Projeto de desenvolvimento de software acadêmico para **gestão e validação de atividades complementares em ambiente universitário**.

---

## 🏫 Informações Acadêmicas

| Campo           | Descrição                                   |
| --------------- | ------------------------------------------- |
| **Instituição** | SENAC                                       |
| **Curso**       | Análise e Desenvolvimento de Sistemas (ADS) |
| **Disciplina**  | Projeto Integrador / Desenvolvimento Web    |
| **Semestre**    | 2026.1                                      |

---

## 📋 Sobre o Projeto

O **Sistema de Gestão de Atividades Complementares** é uma aplicação web desenvolvida para digitalizar e automatizar o processo de registro, submissão e validação de horas complementares exigidas pelos cursos de graduação do SENAC.

As atividades complementares são requisito curricular obrigatório em cursos de nível superior, conforme as Diretrizes Curriculares Nacionais (DCN) estabelecidas pelo MEC. Atualmente, em muitas instituições, esse processo ocorre de forma manual, com entrega de documentos físicos, controle em planilhas e comunicação descentralizada, gerando ineficiências tanto para os alunos quanto para as coordenações.

Este sistema propõe uma solução integrada que atende a três perfis de usuário distintos: o **aluno**, que submete certificados digitalmente; o **coordenador**, que analisa e valida as submissões; e o **administrador do sistema**, que gerencia cursos e coordenadores de forma centralizada.

---

## 🎯 Objetivos

### Objetivo Geral

Desenvolver uma plataforma web responsiva que permita a gestão completa do ciclo de vida das atividades complementares, desde a submissão pelo aluno até a validação final pelo coordenador, promovendo rastreabilidade, transparência e eficiência no processo acadêmico.

### Objetivos Específicos

- Permitir que alunos submetam comprovantes de atividades (PDF, JPG, PNG) diretamente pelo sistema;
- Automatizar o acompanhamento de horas aprovadas, pendentes e rejeitadas por aluno e por área;
- Disponibilizar ao coordenador uma fila de análise com visualização do documento e campo de feedback;
- Oferecer ao administrador controle sobre cursos, coordenadores e suas vinculações;
- Implementar um motor de regras configurável que define limites de horas por categoria de atividade;
- Garantir uma experiência de uso intuitiva e responsiva para dispositivos móveis e desktops.

---

## 🧩 Funcionalidades por Perfil

### 👨‍🎓 Aluno (`/aluno`)

- **Dashboard pessoal** com progresso de horas por curso (aprovadas, pendentes, rejeitadas);
- **Submissão de atividades** com preenchimento de título, categoria, carga horária, data e upload de comprovante (PDF/imagem, limite de 5MB);
- **Central de notificações** com histórico de status das submissões e feedback do coordenador.

### 👩‍🏫 Coordenador (`/coordenador`)

- **Dashboard analítico** com gráficos de horas por área e status das solicitações;
- **Gestão de alunos** com cadastro, busca por nome ou CPF e acompanhamento individual de progresso;
- **Motor de regras** para configuração dos limites máximos de horas por categoria (Pesquisa, Extensão, Ensino, Cultural, Social);
- **Fila de solicitações** com visualização do comprovante anexado (PDF inline / imagem), campo de feedback e ações de aprovar ou rejeitar;
- **Notificações** de novas submissões via popover com indicador de lidas/não lidas.

### 🔐 Super Administrador (`/admin`)

- **Dashboard administrativo** com visão consolidada de cursos, coordenadores, alunos e pendências;
- **Gestão de cursos** com cadastro, vínculo com coordenadores, código do curso e controle de status (ativo/inativo);
- **Gestão de coordenadores** com cadastro, e-mail e associação a múltiplos cursos.

---

## 🗂️ Estrutura do Projeto

```
src/
├── assets/                  # Imagens e recursos estáticos
├── components/
│   ├── layout/              # Layouts por perfil (Admin, Coordenador, Aluno)
│   └── ui/                  # Componentes de UI (shadcn/ui)
├── contexts/
│   └── AuthContext.tsx      # Contexto de autenticação e controle de perfil
├── hooks/
│   ├── use-mobile.tsx       # Hook para detecção de dispositivo móvel
│   └── use-toast.ts         # Hook para sistema de notificações (toast)
├── lib/
│   └── utils.ts             # Utilitários gerais (cn, clsx, tailwind-merge)
├── pages/
│   ├── admin/               # Páginas do perfil Super Admin
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminCourses.tsx
│   │   └── AdminCoordinators.tsx
│   ├── coordinator/         # Páginas do perfil Coordenador
│   │   ├── CoordinatorDashboard.tsx
│   │   ├── CoordinatorStudents.tsx
│   │   ├── CoordinatorRules.tsx
│   │   └── CoordinatorSubmissions.tsx
│   ├── student/             # Páginas do perfil Aluno
│   │   ├── StudentDashboard.tsx
│   │   ├── StudentSubmission.tsx
│   │   └── StudentNotifications.tsx
│   ├── Login.tsx            # Página de autenticação com seleção de perfil
│   └── NotFound.tsx         # Página 404
├── App.tsx                  # Rotas, providers e proteção de rotas
├── main.tsx                 # Ponto de entrada da aplicação
└── index.css                # Estilos globais, variáveis CSS e design tokens
```

---

## 🛠️ Tecnologias Utilizadas

### Frontend

| Tecnologia                                    | Versão | Finalidade                 |
| --------------------------------------------- | ------ | -------------------------- |
| [React](https://react.dev/)                   | 18     | Biblioteca principal de UI |
| [TypeScript](https://www.typescriptlang.org/) | 5      | Tipagem estática           |
| [Vite](https://vitejs.dev/)                   | 5      | Bundler e dev server       |
| [React Router DOM](https://reactrouter.com/)  | 6      | Roteamento client-side     |
| [TailwindCSS](https://tailwindcss.com/)       | 3      | Estilização                |

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) v9+ ou [yarn](https://yarnpkg.com/) v1.22+

### Instalação e Execução

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/atividades-complementares.git

# 2. Acesse o diretório do projeto
cd atividades-complementares

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`.

### Scripts Disponíveis

```bash
npm run dev       # Inicia o servidor de desenvolvimento (HMR)
npm run build     # Gera o build de produção na pasta /dist
npm run preview   # Visualiza o build de produção localmente
npm run test      # Executa os testes unitários com Vitest
```

---

## 🔑 Credenciais de Acesso (Ambiente de Demonstração)

> ⚠️ **Atenção:** O sistema utiliza autenticação simulada (mock) para fins de demonstração acadêmica. Qualquer e-mail e senha são aceitos e o perfil é definido pela seleção na tela de login.

| Perfil      | E-mail (Exemplo)         | Redirecionamento |
| ----------- | ------------------------ | ---------------- |
| Aluno       | `joao@aluno.com`         | `/aluno`         |
| Coordenador | `maria@universidade.com` | `/coordenador`   |
| Super Admin | `admin@sistema.com`      | `/admin`         |

---

## 🔄 Fluxo de Uso do Sistema

```
[Aluno]
  │
  ├─ Faz login → Acessa Dashboard → Visualiza progresso de horas
  │
  └─ Submete atividade → Upload de comprovante → Aguarda avaliação
              │
              ▼
        [Coordenador]
              │
              ├─ Recebe notificação → Acessa fila de solicitações
              │
              ├─ Visualiza comprovante → Escreve feedback → Aprova ou Rejeita
              │
              └─ Configuração do motor de regras (limites por área)
                            │
                            ▼
                  [Super Admin]
                            │
                            ├─ Gerencia cursos (cadastro, coordenadores vinculados)
                            │
                            └─ Gerencia coordenadores (cadastro, cursos vinculados)
```

---

## 🎨 Design e Acessibilidade

O sistema adota um design system próprio com tokens de cor definidos em CSS custom properties (variáveis), garantindo:

- **Tema consistente** com paleta de cores primárias (azul), acentuadas (laranja) e semânticas (sucesso, aviso, erro);
- **Sidebar responsiva** com versões desktop fixa e mobile em drawer (gaveta deslizante);
- **Tipografia hierárquica** com as fontes _Plus Jakarta Sans_ (títulos) e _Inter_ (corpo de texto);
- **Componentes acessíveis** baseados em Radix UI (ARIA compliant);
- **Layout responsivo** otimizado para telas de 320px a 1920px de largura.

---

## 🚧 Limitações Atuais e Trabalhos Futuros

O projeto encontra-se em fase de desenvolvimento com frontend funcional e dados mockados. As seguintes melhorias estão previstas para versões futuras:

- **Integração com backend real** (API REST ou GraphQL) com banco de dados relacional;
- **Sistema de autenticação** com JWT e controle de sessão;
- **Armazenamento de arquivos** em serviço de nuvem (ex: AWS S3, Supabase Storage);
- **Exportação de relatórios** em PDF para coordenadores e alunos;
- **Sistema de e-mail** para notificações automáticas de aprovação/rejeição;
- **Painel de auditoria** com histórico completo de ações;
- **Testes de integração e E2E** com Playwright ou Cypress;
- **CI/CD** com GitHub Actions para deploy automatizado.

---

## 🤝 Contribuição

Este é um projeto acadêmico de caráter educacional. Contribuições, sugestões e correções são bem-vindas por meio de _pull requests_ ou abertura de _issues_ no repositório.

```bash
# Crie uma branch para sua feature
git checkout -b feature/minha-feature

# Faça commit das suas alterações
git commit -m "feat: descrição da feature"

# Envie para o repositório remoto
git push origin feature/minha-feature

# Abra um Pull Request
```

---

## 📄 Licença

Este projeto é desenvolvido para fins **exclusivamente acadêmicos** no âmbito do curso de Análise e Desenvolvimento de Sistemas do SENAC. O uso comercial não é autorizado sem prévia aprovação dos autores.

---

## 👥 Autores

Este projeto foi desenvolvido com dedicação pela equipe acadêmica:

<div align="center">

| Integrantes     |
| --------------- |
| Renan Souza     |
| Vitória Barbosa |
| Jorge Figueredo |
| Vitor Santos    |

</div>

> _"A educação é a arma mais poderosa que você pode usar para mudar o mundo."_  
> — **Nelson Mandela**

---

<div align="center">

Feito com ❤️ para o SENAC · 2026

</div>
