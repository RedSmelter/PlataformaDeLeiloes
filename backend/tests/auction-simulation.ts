import Docker from 'dockerode'
import { createTestUser } from './createUser.js'
import { placeBid } from './placeBid.js'

const docker = new Docker()

const API_URL = process.env.API_URL ?? 'http://localhost:3000'

const usersArgument = process.argv.find((arg) =>
  arg.startsWith('--users='),
)

const NUMBER_OF_USERS = usersArgument
  ? Number(usersArgument.split('=')[1])
  : 10

if (!Number.isInteger(NUMBER_OF_USERS) || NUMBER_OF_USERS < 1) {
  throw new Error(
    'O número de usuários deve ser um inteiro maior que 0. Exemplo: --users=10',
  )
}

// --------------------------------------------------
// Configurações da simulação
// --------------------------------------------------

const AUCTION_DURATION_MS = 60 * 1000

const MIN_DELAY_BETWEEN_BIDS_MS = 500
const MAX_DELAY_BETWEEN_BIDS_MS = 2000

// --------------------------------------------------
// Funções auxiliares
// --------------------------------------------------

function randomBid(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRandomBid(currentBid: number): number {
  const variation = randomBid(-30, 80)

  return Math.max(1, currentBid + variation)
}

function randomDelay(
  min: number,
  max: number,
): number {
  return randomBid(min, max)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// --------------------------------------------------
// Estado compartilhado da disputa
// --------------------------------------------------

let currentBid = 100

let totalBidAttempts = 0
let totalAcceptedBids = 0
let totalRejectedBids = 0

// --------------------------------------------------
// Simulação de um usuário
// --------------------------------------------------

async function simulateUser(
  user: Awaited<ReturnType<typeof createTestUser>>,
  auctionId: string,
  endsAtTimestamp: number,
) {
  while (Date.now() < endsAtTimestamp) {
    const delay = randomDelay(
      MIN_DELAY_BETWEEN_BIDS_MS,
      MAX_DELAY_BETWEEN_BIDS_MS,
    )

    await sleep(delay)

    // O leilão pode ter terminado durante o sleep.
    if (Date.now() >= endsAtTimestamp) {
      break
    }

    const amount = generateRandomBid(currentBid)

    totalBidAttempts++

    console.log(
      `[${getCurrentTime()}] [LANCE] ${user.username} → R$ ${amount}`,
    )

    try {
      const result = await placeBid(
        auctionId,
        user.token,
        amount,
      )

      if (result.success) {
        const acceptedAmount = Number(
          result.data.amount,
        )

        if (acceptedAmount > currentBid) {
          currentBid = acceptedAmount
        }

        totalAcceptedBids++

        console.log(
          `[${getCurrentTime()}] [✓ ACEITO] ${user.username} → R$ ${acceptedAmount} | Maior lance: R$ ${currentBid}`,
        )
      } else {
        totalRejectedBids++

        console.log(
          `[${getCurrentTime()}] [✗ REJEITADO] ${user.username} → R$ ${amount}`,
        )
      }
    } catch (error) {
      console.error(
        `[${getCurrentTime()}] [ERRO] ${user.username}`,
        error,
      )
    }
  }

  console.log(
    `[${getCurrentTime()}] [FIM] ${user.username} encerrou sua participação`,
  )
}

// --------------------------------------------------
// Programa principal
// --------------------------------------------------

async function main() {
  console.log('========================================')
  console.log('   TESTE AUTOMATIZADO DE LEILÃO')
  console.log('========================================')
  console.log()

  // --------------------------------------------------
  // 1. Verificar Docker
  // --------------------------------------------------

  console.log(
    `[✓] Usuários participantes configurados: ${NUMBER_OF_USERS}`,
  )

  console.log()

  console.log('[✓] Teste iniciado')
  console.log('[✓] Verificando Docker...')

  const containers = await docker.listContainers({
    all: false,
  })

  const backendContainers = containers.filter((container) =>
    container.Names.some((name) =>
      name.includes('backend'),
    ),
  )

  console.log(
    `[✓] Réplicas do backend encontradas: ${backendContainers.length}`,
  )

  for (const container of backendContainers) {
    const name = container.Names[0]?.replace('/', '')

    console.log(`  - ${name}`)
  }

  if (backendContainers.length < 2) {
    throw new Error(
      `É necessário ter pelo menos 2 réplicas do backend. Encontradas: ${backendContainers.length}`,
    )
  }

  console.log(
    '[✓] Existem pelo menos 2 réplicas disponíveis',
  )

  console.log()

  // --------------------------------------------------
  // 2. Criar vendedor
  // --------------------------------------------------

  console.log('[...] Criando vendedor...')

  const seller = await createTestUser('seller')

  console.log(
    `[✓] Vendedor pronto: ${seller.username}`,
  )

  console.log()

  // --------------------------------------------------
  // 3. Criar usuários participantes
  // --------------------------------------------------

  console.log(
    `[...] Criando ${NUMBER_OF_USERS} usuários participantes...`,
  )

  const users: Awaited<
    ReturnType<typeof createTestUser>
  >[] = []

  for (let i = 1; i <= NUMBER_OF_USERS; i++) {
    const user = await createTestUser(
      `bidder-${i}`,
    )

    users.push(user)
  }

  console.log()

  console.log(
    `[✓] ${users.length} usuários participantes criados`,
  )

  console.log()

  // --------------------------------------------------
  // 4. Criar leilão
  // --------------------------------------------------

  console.log('[...] Criando leilão...')

  const endsAt = new Date(
    Date.now() + AUCTION_DURATION_MS,
  )

  const auction = {
    title: 'Leilão Automatizado',
    description:
      'Leilão criado pelo teste automatizado',
    category: 'Outros',
    startingPrice: 100,
    imageUrl: null,
    endsAt: endsAt.toISOString(),
  }

  currentBid = auction.startingPrice

  const auctionResponse = await fetch(
    `${API_URL}/api/auctions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seller.token}`,
      },
      body: JSON.stringify(auction),
    },
  )

  const auctionData = await auctionResponse.json()

  if (!auctionResponse.ok) {
    throw new Error(
      `Falha ao criar leilão: ${JSON.stringify(auctionData)}`,
    )
  }

  console.log('[✓] Leilão criado!')

  console.log(`    ID: ${auctionData.id}`)
  console.log(`    Título: ${auctionData.title}`)
  console.log(
    `    Lance inicial: R$ ${auctionData.startingPrice}`,
  )
  console.log(
    `    Início: ${getCurrentTime()}`,
  )
  console.log(
    `    Encerra em: ${endsAt.toLocaleTimeString(
      'pt-BR',
    )}`,
  )

  console.log()

  // --------------------------------------------------
  // 5. Iniciar disputa simultânea
  // --------------------------------------------------

  console.log(
    '========================================',
  )

  console.log(
    `[${getCurrentTime()}] INICIANDO DISPUTA`,
  )

  console.log(
    `[${getCurrentTime()}] Duração: 60 segundos`,
  )

  console.log(
    `[${getCurrentTime()}] Participantes: ${users.length}`,
  )

  console.log(
    '========================================',
  )

  console.log()

  const endsAtTimestamp = endsAt.getTime()

  const userSimulations = users.map((user) =>
    simulateUser(
      user,
      auctionData.id,
      endsAtTimestamp,
    ),
  )

  // Todos os usuários participam simultaneamente.
  await Promise.all(userSimulations)

  // --------------------------------------------------
  // 6. Leilão encerrado
  // --------------------------------------------------

  console.log()

  console.log(
    '========================================',
  )

  console.log(
    `[${getCurrentTime()}] LEILÃO ENCERRADO`,
  )

  console.log(
    '========================================',
  )

  console.log()

  console.log(
    `Total de tentativas: ${totalBidAttempts}`,
  )

  console.log(
    `Lances aceitos: ${totalAcceptedBids}`,
  )

  console.log(
    `Lances rejeitados: ${totalRejectedBids}`,
  )

  console.log(
    `Maior lance observado: R$ ${currentBid}`,
  )

  console.log()

  // --------------------------------------------------
  // Resultado
  // --------------------------------------------------

  console.log(
    '========================================',
  )

  console.log(
    'ETAPA CONCLUÍDA COM SUCESSO',
  )

  console.log(
    '========================================',
  )

  console.log()

  console.log(
    `Vendedor: ${seller.username}`,
  )

  console.log(
    `Participantes: ${users.length}`,
  )

  console.log(
    `Leilão: ${auctionData.id}`,
  )

  console.log(
    `Maior lance: R$ ${currentBid}`,
  )
}

main().catch((error) => {
  console.error()
  console.error('[✗] TESTE FALHOU')
  console.error(error)

  process.exit(1)
})