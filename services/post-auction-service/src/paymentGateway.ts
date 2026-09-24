export interface ChargeCardInput {
  winnerId: string
  amount: number
}

// Simula uma API de pagamento instável — ~30% de chance de falha por tentativa.
export async function chargeCard(input: ChargeCardInput): Promise<void> {
  await delay(500)

  const success = Math.random() > 0.3

  if (!success) {
    throw new Error(`Falha ao cobrar cartão do usuário ${input.winnerId} (R$ ${input.amount})`)
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}