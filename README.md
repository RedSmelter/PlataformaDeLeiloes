# PlataformaDeLeiloes# Plataforma de Leilões em Tempo Real

Sistema distribuído de leilões em tempo real desenvolvido como projeto acadêmico de Engenharia da Computação.

A aplicação permite que múltiplos usuários participem simultaneamente de leilões, realizando lances que são propagados em tempo real para os participantes. O sistema também possui processamento assíncrono para operações realizadas após o encerramento dos leilões, como registro do vencedor, cobrança e envio de confirmação.

O projeto foi desenvolvido com foco em **Clean Architecture, comunicação em tempo real, mensageria, escalabilidade horizontal e conteinerização**.

---

## 📋 Sumário

* [Sobre o projeto](#sobre-o-projeto)
* [Objetivos](#objetivos)
* [Principais funcionalidades](#principais-funcionalidades)
* [Arquitetura](#arquitetura)
* [Tecnologias](#tecnologias)
* [Comunicação entre componentes](#comunicação-entre-componentes)
* [Clean Architecture](#clean-architecture)
* [Fluxo de um lance](#fluxo-de-um-lance)
* [Encerramento do leilão](#encerramento-do-leilão)
* [Escalabilidade](#escalabilidade)
* [Estrutura do projeto](#estrutura-do-projeto)
* [Execução com Docker](#execução-com-docker)
* [Execução em desenvolvimento](#execução-em-desenvolvimento)
* [Variáveis de ambiente](#variáveis-de-ambiente)
* [Testes de carga](#testes-de-carga)
* [Decisões arquiteturais](#decisões-arquiteturais)
* [Requisitos acadêmicos atendidos](#requisitos-acadêmicos-atendidos)
* [Próximos passos](#próximos-passos)

---

# Sobre o projeto

A **Plataforma de Leilões em Tempo Real** foi desenvolvida para solucionar um cenário no qual diversos usuários precisam acompanhar e participar de um mesmo leilão simultaneamente.

Em um sistema tradicional baseado apenas em requisições HTTP periódicas, cada cliente precisaria consultar repetidamente o servidor para descobrir se houve um novo lance.

Isso gera:

* tráfego HTTP desnecessário;
* aumento da carga no backend;
* maior latência;
* dificuldade para manter todos os usuários sincronizados;
* problemas de escalabilidade quando o número de participantes aumenta.

A solução utiliza comunicação persistente e eventos para que as alterações sejam distribuídas aos usuários praticamente no momento em que acontecem.

---

# Objetivos

O projeto possui os seguintes objetivos principais:

1. Permitir criação e gerenciamento de leilões.
2. Permitir cadastro e autenticação de usuários.
3. Permitir realização de lances.
4. Atualizar os participantes em tempo real.
5. Suportar múltiplos usuários participando do mesmo leilão.
6. Evitar polling constante do frontend.
7. Utilizar processamento assíncrono para operações não críticas ao fluxo imediato do lance.
8. Permitir execução de múltiplas instâncias do backend.
9. Distribuir requisições entre as instâncias.
10. Permitir escalabilidade horizontal.
11. Isolar regras de negócio utilizando Clean Architecture.
12. Executar os componentes através de containers Docker.

---

# Principais funcionalidades

## Autenticação

O sistema possui fluxo de:

* cadastro;
* login;
* autenticação;
* identificação do usuário;
* identificação do nome exibido durante os lances.

---

## Leilões

Cada leilão possui informações como:

* produto;
* descrição;
* preço inicial;
* maior lance atual;
* usuário responsável pelo maior lance;
* data/hora de início;
* data/hora de encerramento;
* estado do leilão.

Estados possíveis:

```text
PENDING
ACTIVE
FINISHED
```

---

## Lances

Durante um leilão ativo, usuários podem realizar lances.

O sistema deve validar:

* usuário autenticado;
* leilão existente;
* leilão ativo;
* valor do lance;
* lance superior ao maior lance atual;
* regras relacionadas ao encerramento.

Quando um lance válido é registrado, os participantes conectados recebem a atualização em tempo real.

---

# Regra dos últimos 10 segundos

Uma das regras importantes do cenário é o comportamento do leilão durante os últimos segundos.

Quando um novo lance é realizado nos últimos 10 segundos, o sistema pode atualizar o temporizador do leilão de acordo com a regra definida pelo domínio.

Essa lógica deve permanecer no **Domain/Application**, e não nos controllers ou componentes de infraestrutura.

Isso permite que a regra continue funcionando independentemente de o sistema utilizar HTTP, WebSocket, testes automatizados ou outro mecanismo de entrada.

---

# Arquitetura

A aplicação segue uma arquitetura distribuída composta por diferentes serviços:

```text
                         ┌──────────────────┐
                         │      Cliente     │
                         │ React + Vite     │
                         └────────┬─────────┘
                                  │
                         HTTP / WebSocket
                                  │
                                  ▼
                         ┌──────────────────┐
                         │      Nginx       │
                         │  Load Balancer   │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
           ┌─────────────────┐        ┌─────────────────┐
           │   Backend #1    │        │   Backend #2    │
           │ Node + Express  │        │ Node + Express  │
           └────────┬────────┘        └────────┬────────┘
                    │                          │
                    └────────────┬─────────────┘
                                 │
                ┌────────────────┼─────────────────┐
                │                │                 │
                ▼                ▼                 ▼
        ┌──────────────┐ ┌──────────────┐ ┌────────────────┐
        │ PostgreSQL   │ │    Redis     │ │   RabbitMQ     │
        │              │ │  Pub/Sub     │ │     AMQP       │
        └──────────────┘ └──────────────┘ └────────────────┘
```

---

# Tecnologias

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Material UI
* React Router

Responsável pela interface do usuário e comunicação com o backend.

---

## Backend

* Node.js
* TypeScript
* Express

Responsável pela API HTTP, regras de aplicação e integração com os componentes externos.

---

## Banco de dados

### PostgreSQL

Responsável pela persistência dos dados principais da aplicação.

Exemplos:

* usuários;
* leilões;
* produtos;
* lances;
* vencedores;
* transações.

---

## Redis

Utilizado principalmente para **Pub/Sub**.

O Redis permite distribuir eventos entre diferentes instâncias do backend.

Exemplo:

```text
Backend #1
   │
   │ novo lance
   ▼
 Redis Pub/Sub
   │
   ├──────────────► Backend #2
   │
   └──────────────► Backend #3
```

Isso é importante porque um usuário conectado ao Backend #2 precisa receber um evento mesmo quando o lance foi processado inicialmente pelo Backend #1.

---

## WebSocket

O WebSocket mantém uma conexão persistente entre frontend e backend.

É utilizado para:

* atualização dos lances;
* atualização do maior lance;
* atualização do temporizador;
* eventos de encerramento;
* notificações relacionadas ao leilão.

A principal vantagem é evitar que o frontend tenha que fazer polling constantemente.

---

## RabbitMQ / AMQP

RabbitMQ é utilizado para processamento assíncrono.

Operações que não precisam bloquear o fluxo principal podem ser enviadas para uma fila.

Exemplo:

```text
Leilão encerrado
       │
       ▼
 RabbitMQ
       │
       ├──► Serviço de pagamento
       │
       ├──► Serviço de e-mail
       │
       └──► Serviço de nota/invoice
```

Caso um serviço externo esteja temporariamente indisponível, a mensagem permanece na fila para processamento posterior.

---

## Nginx

O Nginx funciona como ponto de entrada da aplicação e load balancer.

Exemplo:

```text
                    Nginx
                      │
             ┌────────┴────────┐
             ▼                 ▼
        Backend #1         Backend #2
```

Isso permite distribuir requisições entre diferentes instâncias do backend.

---

## Docker

Cada componente pode ser executado isoladamente em containers.

Exemplo:

```text
frontend
backend-1
backend-2
nginx
postgres
redis
rabbitmq
```

O objetivo é tornar o ambiente reproduzível e facilitar a execução do sistema completo.

---

# Comunicação entre componentes

O projeto utiliza diferentes mecanismos de comunicação para resolver problemas diferentes.

| Tecnologia      | Função                                 |
| --------------- | -------------------------------------- |
| HTTP            | Comunicação tradicional cliente/API    |
| WebSocket       | Comunicação em tempo real              |
| Redis Pub/Sub   | Distribuição de eventos entre backends |
| RabbitMQ / AMQP | Processamento assíncrono               |
| PostgreSQL      | Persistência                           |
| Nginx           | Load balancing                         |

As três tecnologias de comunicação distribuída escolhidas para atender ao cenário são:

### WebSocket

Responsável pela comunicação em tempo real com os clientes.

### Redis Pub/Sub

Responsável por sincronizar eventos entre múltiplas instâncias do backend.

### AMQP / RabbitMQ

Responsável pelo processamento assíncrono de tarefas.

---

# Fluxo de um lance

Um lance segue aproximadamente o seguinte fluxo:

```text
Usuário
   │
   │ WebSocket
   ▼
Nginx
   │
   ▼
Backend #1
   │
   ├──► valida usuário
   │
   ├──► valida leilão
   │
   ├──► valida valor
   │
   ├──► executa regra de negócio
   │
   └──► persiste lance
          │
          ▼
      PostgreSQL
          │
          ▼
      Redis Pub/Sub
          │
       ┌──┴──┐
       ▼     ▼
 Backend #1 Backend #2
       │     │
       └──┬──┘
          ▼
      WebSocket
          │
          ▼
       Clientes
```

Dessa forma, todos os usuários conectados podem receber a atualização.

---

# Encerramento do leilão

Quando o temporizador chega ao fim:

```text
Timer termina
     │
     ▼
Leilão encerrado
     │
     ├──► define vencedor
     │
     ├──► registra resultado
     │
     └──► publica evento
              │
              ▼
          RabbitMQ
              │
       ┌──────┼───────┐
       ▼      ▼       ▼
   Pagamento E-mail  Invoice
```

O processamento posterior não precisa bloquear a finalização do leilão.

Por exemplo, se o serviço de cartão estiver temporariamente indisponível:

```text
RabbitMQ
   │
   ▼
Pagamento
   │
   X
 indisponível
   │
   ▼
mensagem permanece na fila
   │
   ▼
processamento posterior
```

Isso aumenta a tolerância a falhas dos serviços externos.

---

# Clean Architecture

O backend é organizado seguindo os princípios de Clean Architecture.

Estrutura conceitual:

```text
Domain
   │
   ▼
Application
   │
   ▼
Infrastructure
   │
   ▼
Presentation
```

A dependência deve apontar para dentro.

As regras de negócio não devem depender de:

* Express;
* PostgreSQL;
* Redis;
* RabbitMQ;
* WebSocket;
* Docker;
* APIs externas.

---

## Domain

Contém as regras e entidades centrais do sistema.

Exemplo:

```text
domain/
├── entities/
│   ├── User.ts
│   ├── Auction.ts
│   └── Bid.ts
│
├── repositories/
│   ├── UserRepository.ts
│   ├── AuctionRepository.ts
│   └── BidRepository.ts
│
└── errors/
```

---

## Application

Contém os casos de uso.

Exemplo:

```text
application/
└── use-cases/
    ├── auth/
    │   ├── Login.ts
    │   └── Register.ts
    │
    ├── auction/
    │   ├── CreateAuction.ts
    │   └── GetAuctions.ts
    │
    └── bid/
        └── PlaceBid.ts
```

---

## Infrastructure

Implementa as integrações externas.

Exemplo:

```text
infrastructure/
├── database/
│   └── postgres/
│
├── http/
│   └── api/
│
├── redis/
│
├── rabbitmq/
│
└── websocket/
```

---

## Presentation

Responsável pelas interfaces de entrada.

```text
presentation/
├── controllers/
│   ├── http/
│   ├── websocket/
│   └── events/
│
├── routes/
│
└── middlewares/
```

Controllers não devem conter regras de negócio.

Eles recebem a entrada, chamam um caso de uso e retornam a resposta.

---

# Estrutura do projeto

Estrutura geral planejada:

```text
auction-platform/
│
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   └── server.ts
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App/
│   │   │   ├── assets/
│   │   │   ├── pages/
│   │   │   ├── routes/
│   │   │   └── interfaces/
│   │   │
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.yml
│
├── docs/
│   └── adr/
│       ├── 0001-clean-architecture.md
│       ├── 0002-websocket.md
│       ├── 0003-redis-pubsub.md
│       ├── 0004-rabbitmq.md
│       ├── 0005-postgresql.md
│       ├── 0006-docker.md
│       ├── 0007-nginx.md
│       └── 0008-horizontal-scaling.md
│
└── README.md
```

---

# Execução com Docker

Com o Docker instalado:

```bash
docker compose up --build
```

Para executar em segundo plano:

```bash
docker compose up -d --build
```

Ver os containers:

```bash
docker compose ps
```

Ver logs:

```bash
docker compose logs -f
```

Parar:

```bash
docker compose down
```

---

# Execução em desenvolvimento

## Backend

Entrar no diretório:

```bash
cd backend
```

Instalar dependências:

```bash
npm install
```

Executar:

```bash
npm run dev
```

O backend ficará disponível na porta configurada, por padrão:

```text
http://localhost:3000
```

---

## Frontend

Entrar no diretório:

```bash
cd frontend
```

Instalar dependências:

```bash
npm install
```

Executar:

```bash
npm run dev
```

O Vite disponibilizará a aplicação em uma porta local, normalmente:

```text
http://localhost:5173
```

---

# Variáveis de ambiente

Exemplo de configuração:

```env
PORT=3000

DATABASE_URL=postgresql://postgres:postgres@postgres:5432/auction

REDIS_HOST=redis
REDIS_PORT=6379

RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

MIN_REPLICAS=2
MAX_REPLICAS=3

SCALE_UP_THRESHOLD=90
SCALE_DOWN_THRESHOLD=30
```

Valores sensíveis, como senhas e credenciais de serviços externos, não devem ser versionados.

---

# Escalabilidade

O backend foi projetado para permitir múltiplas instâncias.

Inicialmente:

```text
Backend #1
Backend #2
```

Caso a utilização ultrapasse determinado limite, uma terceira instância pode ser criada:

```text
Backend #1
Backend #2
Backend #3
```

A quantidade de réplicas pode ser controlada através de variáveis de ambiente:

```env
MIN_REPLICAS=2
MAX_REPLICAS=3
SCALE_UP_THRESHOLD=90
SCALE_DOWN_THRESHOLD=30
```

O monitoramento avalia a utilização das instâncias e pode solicitar a criação ou remoção de réplicas.

É importante observar que a "capacidade" da instância não é uma capacidade fixa própria do container. Ela é determinada principalmente pelos recursos disponíveis no host e pelos limites de CPU/memória configurados para o container.

---

# Por que Redis é necessário com múltiplos backends?

Considere:

```text
Usuário A
   │
   ▼
Backend #1
```

e:

```text
Usuário B
   │
   ▼
Backend #2
```

Se A realizar um lance no Backend #1, apenas o Backend #1 teria conhecimento imediato desse evento.

Com Redis Pub/Sub:

```text
Backend #1
    │
    ▼
 Redis
    │
    └─────────────┐
                  │
                  ▼
             Backend #2
```

O evento pode chegar a todas as instâncias.

Assim, cada backend consegue enviar a atualização aos WebSockets conectados a ele.

---

# Testes de carga

O projeto também pode possuir um script para simular vários usuários.

Exemplo conceitual:

```text
200 usuários
     │
     ├──► Leilão A
     ├──► Leilão B
     ├──► Leilão C
     └──► Leilão D
```

O objetivo é observar:

* quantidade de conexões simultâneas;
* quantidade de lances;
* latência;
* utilização de CPU;
* utilização de memória;
* comportamento do Redis;
* comportamento do RabbitMQ;
* distribuição entre réplicas;
* comportamento do Nginx;
* escalabilidade do backend.

---

# Requisitos acadêmicos atendidos

O cenário exige a utilização de pelo menos duas tecnologias entre:

* gRPC;
* SSE;
* WebSocket;
* Redis Pub/Sub;
* AMQP.

O projeto utiliza três:

| Tecnologia    | Utilização                            |
| ------------- | ------------------------------------- |
| WebSocket     | Atualizações de leilões em tempo real |
| Redis Pub/Sub | Sincronização entre instâncias        |
| AMQP/RabbitMQ | Processamento assíncrono              |

Essa separação permite utilizar cada tecnologia em um problema diferente.

---

# Segurança

Alguns pontos considerados:

* autenticação dos usuários;
* validação dos dados recebidos;
* proteção das credenciais por variáveis de ambiente;
* isolamento dos containers;
* validação de lances no backend;
* regras de negócio independentes da interface;
* não confiar no valor enviado pelo frontend;
* controle de acesso às operações administrativas.

O frontend é considerado um cliente não confiável. Toda regra importante deve ser validada no backend.

---

# Princípios do projeto

O projeto busca seguir:

* Clean Architecture;
* Separation of Concerns;
* SOLID;
* Dependency Inversion;
* Stateless HTTP;
* comunicação orientada a eventos;
* processamento assíncrono;
* escalabilidade horizontal;
* baixo acoplamento;
* responsabilidade única.

---

# Decisões arquiteturais

As principais decisões do projeto estão documentadas em:

```text
docs/adr/
```

Os ADRs registram:

* problema;
* contexto;
* alternativas;
* decisão;
* consequências.

Isso permite compreender não apenas **como** o sistema foi construído, mas também **por que** determinadas tecnologias e padrões foram escolhidos.

---

# Próximos passos

Possíveis evoluções:

* implementação completa da autenticação;
* persistência dos usuários;
* persistência dos leilões;
* implementação dos lances;
* WebSocket;
* Redis Pub/Sub;
* RabbitMQ;
* processamento de pagamento;
* envio de e-mail;
* geração de invoice;
* Nginx;
* múltiplas réplicas;
* monitoramento;
* testes automatizados;
* testes de carga;
* observabilidade;
* métricas de CPU/memória;
* deployment em servidor remoto/cloud.

---

# Autores

Projeto desenvolvido para fins acadêmicos no curso de **Engenharia da Computação**.

**Projeto:** Plataforma de Leilões em Tempo Real

**Stack principal:**

```text
TypeScript
React
Node.js
Express
PostgreSQL
Redis
RabbitMQ
WebSocket
Nginx
Docker
```
