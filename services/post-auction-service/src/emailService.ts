export interface SendConfirmationEmailInput {
  winnerUsername: string
  auctionTitle: string
  finalPrice: number
}

export async function sendConfirmationEmail(input: SendConfirmationEmailInput): Promise<void> {
  await delay(200)
  console.log(
    `[email] Confirmação enviada para ${input.winnerUsername}: você venceu "${input.auctionTitle}" por R$ ${input.finalPrice.toFixed(2)}`
  )
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}