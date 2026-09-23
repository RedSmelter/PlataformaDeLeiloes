export class AuctionNotFoundError extends Error {
  constructor() {
    super('Leilão não encontrado')
  }
}

export class AuctionClosedError extends Error {
  constructor() {
    super('Este leilão já está encerrado')
  }
}

export class BidTooLowError extends Error {
  constructor() {
    super('O lance deve ser maior que o lance atual')
  }
}