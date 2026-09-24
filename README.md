# Plataforma de Leilões em Tempo Real

Sistema de leilões desenvolvido para demonstrar uma arquitetura distribuída capaz de receber múltiplos lances simultaneamente, atualizar os participantes em tempo real e executar o processamento pós-leilão de forma desacoplada.

## Tecnologias

* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Material UI
* **Backend:** Node.js, TypeScript, Express
* **Banco de dados:** PostgreSQL
* **Comunicação em tempo real:** WebSocket / Socket.IO
* **Mensageria:** Redis Pub/Sub
* **Comunicação entre serviços:** gRPC
* **Load Balancer:** Traefik
* **Containers:** Docker / Docker Compose
* **Autoscaling:** Docker + serviço de autoscaling

---

# Arquitetura

A aplicação é dividida em múltiplos serviços e containers.

```text
                                   ┌──────────────────────┐
                                   │       USUÁRIOS       │
                                   │   Navegador / React   │
                                   └──────────┬───────────┘
                                              │
                                   HTTP / WebSocket
                                              │
                                              ▼
                              ┌───────────────────────────┐
                              │          TRAEFIK           │
                              │       Load Balancer        │
                              └─────────────┬─────────────┘
                                            │
                              distribui requisições HTTP
                                  entre as réplicas
                                            │
                         ┌──────────────────┴──────────────────┐
                         │                                     │
                         ▼                                     ▼
                ┌─────────────────┐                   ┌─────────────────┐
                │    BACKEND 1    │                   │    BACKEND 2    │
                │  Node + Express │                   │  Node + Express │
                │                 │                   │                 │
                │  API REST       │                   │  API REST       │
                │  Socket.IO      │                   │  Socket.IO      │
                └───────┬─────────┘                   └─────────┬───────┘
                        │                                       │
                        │                                       │
              ┌─────────┴──────────┐                  ┌─────────┴──────────┐
              │                    │                  │                    │
              ▼                    ▼                  ▼                    ▼
       ┌─────────────┐      ┌─────────────┐   ┌─────────────┐      ┌─────────────┐
       │ PostgreSQL  │      │    Redis    │   │ PostgreSQL  │      │    Redis    │
       │             │      │  Pub / Sub  │   │             │      │  Pub / Sub  │
       └─────────────┘      └──────┬──────┘   └─────────────┘      └──────┬──────┘
                                   │                                       │
                                   └───────────────┬───────────────────────┘
                                                   │
                                      eventos de novos lances
                                                   │
                                                   ▼
                                      ┌──────────────────────┐
                                      │ WebSocket / Socket.IO │
                                      │   Atualização em      │
                                      │     tempo real        │
                                      └──────────┬───────────┘
                                                 │
                                                 ▼
                                            PARTICIPANTES


                    QUANDO O LEILÃO É ENCERRADO
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     BACKEND      │
                         │                  │
                         │ identifica       │
                         │ vencedor         │
                         └────────┬─────────┘
                                  │
                              gRPC │
                                  ▼
                    ┌────────────────────────────┐
                    │    POST-AUCTION SERVICE    │
                    │                            │
                    │ Processamento pós-leilão   │
                    │                            │
                    │ cobrança / confirmação /   │
                    │ demais tarefas posteriores │
                    └────────────────────────────┘


                    MONITORAMENTO / ESCALABILIDADE
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    AUTOSCALER    │
                         │                  │
                         │ monitora recursos│
                         │ dos containers   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         Docker Engine
                                  │
                       ┌──────────┴──────────┐
                       │                     │
                       ▼                     ▼
                  Backend 1             Backend 2
                       │
                       │ quando necessário
                       ▼
                  Backend 3
```

### Fluxo de um lance

O fluxo simplificado de um lance é:

```text
Usuário
   │
   │ POST /api/auctions/:id/bids
   ▼
Traefik
   │
   ├──────────────► Backend 1
   │
   └──────────────► Backend 2
                         │
                         ▼
                    PostgreSQL
                         │
                         ▼
                    Redis Pub/Sub
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
         Backend 1             Backend 2
              │                     │
              └──────────┬──────────┘
                         ▼
                    Socket.IO
                         │
                         ▼
                Usuários conectados
```

Dessa forma, um usuário não precisa ficar consultando repetidamente a API para descobrir se houve um novo lance. O servidor pode enviar a atualização através do WebSocket.

---

# Estrutura do projeto

```text
auction-platform/
│
├── backend/
│   │
│   ├── src/
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │
│   │   ├── domain/
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   ├── repositories/
│   │   │   ├── redis/
│   │   │   └── websocket/
│   │   │
│   │   ├── interfaces/
│   │   │   ├── controllers/
│   │   │   ├── middlewares/
│   │   │   └── routes/
│   │   │
│   │   └── server.ts
│   │
│   ├── tests/
│   │   ├── auction-simulation.ts
│   │   ├── createUser.ts
│   │   └── placeBid.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   │
│   ├── src/
│   │   ├── App/
│   │   │   ├── assets/
│   │   │   └── pages/
│   │   │
│   │   ├── routes/
│   │   └── interfaces/
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── autoscaler/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
│
├── services/
│   │
│   └── post-auction-service/
│       ├── src/
│       ├── proto/
│       ├── package.json
│       ├── Dockerfile
│       └── tsconfig.json
│
├── docker-compose.yml
│
└── README.md
```

A estrutura acima representa as principais responsabilidades. Alguns diretórios possuem subpastas adicionais conforme a implementação de cada parte do sistema.

---

# Como executar

## Pré-requisitos

É necessário possuir:

* Docker
* Docker Compose
* Node.js
* npm

## Clonar o projeto

```bash
git clone https://github.com/RedSmelter/PlataformaDeLeiloes.git
cd PlataformaDeLeiloes
```

## Subir a aplicação

Na raiz do projeto:

```bash
docker compose up -d
```

Verificar os containers:

```bash
docker compose ps
```

Para acompanhar os logs de todos os serviços:

```bash
docker compose logs -f
```

---

# Logs dos serviços

## Backend

Na raiz do projeto:

```bash
docker compose logs -f backend
```

Esse comando permite acompanhar as requisições recebidas pelas réplicas do backend, erros e outros eventos da API.

## Frontend

```bash
docker compose logs -f frontend
```

## PostgreSQL

```bash
docker compose logs -f postgres
```

## Redis

```bash
docker compose logs -f redis
```

## Traefik

```bash
docker compose logs -f traefik
```

## Autoscaler

```bash
docker compose logs -f autoscaler
```

## Post-Auction Service / gRPC

Para acompanhar os logs do container do serviço:

```bash
docker compose logs -f post-auction-service
```

Se estiver utilizando o Compose a partir dessa pasta e o arquivo Compose correspondente estiver configurado ali:

```bash
docker compose logs -f
```

O serviço utiliza **gRPC na porta 50051**.

---

# Executar o frontend localmente

Entre no frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm run dev
```

O frontend utiliza a porta:

```text
5173
```

---

# Executar o backend localmente

Entre no backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm run dev
```

O backend utiliza a porta:

```text
3000
```

---

# Teste automatizado do leilão

O projeto possui uma simulação automatizada para testar vários usuários participando de um mesmo leilão.

O teste está localizado em:

```text
backend/tests/auction-simulation.ts
```

Entre no backend:

```bash
cd backend
```

Execute:

```bash
npm run test:auction
```

Por padrão:

```text
10 usuários
```

---

# Escolhendo a quantidade de usuários

A quantidade de participantes pode ser definida através de `--users`.

### 20 usuários

```bash
npm run test:auction -- --users=20
```

### 50 usuários

```bash
npm run test:auction -- --users=50
```

### 200 usuários

```bash
npm run test:auction -- --users=200
```

---

# O que o teste automatizado faz?

O teste executa automaticamente o seguinte fluxo:

```text
1. Verifica Docker
        ↓
2. Verifica se existem pelo menos 2 backends
        ↓
3. Cria vendedor
        ↓
4. Cria participantes
        ↓
5. Cria leilão de 60 segundos
        ↓
6. Todos os participantes começam a disputar
        ↓
7. Cada usuário realiza vários lances
        ↓
8. Lances são aceitos ou rejeitados
        ↓
9. Usuários continuam disputando durante 60 segundos
        ↓
10. Leilão é encerrado
        ↓
11. Resultado da disputa é exibido
```

Durante a disputa, cada lance é exibido no console com o horário.

Exemplo:

```text
[13:40:02] [LANCE] bidder-4 → R$ 125
[13:40:02] [✓ ACEITO] bidder-4 → R$ 125

[13:40:03] [LANCE] bidder-11 → R$ 143
[13:40:03] [✓ ACEITO] bidder-11 → R$ 143

[13:40:03] [LANCE] bidder-7 → R$ 121
[13:40:03] [✗ REJEITADO] bidder-7 → R$ 121
```

Ao final:

```text
========================================
[13:41:01] LEILÃO ENCERRADO
========================================

Total de tentativas: 700
Lances aceitos: 35
Lances rejeitados: 665
Maior lance observado: R$ 1840
```

Os valores variam a cada execução.

---

# Múltiplas réplicas do backend

O projeto executa mais de uma instância do backend.

O Traefik distribui as requisições entre essas instâncias:

```text
                    Traefik
                   /       \
                  /         \
                 ▼           ▼
          Backend 1       Backend 2
```

O teste automatizado envia diversas requisições simultaneamente, permitindo observar o comportamento da aplicação em um ambiente com múltiplas réplicas.

Para acompanhar:

```bash
docker compose logs -f backend
```

---

# Redis Pub/Sub

O Redis é utilizado como mecanismo de publicação e assinatura de eventos entre as diferentes instâncias do backend.

Exemplo:

```text
Backend 1
   │
   │ publica evento
   ▼
Redis Pub/Sub
   │
   │ distribui evento
   ▼
Backend 2
```

Isso permite que um evento produzido por uma réplica possa ser propagado para outras réplicas.

---

# WebSocket / Socket.IO

O WebSocket é utilizado para atualização dos lances em tempo real.

Quando um lance é registrado, o backend emite um evento:

```text
new-bid
```

Os clientes conectados ao leilão podem receber a atualização sem realizar polling contínuo.

Fluxo:

```text
Novo lance
    │
    ▼
Backend
    │
    ▼
Redis Pub/Sub
    │
    ▼
Backend(s)
    │
    ▼
Socket.IO
    │
    ▼
Clientes conectados
```

---

# gRPC e Post-Auction Service

Quando o leilão é encerrado, o backend pode iniciar o processamento pós-leilão através do serviço separado.

```text
             Backend
                │
                │ gRPC
                ▼
      Post-Auction Service
                │
                ├── processamento do vencedor
                ├── cobrança
                ├── confirmação
                └── tarefas pós-leilão
```

O serviço gRPC utiliza a porta:

```text
50051
```

Para visualizar seus logs:

```bash
docker compose logs -f post-auction-service
```

---

# Autoscaling

O projeto possui um serviço responsável pelo autoscaling dos containers do backend.

Configuração atual:

```text
Mínimo de réplicas: 2
Máximo de réplicas: 3
```

O autoscaler monitora o consumo dos containers e pode adicionar ou remover uma réplica conforme os limites configurados.

Conceito:

```text
                    Autoscaler
                        │
                        ▼
                  Docker Engine
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
         Backend 1            Backend 2
                                    │
                              alta utilização
                                    │
                                    ▼
                               Backend 3
```

---

# Comandos úteis

## Subir projeto

```bash
docker compose up -d
```

## Subir reconstruindo as imagens

```bash
docker compose up -d --build
```

## Ver containers

```bash
docker compose ps
```

## Ver todos os logs

```bash
docker compose logs -f
```

## Backend

```bash
docker compose logs -f backend
```

## Frontend

```bash
docker compose logs -f frontend
```

## Redis

```bash
docker compose logs -f redis
```

## PostgreSQL

```bash
docker compose logs -f postgres
```

## Traefik

```bash
docker compose logs -f traefik
```

## Autoscaler

```bash
docker compose logs -f autoscaler
```

## Serviço gRPC

```bash
docker compose logs -f post-auction-service
```

## Parar tudo

```bash
docker compose down
```

---

# Tecnologias de comunicação utilizadas

O projeto utiliza três das tecnologias propostas no cenário:

| Tecnologia                | Utilização                              |
| ------------------------- | --------------------------------------- |
| **WebSocket / Socket.IO** | Atualização dos lances em tempo real    |
| **Redis Pub/Sub**         | Propagação de eventos entre réplicas    |
| **gRPC**                  | Comunicação com o serviço de pós-leilão |

Essas tecnologias são utilizadas em conjunto com Docker, Traefik, PostgreSQL e múltiplas réplicas do backend para formar uma aplicação distribuída.

# Objetivo do projeto

O projeto tem como objetivo demonstrar uma plataforma de leilões capaz de receber múltiplos lances simultaneamente e atualizar os participantes em tempo real.

A arquitetura também demonstra:

* execução de múltiplas réplicas;
* balanceamento de requisições;
* comunicação assíncrona através do Redis Pub/Sub;
* comunicação em tempo real através de WebSocket;
* comunicação entre serviços através de gRPC;
* processamento pós-leilão desacoplado;
* execução de testes automatizados com múltiplos usuários;
* escalabilidade horizontal através de containers.
