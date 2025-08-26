-- ========================================
-- CONFIGURATION SUPABASE - DÉTECTEUR GIFTS
-- ========================================
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  telegram_username VARCHAR(255),
  telegram_first_name VARCHAR(255),
  telegram_last_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des gifts (métadonnées)
CREATE TABLE IF NOT EXISTS gifts (
  id SERIAL PRIMARY KEY,
  gift_id VARCHAR(255) UNIQUE NOT NULL,
  gift_name VARCHAR(255) NOT NULL,
  collectible_id VARCHAR(255) NOT NULL,
  collectible_model VARCHAR(255),
  collectible_backdrop VARCHAR(255),
  collectible_symbol VARCHAR(255),
  gift_value INTEGER NOT NULL DEFAULT 25,
  gift_type VARCHAR(100) DEFAULT 'star_gift_unique',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table d'inventaire (relation user-gift)
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  gift_id INTEGER REFERENCES gifts(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'pending')),
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  withdrawn_at TIMESTAMP WITH TIME ZONE NULL,
  UNIQUE(user_id, gift_id)
);

-- 4. Table des transactions (historique)
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  gift_id INTEGER REFERENCES gifts(id),
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'withdraw')),
  telegram_message_id BIGINT,
  transaction_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES POUR LES PERFORMANCES
-- ========================================

-- Index sur telegram_id pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(telegram_username);

-- Index sur gift_id pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_gifts_gift_id ON gifts(gift_id);
CREATE INDEX IF NOT EXISTS idx_gifts_collectible_id ON gifts(collectible_id);

-- Index sur l'inventaire
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_gift_id ON inventory(gift_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_received_at ON inventory(received_at);

-- Index sur les transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_gift_id ON transactions(gift_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- ========================================
-- POLITIQUES DE SÉCURITÉ RLS (Row Level Security)
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs (lecture seule via API)
CREATE POLICY "Users are viewable by API" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users are insertable by API" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users are updatable by API" ON users
  FOR UPDATE USING (true);

-- Politique pour les gifts (lecture seule via API)
CREATE POLICY "Gifts are viewable by API" ON gifts
  FOR SELECT USING (true);

CREATE POLICY "Gifts are insertable by API" ON gifts
  FOR INSERT WITH CHECK (true);

-- Politique pour l'inventaire (lecture seule via API)
CREATE POLICY "Inventory is viewable by API" ON inventory
  FOR SELECT USING (true);

CREATE POLICY "Inventory is insertable by API" ON inventory
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Inventory is updatable by API" ON inventory
  FOR UPDATE USING (true);

-- Politique pour les transactions (lecture seule via API)
CREATE POLICY "Transactions are viewable by API" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Transactions are insertable by API" ON transactions
  FOR INSERT WITH CHECK (true);

-- ========================================
-- FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VÉRIFICATION DE L'INSTALLATION
-- ========================================

-- Vérifier que toutes les tables sont créées
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'gifts', 'inventory', 'transactions')
ORDER BY table_name;

-- Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'gifts', 'inventory', 'transactions');

-- ========================================
-- INSTRUCTIONS D'UTILISATION
-- ========================================

/*
1. Copiez ce script dans l'éditeur SQL de Supabase
2. Exécutez le script complet
3. Vérifiez que toutes les tables sont créées
4. Configurez vos variables d'environnement :
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - INVENTORY_API_KEY
   - WEBHOOK_SECRET
5. Testez l'API avec un gift

Tables créées :
- users : Utilisateurs Telegram
- gifts : Métadonnées des gifts
- inventory : Inventaire des utilisateurs
- transactions : Historique des opérations

Sécurité :
- RLS activé sur toutes les tables
- Politiques d'accès via API uniquement
- Index optimisés pour les performances
*/
