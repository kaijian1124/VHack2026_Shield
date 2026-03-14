-- =============================================================
-- ScamShield — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- Call Logs (NO transcript, NO audio — metadata only)
CREATE TABLE IF NOT EXISTS call_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  caller_number text,                        -- masked/hashed, e.g. ***1234
  call_start    timestamptz,
  call_end      timestamptz,
  overall_score integer CHECK (overall_score BETWEEN 0 AND 100),
  risk_level    text CHECK (risk_level IN ('low', 'medium', 'high')),
  patterns      jsonb DEFAULT '[]',          -- [{"id":"P001","score":40}, ...]
  language      text DEFAULT 'en',           -- detected language
  device_model  text,
  app_version   text,
  uploaded      boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- Row Level Security: users can only see their own logs
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own logs"
  ON call_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own logs"
  ON call_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Aggregate stats view (for admin dashboard, no PII)
CREATE VIEW aggregate_stats AS
SELECT
  DATE_TRUNC('day', created_at) AS day,
  risk_level,
  COUNT(*)                       AS total_calls,
  AVG(overall_score)             AS avg_score,
  language
FROM call_logs
GROUP BY 1, 2, 5
ORDER BY 1 DESC;

-- Pattern DB (updatable by admin)
CREATE TABLE IF NOT EXISTS pattern_db (
  id          text PRIMARY KEY,   -- P001, P002, ...
  name        text NOT NULL,
  weight      integer DEFAULT 20,
  description text,
  keywords_en text[],
  keywords_ms text[],
  keywords_zh text[],
  version     integer DEFAULT 1,
  active      boolean DEFAULT true,
  updated_at  timestamptz DEFAULT now()
);

-- Anyone can read patterns (not sensitive)
ALTER TABLE pattern_db ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read patterns"
  ON pattern_db FOR SELECT
  USING (true);

-- =============================================================
-- Seed initial Pattern DB
-- =============================================================
INSERT INTO pattern_db VALUES
('P001','police_impersonation',40,'Impersonates law enforcement',
 ARRAY['police','officer','authority','government','investigation','warrant'],
 ARRAY['polis','pegawai','kerajaan','siasatan','berwajib','waran'],
 ARRAY['警察','警方','公安','政府','调查','逮捕'],
 1, true, now()),
('P002','urgent_transfer',35,'Pressures for immediate money transfer',
 ARRAY['transfer','send money','bank account','immediately','urgent','payment'],
 ARRAY['pindah','hantar wang','akaun bank','segera','mendesak','bayaran'],
 ARRAY['转账','汇款','银行账户','立刻','紧急','付款'],
 1, true, now()),
('P003','threat_arrest',30,'Threatens arrest or legal action',
 ARRAY['arrest','jail','prison','lawsuit','charge','criminal'],
 ARRAY['tangkap','penjara','saman','mahkamah','tuduhan','jenayah'],
 ARRAY['逮捕','坐牢','监狱','起诉','法庭','犯罪'],
 1, true, now()),
('P004','parcel_scam',20,'Parcel or delivery extortion',
 ARRAY['parcel','package','delivery','customs','fee','clearance'],
 ARRAY['bungkusan','pakej','penghantaran','kastam','bayaran','cukai'],
 ARRAY['包裹','快递','海关','费用','清关','运费'],
 1, true, now()),
('P005','money_laundering',35,'Accuses of money laundering',
 ARRAY['money laundering','fraud','suspicious','illegal activity','frozen'],
 ARRAY['pengubahan wang haram','penipuan','mencurigakan','beku','rampas'],
 ARRAY['洗钱','欺诈','可疑','非法','冻结','没收'],
 1, true, now()),
('P006','secrecy_pressure',25,'Instructs victim to keep call secret',
 ARRAY['don''t tell','keep secret','confidential','nobody knows','private'],
 ARRAY['jangan beritahu','rahsia','sulit','antara kita'],
 ARRAY['不要告诉','保密','机密','不能说出去'],
 1, true, now());
