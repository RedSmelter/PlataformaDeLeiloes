CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES auctions(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);