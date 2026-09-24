export interface IssueInvoiceInput {
  winnerId: string
  auctionTitle: string
  finalPrice: number
}

export async function issueInvoice(input: IssueInvoiceInput): Promise<void> {
  await delay(300)
  const invoiceId = crypto.randomUUID()
  console.log(
    `[nota-fiscal] Nota ${invoiceId} emitida para ${input.winnerId} — "${input.auctionTitle}" — R$ ${input.finalPrice.toFixed(2)}`
  )
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}