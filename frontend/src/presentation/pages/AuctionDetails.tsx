import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material'
import { initialAuctions, initialBids } from '../mocks/mocksAuctions'
import BidList from '../components/BidList'
import { isAuctionClosed } from '../../domain/entities/Auction'
import type { Bid } from '../../domain/entities/Bid'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatEndsAt(date: Date) {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AuctionDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const auction = initialAuctions.find((item) => item.id === id)

  const [bids, setBids] = useState<Bid[]>(
    initialBids.filter((bid) => bid.auctionId === id)
  )
  const [currentBid, setCurrentBid] = useState(auction?.currentBid ?? 0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [bidAmount, setBidAmount] = useState('')

  // Reavaliação periódica, igual em Auctions.tsx, para o leilão fechar
  // sozinho na tela caso o prazo vença com a página aberta.
  const [, forceRerender] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => forceRerender((n) => n + 1), 15000)
    return () => clearInterval(interval)
  }, [])

  if (!auction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Typography variant="h6">Leilão não encontrado.</Typography>
        <Button variant="contained" onClick={() => navigate('/auctions')}>
          Voltar para leilões
        </Button>
      </div>
    )
  }

  const closed = isAuctionClosed(auction)
  const latestBid = [...bids].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )[0]
  const winnerName = latestBid?.userName ?? auction.winnerName

  function handleOpenDialog() {
    setBidAmount('')
    setIsDialogOpen(true)
  }

  function handlePlaceBid() {
    const amount = Number(bidAmount)
    if (!amount || amount <= currentBid) return

    const newBid: Bid = {
      id: crypto.randomUUID(),
      auctionId: id!,
      userName: 'Você',
      amount,
      createdAt: new Date(),
    }

    setBids((prev) => [newBid, ...prev])
    setCurrentBid(amount)
    setIsDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center">
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none', fontWeight: 600, color: '#1a3a6b' }}
          onClick={() => navigate('/auctions')}
        >
          Voltar
        </Button>
      </header>

      <main className="px-6 py-8 max-w-3xl mx-auto flex flex-col gap-6">
        <div
          className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all ${
            closed ? 'grayscale opacity-80' : ''
          }`}
        >
          <img
            src={auction.imageUrl}
            alt={auction.title}
            className="w-full h-64 object-cover"
          />

          <div className="p-6 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a3a6b' }}>
                {auction.title}
              </Typography>

              <Chip
                label={closed ? 'Encerrado' : 'Aberto'}
                color={closed ? 'default' : 'success'}
              />
            </div>

            <Chip
              label={auction.category}
              size="small"
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            />

            <Typography variant="body1" color="text.secondary">
              {auction.description}
            </Typography>

            <Divider className="my-2" />

            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" color="text.secondary">
                  {closed ? 'Lance vencedor' : 'Lance atual'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatCurrency(currentBid)}
                </Typography>

                {closed ? (
                  winnerName && (
                    <Typography variant="caption" color="text.secondary">
                      Vencedor: {winnerName}
                    </Typography>
                  )
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    {bids.length} lance(s) · encerra em {formatEndsAt(auction.endsAt)}
                  </Typography>
                )}
              </div>

              <Button
                variant="contained"
                size="large"
                sx={{ textTransform: 'none', fontWeight: 600 }}
                disabled={closed}
                onClick={handleOpenDialog}
              >
                {closed ? 'Encerrado' : 'Dar lance'}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1a3a6b' }}>
            Lances
          </Typography>

          <BidList bids={bids} />
        </div>
      </main>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: '#1a3a6b' }}>
          Dar lance
        </DialogTitle>

        <DialogContent className="flex flex-col gap-2 pt-2">
          <Typography variant="body2" color="text.secondary">
            Lance atual: {formatCurrency(currentBid)}
          </Typography>

          <TextField
            label="Seu lance (R$)"
            type="number"
            fullWidth
            autoFocus
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            sx={{ textTransform: 'none' }}
            onClick={handlePlaceBid}
          >
            Confirmar lance
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default AuctionDetails