import { chargeCard } from './paymentGateway.js'
import { sendConfirmationEmail } from './emailService.js'
import { issueInvoice } from './invoiceService.js'

export interface AuctionClosedInput {
  auctionId: string
  auctionTitle: string
  winnerId: string
  winnerUsername: string
  finalPrice: number
}

const MAX_ATTEMPTS = 3
const BASE_DELAY_MS = 1000

export async function processAuctionClosed(input: AuctionClosedInput): Promise<void> {
  const charged = await chargeWithRetry(input)

  if (!charged) {
    console.error(
      `[pos-leilao] Cobrança falhou definitivamente para o leilão ${input.auctionId} após ${MAX_ATTEMPTS} tentativas`
    )
    return
  }

  await sendConfirmationEmail({
    winnerUsername: input.winnerUsername,
    auctionTitle: input.auctionTitle,
    finalPrice: input.finalPrice,
  })

  await issueInvoice({
    winnerId: input.winnerId,
    auctionTitle: input.auctionTitle,
    finalPrice: input.finalPrice,
  })
}

async function chargeWithRetry(input: AuctionClosedInput): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await chargeCard({ winnerId: input.winnerId, amount: input.finalPrice })
      console.log(`[pos-leilao] Cobrança bem-sucedida (tentativa ${attempt}) — leilão ${input.auctionId}`)
      return true
    } catch {
      console.warn(`[pos-leilao] Tentativa ${attempt} de cobrança falhou — leilão ${input.auctionId}`)

      if (attempt < MAX_ATTEMPTS) {
        await delay(BASE_DELAY_MS * 2 ** (attempt - 1))
      }
    }
  }

  return false
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}