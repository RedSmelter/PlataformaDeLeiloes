import { Card, CardContent, CardMedia, Typography, Button, Chip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { isAuctionClosed } from '../../domain/entities/Auction'
import type { Auction } from '../../domain/entities/Auction'

interface AuctionCardProps {
  auction: Auction
  onRequestDelete: (auction: Auction) => void
}

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

function AuctionCard({ auction, onRequestDelete }: AuctionCardProps) {
  const navigate = useNavigate()
  const closed = isAuctionClosed(auction)

  return (
    <Card
      className={`rounded-2xl shadow-md overflow-hidden flex flex-col transition-all ${
        closed ? 'grayscale opacity-70' : ''
      }`}
    >
      <CardMedia
        component="img"
        image={auction.imageUrl}
        alt={auction.title}
        className="h-40 object-cover"
      />

      <CardContent className="flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a3a6b' }}>
            {auction.title}
          </Typography>

          <Chip
            label={closed ? 'Encerrado' : 'Aberto'}
            color={closed ? 'default' : 'success'}
            size="small"
          />
        </div>

        <Chip
          label={auction.category}
          size="small"
          variant="outlined"
          sx={{ alignSelf: 'flex-start' }}
        />

        <Typography variant="body2" color="text.secondary" className="line-clamp-2">
          {auction.description}
        </Typography>

        <div className="mt-auto pt-2">
          {closed ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Lance vencedor
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatCurrency(auction.currentBid)}
              </Typography>
              {auction.winnerName && (
                <Typography variant="caption" color="text.secondary">
                  Vencedor: {auction.winnerName}
                </Typography>
              )}
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                Lance atual
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatCurrency(auction.currentBid)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {auction.bidsCount} lance(s) · encerra em {formatEndsAt(auction.endsAt)}
              </Typography>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            variant="contained"
            fullWidth
            sx={{ textTransform: 'none' }}
            disabled={closed}
            onClick={() => navigate(`/auctions/${auction.id}`)}
          >
            {closed ? 'Leilão encerrado' : 'Ver detalhes'}
          </Button>

          <Button
            variant="outlined"
            color="error"
            sx={{ textTransform: 'none' }}
            onClick={() => onRequestDelete(auction)}
          >
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AuctionCard