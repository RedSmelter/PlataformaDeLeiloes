# Architecture Decision Records (ADR)

## Plataforma de Leilões em Tempo Real

**Projeto:** Plataforma de Leilões em Tempo Real
**Arquitetura:** Clean Architecture + Microsserviços/serviços especializados
**Stack principal:** TypeScript, React, Node.js, PostgreSQL, Redis, WebSocket, gRPC e Docker
**Status:** Em desenvolvimento
**Data:** Setembro de 2026

---

# Índice

1. [ADR-001 — Adoção de Clean Architecture](#adr-001--adoção-de-clean-architecture)
2. [ADR-002 — TypeScript como linguagem principal](#adr-002--typescript-como-linguagem-principal)
3. [ADR-003 — React + Vite no frontend](#adr-003--react--vite-no-frontend)
4. [ADR-004 — Node.js + Express no backend](#adr-004--nodejs--express-no-backend)
5. [ADR-005 — PostgreSQL como banco de dados](#adr-005--postgresql-como-banco-de-dados)
6. [ADR-006 — Docker e Docker Compose](#adr-006--docker-e-docker-compose)
7. [ADR-007 — Separação entre frontend e backend](#adr-007--separação-entre-frontend-e-backend)
8. [ADR-008 — WebSocket/Socket.IO para comunicação em tempo real](#adr-008--websocketsocketio-para-comunicação-em-tempo-real)
9. [ADR-009 — Redis Pub/Sub para sincronização entre réplicas](#adr-009--redis-pubsub-para-sincronização-entre-réplicas)
10. [ADR-010 — gRPC para o processamento pós-leilão](#adr-010--grpc-para-o-processamento-pós-leilão)
11. [ADR-011 — Traefik como Load Balancer](#adr-011--traefik-como-load-balancer)
12. [ADR-012 — Múltiplas réplicas do backend](#adr-012--múltiplas-réplicas-do-backend)
13. [ADR-013 — Autoscaling do backend](#adr-013--autoscaling-do-backend)
14. [ADR-014 — Serviço separado de pós-leilão](#adr-014--serviço-separado-de-pós-leilão)
15. [ADR-015 — Fluxo de encerramento do leilão](#adr-015--fluxo-de-encerramento-do-leilão)
16. [ADR-016 — Estratégia de autenticação](#adr-016--estratégia-de-autenticação)
17. [ADR-017 — Simulação automatizada de usuários](#adr-017--simulação-automatizada-de-usuários)
18. [ADR-018 — Concorrência de lances](#adr-018--concorrência-de-lances)
19. [ADR-019 — Separação dos testes por responsabilidade](#adr-019--separação-dos-testes-por-responsabilidade)
20. [ADR-020 — Organização do Docker Compose](#adr-020--organização-do-docker-compose)
21. [ADR-021 — Tecnologias de comunicação escolhidas](#adr-021--tecnologias-de-comunicação-escolhidas)
22. [ADR-022 — Decisões descartadas](#adr-022--decisões-descartadas)

---

# ADR-001 — Adoção de Clean Architecture

## Status

**Aceito**

## Contexto

A aplicação possui diferentes responsabilidades:

* regras de negócio;
* casos de uso;
* acesso ao banco de dados;
* comunicação HTTP;
* comunicação WebSocket;
* comunicação Redis;
* comunicação gRPC;
* autenticação;
* controllers e rotas.

Colocar todas essas responsabilidades diretamente nos mesmos arquivos aumentaria o acoplamento e dificultaria testes e manutenção.

Além disso, o projeto possui como requisito acadêmico a utilização de Clean Architecture.

## Decisão

Adotar **Clean Architecture** como princípio arquitetural do backend e frontend.

A aplicação será organizada em camadas com responsabilidades distintas.

### Backend

```text
backend/src/

├── domain/
│   ├── entities/
│   └── repositories/
│
├── application/
│   └── use-cases/
│
├── infrastructure/
│   ├── database/
│   ├── repositories/
│   ├── redis/
│   └── websocket/
│
├── interfaces/
│   ├── controllers/
│   ├── middlewares/
│   └── routes/
│
└── server.ts
```

### Responsabilidades

**Domain**

Contém as regras e entidades fundamentais do negócio.

**Application**

Contém os casos de uso da aplicação.

**Infrastructure**

Contém implementações dependentes de tecnologias externas, como PostgreSQL, Redis e WebSocket.

**Interfaces**

Responsável pela comunicação externa da aplicação, como HTTP, controllers, rotas e middlewares.

## Consequências

### Positivas

* menor acoplamento;
* maior testabilidade;
* responsabilidades bem definidas;
* facilidade para substituir tecnologias;
* regras de negócio independentes da infraestrutura.

### Negativas

* maior quantidade de arquivos;
* maior complexidade inicial;
* necessidade de compreender as responsabilidades de cada camada.

---

# ADR-002 — TypeScript como linguagem principal

## Status

**Aceito**

## Contexto

O projeto necessita de uma aplicação web moderna e possui grande quantidade de objetos, entidades, requisições e contratos entre serviços.

## Decisão

Utilizar **TypeScript** no frontend, backend, testes e serviços auxiliares.

## Justificativa

O TypeScript fornece tipagem estática e permite definir contratos explícitos entre componentes.

Isso é particularmente útil para:

* entidades;
* DTOs;
* respostas HTTP;
* usuários;
* leilões;
* lances;
* comunicação gRPC;
* testes automatizados.

## Consequências

O projeto mantém uma linguagem principal entre suas diferentes partes, reduzindo a necessidade de alternar entre linguagens.

---

# ADR-003 — React + Vite no frontend

## Status

**Aceito**

## Contexto

O sistema necessita de uma interface web dinâmica para:

* autenticação;
* visualização de leilões;
* criação de leilões;
* acompanhamento de lances;
* atualização em tempo real.

## Decisão

Utilizar:

* React;
* TypeScript;
* Vite;
* Tailwind CSS;
* Material UI;
* React Router.

## Justificativa

React permite construir a interface utilizando componentes reutilizáveis.

Vite fornece um ambiente de desenvolvimento e build adequado para uma aplicação React moderna.

Tailwind e Material UI são utilizados para construção da interface.

React Router é utilizado para gerenciamento das rotas da aplicação.

---

# ADR-004 — Node.js + Express no backend

## Status

**Aceito**

## Contexto

O backend precisa fornecer uma API HTTP para autenticação, gerenciamento de leilões e registro de lances.

## Decisão

Utilizar:

* Node.js;
* TypeScript;
* Express.

## Responsabilidades

O backend será responsável por:

* autenticação;
* criação de usuários;
* criação de leilões;
* consulta de leilões;
* registro de lances;
* emissão de eventos;
* comunicação com Redis;
* comunicação com o serviço pós-leilão.

---

# ADR-005 — PostgreSQL como banco de dados

## Status

**Aceito**

## Contexto

A aplicação necessita persistir dados relacionados a:

* usuários;
* leilões;
* lances;
* vencedores;
* informações relacionadas ao processamento dos leilões.

## Decisão

Utilizar **PostgreSQL** como banco de dados relacional principal.

## Justificativa

O domínio possui relações bem definidas entre entidades.

Exemplo:

```text
User
 │
 └──< Bid >── Auction
```

O PostgreSQL fornece:

* transações;
* constraints;
* relacionamentos;
* integridade referencial;
* consultas relacionais.

---

# ADR-006 — Docker e Docker Compose

## Status

**Aceito**

## Contexto

O projeto possui múltiplos componentes que precisam funcionar conjuntamente.

## Decisão

Executar os componentes utilizando containers Docker e orquestrá-los inicialmente através do Docker Compose.

## Serviços

```text
postgres
redis
backend
frontend
traefik
autoscaler
post-auction-service
```

## Justificativa

A utilização de containers permite que cada componente tenha seu próprio ambiente e dependências.

Também facilita a execução do projeto em diferentes máquinas.

---

# ADR-007 — Separação entre frontend e backend

## Status

**Aceito**

## Contexto

Frontend e backend possuem responsabilidades diferentes e devem poder evoluir independentemente.

## Decisão

Criar containers separados:

```text
frontend
backend
```

A comunicação entre eles ocorre através de HTTP.

Exemplo:

```text
React
   │
   │ HTTP
   ▼
Traefik
   │
   ▼
Backend
```

## Consequências

O frontend não acessa diretamente o banco de dados.

O backend é responsável pela lógica de negócio e persistência.

---

# ADR-008 — WebSocket/Socket.IO para comunicação em tempo real

## Status

**Aceito**

## Contexto

Um dos requisitos fundamentais é permitir que vários usuários acompanhem os lances de um leilão praticamente em tempo real.

Utilizar polling faria os clientes realizarem requisições repetidamente.

## Decisão

Utilizar **WebSocket através do Socket.IO**.

Quando um lance é aceito, o backend emite:

```text
new-bid
```

para a sala correspondente ao leilão:

```text
auction:{auctionId}
```

Exemplo:

```text
Usuário
   │
   │ WebSocket
   ▼
Backend
   │
   └──► auction:123
          │
          ├── usuário A
          ├── usuário B
          └── usuário C
```

## Consequências

Todos os clientes conectados ao mesmo leilão podem receber o novo lance sem realizar polling.

---

# ADR-009 — Redis Pub/Sub para sincronização entre réplicas

## Status

**Aceito**

## Contexto

O backend possui múltiplas réplicas.

Um usuário pode estar conectado via WebSocket à réplica A enquanto outro usuário envia um lance através da réplica B.

Sem um mecanismo de comunicação entre as instâncias, a réplica A poderia não conhecer imediatamente o evento produzido pela réplica B.

## Decisão

Utilizar **Redis Pub/Sub** como mecanismo de comunicação entre as instâncias do backend.

Fluxo:

```text
             ┌───────────────┐
             │   Backend 1   │
             └───────┬───────┘
                     │
                     │ publish
                     ▼
                ┌─────────┐
                │  Redis  │
                │ Pub/Sub │
                └────┬────┘
                     │
                     │ subscribe
                     ▼
             ┌───────────────┐
             │   Backend 2   │
             └───────────────┘
```

## Objetivo

Propagar eventos relacionados aos leilões entre as diferentes instâncias do backend.

## Consequência

O WebSocket pode continuar sendo utilizado para comunicação com os clientes enquanto o Redis funciona como mecanismo de sincronização interna.

---

# ADR-010 — gRPC para o processamento pós-leilão

## Status

**Aceito**

## Contexto

Quando um leilão termina, determinadas operações podem ser realizadas independentemente do atendimento HTTP normal.

Entre elas estão:

* identificação do vencedor;
* processamento do pagamento;
* confirmação;
* emissão de informações relacionadas à conclusão da operação.

## Decisão

Criar um serviço separado:

```text
services/post-auction-service
```

Esse serviço utiliza **gRPC** para comunicação com o backend.

Porta:

```text
50051
```

Fluxo:

```text
Backend
   │
   │ gRPC
   ▼
post-auction-service
   │
   ├── processamento do vencedor
   ├── pagamento
   └── conclusão do leilão
```

## Justificativa

gRPC fornece uma comunicação estruturada e eficiente entre serviços.

Também atende ao requisito acadêmico de utilização de tecnologias de comunicação distribuída.

---

# ADR-011 — Traefik como Load Balancer

## Status

**Aceito**

## Contexto

O backend possui múltiplas réplicas.

As requisições não devem depender de uma única instância.

## Decisão

Utilizar **Traefik** como ponto de entrada para o backend e mecanismo de distribuição das requisições.

Arquitetura:

```text
              ┌───────────────┐
              │    Cliente    │
              └───────┬───────┘
                      │
                      ▼
                ┌───────────┐
                │  Traefik  │
                └─────┬─────┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
       ┌──────────┐      ┌──────────┐
       │ Backend 1│      │ Backend 2│
       └──────────┘      └──────────┘
```

## Justificativa

O Traefik possui integração com Docker e consegue descobrir dinamicamente os containers disponíveis.

---

# ADR-012 — Múltiplas réplicas do backend

## Status

**Aceito**

## Contexto

Uma única instância do backend não representa adequadamente um cenário distribuído.

O projeto precisa demonstrar:

* balanceamento;
* comunicação entre instâncias;
* tolerância a diferentes volumes de requisições;
* sincronização de eventos.

## Decisão

Manter inicialmente:

```text
mínimo: 2 réplicas
máximo: 3 réplicas
```

Cada container backend possui atualmente limites de:

```text
CPU: 1
RAM: 512 MB
```

## Consequência

As requisições podem ser distribuídas entre diferentes instâncias.

Redis é utilizado para sincronizar eventos entre elas.

---

# ADR-013 — Autoscaling do backend

## Status

**Aceito**

## Contexto

A quantidade de usuários de um leilão pode variar durante sua execução.

Uma arquitetura com quantidade fixa de instâncias não aproveitaria adequadamente os recursos disponíveis.

## Decisão

Criar um serviço de autoscaling:

```text
autoscaler/
```

O autoscaler monitora os containers Docker e ajusta a quantidade de réplicas.

Configuração atual:

```text
MIN_REPLICAS = 2
MAX_REPLICAS = 3

SCALE_UP_THRESHOLD = 85%
SCALE_DOWN_THRESHOLD = 25%

CHECK_INTERVAL = 3 segundos
```

## Comportamento

Quando a utilização atingir o limite configurado para escala:

```text
Backend 1
Backend 2
     │
     │ utilização elevada
     ▼
Autoscaler
     │
     ▼
Backend 3
```

Quando a utilização permanecer abaixo do limite de redução, a réplica adicional pode ser removida.

## Justificativa

A estratégia permite demonstrar elasticidade da aplicação em um ambiente Docker.

---

# ADR-014 — Serviço separado de pós-leilão

## Status

**Aceito**

## Contexto

O processamento realizado após o encerramento de um leilão possui responsabilidades diferentes das operações normais de consulta e registro de lances.

## Decisão

Isolar esse processamento em:

```text
services/post-auction-service
```

O serviço possui seu próprio:

* código;
* Dockerfile;
* configuração;
* contrato gRPC;
* processo de execução.

## Benefícios

O processamento pós-leilão não precisa estar diretamente acoplado ao processo HTTP principal.

Também permite que o serviço seja escalado ou alterado independentemente.

---

# ADR-015 — Fluxo de encerramento do leilão

## Status

**Aceito**

## Contexto

O encerramento de um leilão deve resultar na identificação do vencedor e no início do processamento pós-leilão.

## Decisão

O fluxo conceitual será:

```text
Leilão aberto
     │
     ▼
Recebimento de lances
     │
     ▼
Atualização do maior lance
     │
     ▼
Temporizador termina
     │
     ▼
Leilão encerrado
     │
     ▼
Identificação do vencedor
     │
     ▼
gRPC
     │
     ▼
Post-Auction Service
     │
     ├── pagamento
     ├── confirmação
     └── demais operações pós-leilão
```

O processamento pós-leilão é separado do fluxo normal de recebimento de lances.

---

# ADR-016 — Estratégia de autenticação

## Status

**Aceito**

## Contexto

Somente usuários autenticados podem executar determinadas operações.

Entre elas:

* criação de leilões;
* realização de lances.

## Decisão

Utilizar autenticação baseada em **JWT**.

Fluxo:

```text
POST /api/auth/register
          │
          ▼
       usuário
          │
          ▼
POST /api/auth/login
          │
          ▼
        JWT
          │
          ▼
Authorization: Bearer <token>
```

O middleware de autenticação valida o token antes de permitir acesso aos endpoints protegidos.

---

# ADR-017 — Simulação automatizada de usuários

## Status

**Aceito**

## Contexto

Testar manualmente dezenas ou centenas de usuários realizando lances não é adequado para demonstrar o comportamento distribuído da aplicação.

## Decisão

Criar uma simulação automatizada em:

```text
backend/tests/auction-simulation.ts
```

A quantidade de usuários pode ser definida através do comando:

```bash
npm run test:auction -- --users=20
```

Exemplos:

```bash
npm run test:auction
npm run test:auction -- --users=20
npm run test:auction -- --users=50
npm run test:auction -- --users=200
```

O valor padrão é 10 usuários.

## Fluxo

A simulação:

1. verifica as réplicas do backend;
2. cria o vendedor;
3. realiza login;
4. obtém o JWT;
5. cria um leilão;
6. cria os usuários participantes;
7. realiza lances;
8. executa lances concorrentes;
9. registra lances aceitos e rejeitados;
10. acompanha o maior lance;
11. aguarda o encerramento do leilão;
12. permite validar o processamento posterior.

---

# ADR-018 — Concorrência de lances

## Status

**Aceito**

## Contexto

Um dos principais requisitos do sistema é suportar vários usuários tentando realizar lances simultaneamente.

Uma simulação puramente sequencial não representaria adequadamente esse cenário.

## Decisão

Utilizar requisições concorrentes através de `Promise.all`.

Exemplo conceitual:

```text
             ┌── bidder 1 ──► lance
             │
             ├── bidder 2 ──► lance
Usuários ────┼── bidder 3 ──► lance
             │
             ├── bidder 4 ──► lance
             │
             └── bidder N ──► lance
```

Cada participante tenta realizar um lance independentemente.

## Resultado

Alguns lances podem ser aceitos e outros rejeitados dependendo do estado do maior lance no momento em que o backend processa cada requisição.

Isso permite reproduzir uma disputa mais próxima do comportamento de usuários reais.

---

# ADR-019 — Separação dos testes por responsabilidade

## Status

**Aceito**

## Contexto

Concentrar toda a lógica da simulação em um único arquivo tornaria o teste difícil de manter.

## Decisão

Separar responsabilidades em arquivos independentes.

Estrutura atual:

```text
backend/tests/

├── auction-simulation.ts
├── createUser.ts
└── placeBid.ts
```

### auction-simulation.ts

Responsável por orquestrar o cenário completo.

### createUser.ts

Responsável por:

* registrar usuário;
* realizar login;
* obter JWT.

### placeBid.ts

Responsável por enviar uma requisição de lance.

## Consequência

A simulação principal funciona como um orquestrador enquanto as operações específicas permanecem reutilizáveis.

---

# ADR-020 — Organização do Docker Compose

## Status

**Aceito**

## Contexto

O projeto possui vários componentes que precisam ser inicializados em conjunto.

## Decisão

Centralizar a infraestrutura em um `docker-compose.yml` na raiz do projeto.

```text
auction-platform/
│
├── docker-compose.yml
│
├── backend/
├── frontend/
├── autoscaler/
│
└── services/
    └── post-auction-service/
```

Os principais serviços são:

```text
postgres
redis
traefik
backend
frontend
autoscaler
post-auction-service
```

## Benefício

A infraestrutura pode ser iniciada com:

```bash
docker compose up -d
```

E reconstruída quando necessário:

```bash
docker compose up -d --build
```

---

# ADR-021 — Tecnologias de comunicação escolhidas

## Status

**Aceito**

## Contexto

O cenário acadêmico determina que sejam utilizadas pelo menos duas tecnologias entre:

* gRPC;
* SSE;
* WebSocket;
* Redis Pub/Sub;
* AMQP.

## Decisão

Foram escolhidas três tecnologias:

```text
WebSocket
Redis Pub/Sub
gRPC
```

## WebSocket

Responsável pela comunicação em tempo real entre backend e clientes.

```text
Backend ──WebSocket──► Cliente
```

## Redis Pub/Sub

Responsável pela comunicação e sincronização de eventos entre diferentes réplicas do backend.

```text
Backend 1 ──► Redis ──► Backend 2
```

## gRPC

Responsável pela comunicação entre o backend e o serviço pós-leilão.

```text
Backend ──gRPC──► Post-Auction Service
```

## AMQP/RabbitMQ

Não foi adotado.

O projeto utiliza Redis Pub/Sub para a comunicação distribuída necessária entre as instâncias.

## SSE

Não foi adotado.

O WebSocket atende ao requisito de comunicação bidirecional em tempo real necessário para o cenário.

---

# ADR-022 — Decisões descartadas

## Status

**Aceito**

Este ADR registra tecnologias ou abordagens consideradas durante o desenvolvimento e que não fazem parte da arquitetura atual.

---

## RabbitMQ / AMQP

### Motivo da não adoção

RabbitMQ seria uma alternativa para comunicação assíncrona entre componentes.

Entretanto, o projeto já utiliza Redis Pub/Sub para comunicação distribuída entre réplicas e gRPC para comunicação com o serviço pós-leilão.

Adicionar RabbitMQ aumentaria a quantidade de componentes sem uma necessidade adicional definida para o cenário atual.

---

## SSE

### Motivo da não adoção

SSE seria adequado para comunicação servidor → cliente.

Entretanto, o sistema de leilões utiliza WebSocket para comunicação em tempo real e necessita de uma comunicação mais flexível entre cliente e servidor.

Por isso, WebSocket foi escolhido.

---

## Polling

### Motivo da não adoção

Polling exigiria que os clientes realizassem requisições repetidamente para verificar se houve um novo lance.

Exemplo:

```text
Cliente ──► GET /bids
Cliente ──► GET /bids
Cliente ──► GET /bids
Cliente ──► GET /bids
...
```

Isso gera requisições desnecessárias e não representa adequadamente a necessidade de atualização praticamente instantânea.

Por isso, foi adotado WebSocket.

---

## Uma única instância do backend

### Motivo da não adoção

Uma única instância não permitiria demonstrar:

* load balancing;
* sincronização entre instâncias;
* escalabilidade horizontal;
* comportamento distribuído.

Por isso, o projeto utiliza inicialmente duas réplicas, podendo chegar a três.

---

## Nginx como Load Balancer

### Motivo da não adoção

Nginx foi considerado inicialmente como possibilidade de load balancing.

Posteriormente, a arquitetura adotou **Traefik**, devido à integração direta com Docker e descoberta dinâmica dos containers.

A decisão atual é:

```text
Traefik
```

como ponto de entrada e distribuição das requisições.

---

# Visão consolidada da arquitetura

As decisões acima resultam na seguinte arquitetura:

```text
                           CLIENTES
                              │
                              │ HTTP / WebSocket
                              ▼
                       ┌─────────────┐
                       │   Traefik   │
                       │ Load Balancer│
                       └──────┬──────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
          ┌─────────────┐           ┌─────────────┐
          │  Backend 1  │           │  Backend 2  │
          │ Node/Express│           │ Node/Express│
          └──────┬──────┘           └──────┬──────┘
                 │                         │
                 └───────────┬─────────────┘
                             │
                             ▼
                       ┌─────────────┐
                       │    Redis    │
                       │  Pub/Sub    │
                       └─────────────┘
                             │
                             │
                             ▼
                       ┌─────────────┐
                       │ PostgreSQL  │
                       └─────────────┘


             Backend
                │
                │ gRPC
                ▼
      ┌───────────────────────┐
      │  Post-Auction Service │
      │        :50051         │
      └───────────────────────┘


                    Docker Engine
                         │
                         ▼
                  ┌─────────────┐
                  │ Autoscaler  │
                  └──────┬──────┘
                         │
                         ▼
              controla réplicas Docker
                         │
                    2 ───┴─── 3
                  backends
```

---

# Resumo das decisões

| Área                              | Decisão                          |
| --------------------------------- | -------------------------------- |
| Arquitetura                       | Clean Architecture               |
| Linguagem                         | TypeScript                       |
| Frontend                          | React + Vite                     |
| Estilização                       | Tailwind CSS + Material UI       |
| Rotas frontend                    | React Router                     |
| Backend                           | Node.js + Express                |
| Banco                             | PostgreSQL                       |
| Cache/mensageria                  | Redis Pub/Sub                    |
| Tempo real                        | WebSocket / Socket.IO            |
| Comunicação entre serviços        | gRPC                             |
| Serviço pós-leilão                | `post-auction-service`           |
| Load Balancer                     | Traefik                          |
| Containerização                   | Docker                           |
| Orquestração local                | Docker Compose                   |
| Backend mínimo                    | 2 réplicas                       |
| Backend máximo                    | 3 réplicas                       |
| Scale up                          | 85%                              |
| Scale down                        | 25%                              |
| Intervalo do autoscaler           | 3 segundos                       |
| Limite por backend                | 1 CPU / 512 MB                   |
| Autenticação                      | JWT                              |
| Simulação                         | TypeScript                       |
| Concorrência dos lances           | `Promise.all`                    |
| Tecnologias acadêmicas escolhidas | WebSocket + Redis Pub/Sub + gRPC |
| RabbitMQ/AMQP                     | Não utilizado                    |
| SSE                               | Não utilizado                    |
| Polling para lances               | Não utilizado                    |
| Nginx                             | Não utilizado                    |
