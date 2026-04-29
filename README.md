# 🛒 HubManager — Plataforma de Gestão de Produtos para E-commerce

> Centralize, automatize e escale suas operações de produto em marketplaces e ERPs com uma única plataforma.

---

## 📌 Visão Geral

O **HubManager** é uma plataforma SaaS desenvolvida para centralizar e automatizar a gestão de produtos em ambientes de e-commerce integrados a hubs como o  **AnyMarket** , ERPs como o **Bling** e marketplaces como o  **Mercado Livre** .

O sistema transforma processos operacionais manuais em fluxos automatizados, eliminando erros, aumentando a produtividade e garantindo total controle sobre os dados de produto.

---

## ⚙️ Funcionalidades Principais

### 🔎 1. Consulta e Enriquecimento de Produtos

Busca de produtos via **SKU** ou **ID do produto no hub** (`id_prod_hub`), com requisições diretas à API do hub.

**Dados retornados:**

* IDs internos do hub
* Informações de SKU
* Dados estruturados prontos para uso em planilhas ou integrações

---

### 📊 2. Automação de Planilhas

Preenchimento automático de planilhas com dados obtidos via API, com validação e tratamento de erros.

**Recursos:**

* Preenchimento automático de colunas específicas
* Organização por intervalos definidos de linhas
* Validação de dados antes da inserção
* Tratamento de erros (ex: SKU não encontrado)

> ✅ Elimina processos manuais repetitivos e reduz falhas humanas.

---

### 📦 3. Visualização Facilitada de Kits

Painel dedicado para visualização e gerenciamento de kits de produtos, permitindo identificar rapidamente a composição de cada kit, seus SKUs vinculados e a estrutura de agrupamento — sem precisar navegar pelo hub manualmente.

**Benefícios:**

* Visão consolidada de todos os kits cadastrados
* Identificação rápida de componentes e quantidades
* Facilita auditorias e revisões de catálogo

---

### 🔄 4. Clonagem de Produtos

Duplicação de produtos diretamente via API, com suporte a diferentes modalidades de operação:

| Modalidade               | Descrição                                              |
| ------------------------ | -------------------------------------------------------- |
| Simples → Simples       | Clonagem padrão de um produto simples                   |
| **Simples → Kit** | Converte um produto simples em kit durante a clonagem    |
| **Unitária**      | Clonagem de um único produto por vez                    |
| **Em lote**        | Clonagem de múltiplos produtos em uma única operação |

**Durante a clonagem:**

* Novos SKUs e EANs são definidos manualmente
* Campos inválidos (como IDs internos) são removidos automaticamente
* Estrutura original (imagens, categorias, atributos) é preservada

---

### ✏️ 5. Duplicação de Características Personalizadas

Replica características e atributos customizados de um produto para outros, com suporte a operação unitária ou em lote.

| Modo                | Descrição                                                             |
| ------------------- | ----------------------------------------------------------------------- |
| **Unitário** | Copia as características de um produto para outro individualmente      |
| **Em lote**   | Aplica as mesmas características a múltiplos produtos simultaneamente |

> ✅ Ideal para padronizar fichas técnicas, atributos de SEO e campos personalizados em todo o catálogo.

---

### 🔗 6. Integrações

| Serviço      | Tipo de Integração       |
| ------------- | -------------------------- |
| AnyMarket     | Hub de produtos (API REST) |
| Bling         | ERP                        |
| Mercado Livre | Marketplace                |

---

## 🧠 Lógica de Funcionamento

O sistema opera com base em:

* **Requisições HTTP** (GET, POST) às APIs externas
* **Autenticação via token** (`gumgaToken` para o AnyMarket)
* **Processamento e transformação de dados** antes de gravação
* **Regras condicionais** baseadas na estrutura da planilha e nas respostas das APIs

---

## 💻 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        HubManager                           │
│                                                             │
│   ┌─────────────┐        ┌──────────────────────────────┐  │
│   │   Frontend  │◄──────►│         Backend              │  │
│   │   (React)   │  API   │        (Node.js)             │  │
│   └─────────────┘        │                              │  │
│                           │  ┌─────────────────────────┐│  │
│                           │  │   Regras de Negócio      ││  │
│                           │  │   Integração com APIs    ││  │
│                           │  │   Processamento de Dados ││  │
│                           │  └─────────────────────────┘│  │
│                           └───────────┬──────────────────┘  │
└───────────────────────────────────────┼─────────────────────┘
                                        │
              ┌─────────────────────────┼──────────────────┐
              │                         │                  │
      ┌───────▼──────┐        ┌─────────▼──────┐   ┌──────▼─────┐
      │  AnyMarket   │        │     Bling      │   │  Mercado   │
      │  (Hub API)   │        │    (ERP)       │   │   Livre    │
      └──────────────┘        └────────────────┘   └────────────┘
```

### Stack Tecnológica

| Camada         | Tecnologia         | Responsabilidade                               |
| -------------- | ------------------ | ---------------------------------------------- |
| Frontend       | React              | Interface do usuário                          |
| Backend        | Node.js            | Regras de negócio e integração com APIs     |
| Processamento  | Scripts / Filas    | Automações assíncronas (em desenvolvimento) |
| Autenticação | Token (gumgaToken) | Acesso seguro às APIs do hub                  |

---

## 🚀 Evolução do Projeto

```
[Fase 1] Scripts Python internos
         └─► Automação básica de consultas e planilhas

[Fase 2] Backend Django + Frontend React
         └─► Centralização em painel web

[Fase 3] Migração para Node.js  ◄── Atual
         └─► Performance, escalabilidade e ecossistema JS unificado

[Fase 4] Modelo SaaS
         └─► Multiusuários, assinaturas, white-label e comercialização
```

---

## 🎯 Objetivos do Sistema

* ⏱️ **Reduzir tempo operacional** — tarefas que levavam horas passam a ser executadas em minutos
* 🧹 **Minimizar erros manuais** — validação e automação no lugar de digitação humana
* 📈 **Escalar operações de e-commerce** — preparado para alto volume de SKUs e integrações
* 📐 **Padronizar processos** — fluxos definidos e replicáveis para toda a equipe
* 👤 **Facilitar o uso por usuários finais** — painel amigável, sem necessidade de conhecimento técnico

---

## 📦 Instalação e Configuração

> **Pré-requisitos:** Node.js 18+, npm ou yarn

### 1. Clone o repositório

```bash
git clone https://github.com/Willianliver/Saas-Repleta.git
```

### 2. Instale as dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure as variáveis de ambiente

```bash
# backend/.env
PORT=3000
ANY_1="seu token"
ANY_1="seu token"
```

### 4. Inicie o projeto

```bash
# Backend
cd backend
npm run dev

# Frontend (em outro terminal)
cd frontend
npm start
```

---

## 🔐 Autenticação

O sistema utiliza **autenticação via token** nas integrações com APIs externas:

```http
GET /products/{id}
Headers:
  gumgaToken: {seu_token}
  Content-Type: application/json
```

---

## 📁 Estrutura de Pastas

```
hubmanager/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Lógica de cada funcionalidade
│   │   ├── services/         # Integração com APIs externas
│   │   ├── routes/           # Rotas da API
│   │   └── utils/            # Funções auxiliares
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React reutilizáveis
│   │   ├── pages/            # Páginas da aplicação
│   │   └── services/         # Chamadas à API do backend
│   └── package.json
│
└── README.md
```

---

## 🤝 Contribuição

1. Faça um fork do repositório
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob licença privada. Todos os direitos reservados.

---

<div align="center">
  <sub>Desenvolvido com ❤️ para escalar operações de e-commerce</sub>
</div>
