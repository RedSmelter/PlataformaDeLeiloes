const API_URL = process.env.API_URL ?? 'http://localhost:3000'

export async function placeBid(
  auctionId: string,
  token: string,
  amount: number,
) {
  const response = await fetch(
    `${API_URL}/api/auctions/${auctionId}/bids`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount,
      }),
    },
  )

  const data = await response.json()

  return {
    success: response.ok,
    status: response.status,
    data,
  }
}