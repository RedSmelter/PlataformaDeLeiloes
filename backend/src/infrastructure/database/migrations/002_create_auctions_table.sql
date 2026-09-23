CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  category VARCHAR(30) NOT NULL CHECK (
    category IN ('Eletrônicos', 'Veículos', 'Móveis', 'Instrumentos Musicais', 'Vestuário', 'Esportes', 'Outros')
  ),
  starting_price NUMERIC(12,2) NOT NULL,
  current_price NUMERIC(12,2) NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  winner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auctions_category ON auctions(category);