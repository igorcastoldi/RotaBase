-- ============================================================
-- ROTABASE — Schema SQL Completo para Supabase
-- Inclui: Tabelas, Row Level Security (RLS), Funções e Triggers
-- Ordem de execução: rode este arquivo por completo no SQL Editor do Supabase.
-- ============================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Busca por texto

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'empresa', 'guia', 'cliente');
CREATE TYPE vehicle_type AS ENUM ('quadriciclo', 'utv', 'jeep_4x4', 'buggy', 'outro');
CREATE TYPE booking_status AS ENUM ('pendente', 'confirmada', 'cancelada', 'concluida', 'no_show');
CREATE TYPE payment_policy AS ENUM ('sinal', 'integral');
CREATE TYPE payment_status AS ENUM ('aguardando', 'pago', 'estornado', 'falhou');
CREATE TYPE payment_method AS ENUM ('pix', 'cartao_credito', 'cartao_debito');
CREATE TYPE waiver_status AS ENUM ('pendente', 'assinado', 'recusado');
CREATE TYPE whatsapp_status AS ENUM ('enviado', 'falhou', 'pendente');
CREATE TYPE whatsapp_recipient_type AS ENUM ('cliente', 'proprietario', 'guia');

-- ============================================================
-- TABELA: users (Estende auth.users do Supabase)
-- ============================================================

CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          user_role NOT NULL DEFAULT 'cliente',
  full_name     TEXT NOT NULL,
  phone         TEXT,                          -- Usado para WhatsApp
  cpf           TEXT UNIQUE,                   -- Para o Termo de Responsabilidade
  rg            TEXT,
  avatar_url    TEXT,
  agency_id     UUID,                          -- FK para agencies (preenchido para EMPRESA e GUIA)
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  push_token    TEXT,                          -- Para notificações PWA/Push do Guia
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: agencies (Empresa parceira / Agência)
-- ============================================================

CREATE TABLE public.agencies (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                  TEXT NOT NULL UNIQUE,  -- Ex: "alem-das-dunas"
  name                  TEXT NOT NULL,
  description           TEXT,                  -- História da empresa
  local_curiosities     TEXT,                  -- Curiosidades locais sobre a região
  logo_url              TEXT,
  banner_url            TEXT,

  -- Sede / Ponto de Partida
  hq_name               TEXT,                  -- Ex: "Sede Além das Dunas"
  hq_address            TEXT,
  hq_lat                NUMERIC(10, 7),
  hq_lng                NUMERIC(10, 7),
  hq_google_maps_url    TEXT,
  hq_waze_url           TEXT,
  hq_whatsapp_number    TEXT,                  -- Número do proprietário para notificações

  -- Configurações de Pagamento
  payment_policy        payment_policy NOT NULL DEFAULT 'integral',
  deposit_type          TEXT CHECK (deposit_type IN ('percentual', 'valor_fixo')),
  deposit_value         NUMERIC(10, 2),        -- % ou valor fixo conforme deposit_type

  -- Configurações de WhatsApp
  whatsapp_api_provider TEXT CHECK (whatsapp_api_provider IN ('evolution', 'zapi', 'none')) DEFAULT 'none',
  whatsapp_api_url      TEXT,
  whatsapp_api_key      TEXT,                  -- Armazenado encriptado (Supabase Vault)
  whatsapp_instance     TEXT,                  -- Nome da instância (Evolution API)
  notify_guide          BOOLEAN NOT NULL DEFAULT FALSE,

  -- Configurações de Pagamento Gateway
  payment_gateway       TEXT CHECK (payment_gateway IN ('mercado_pago', 'asaas', 'none')) DEFAULT 'none',
  gateway_public_key    TEXT,
  gateway_secret_key    TEXT,                  -- Armazenado encriptado (Supabase Vault)
  gateway_pix_key       TEXT,

  -- Galeria de Fotos da Frota
  fleet_gallery_urls    TEXT[] DEFAULT '{}',

  avg_rating            NUMERIC(3, 2) DEFAULT 0.0,  -- Calculado via trigger
  total_reviews         INTEGER DEFAULT 0,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FK de users para agencies
ALTER TABLE public.users
  ADD CONSTRAINT fk_users_agency
  FOREIGN KEY (agency_id) REFERENCES public.agencies(id) ON DELETE SET NULL;

-- ============================================================
-- TABELA: agency_amenities (Comodidades da Sede)
-- ============================================================

CREATE TABLE public.agency_amenities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id   UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  icon        TEXT NOT NULL,    -- Nome do ícone (Lucide/Heroicons): "parking", "ice-cream", etc.
  label       TEXT NOT NULL,    -- Ex: "Estacionamento Privativo"
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: vehicles (Frota de Veículos)
-- ============================================================

CREATE TABLE public.vehicles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id       UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  type            vehicle_type NOT NULL,
  model           TEXT NOT NULL,          -- Ex: "Yamaha Grizzly 700"
  license_plate   TEXT,
  capacity        INTEGER NOT NULL,       -- Pessoas por veículo (ex: 2 para quadriciclo, 4 para UTV)
  photo_url       TEXT,
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_capacity CHECK (capacity >= 1 AND capacity <= 10)
);

-- ============================================================
-- TABELA: tours (Passeios / Produtos)
-- ============================================================

CREATE TABLE public.tours (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id           UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  duration_minutes    INTEGER NOT NULL,          -- Duração em minutos
  price_per_person    NUMERIC(10, 2) NOT NULL,
  max_people          INTEGER NOT NULL,          -- Máximo de pessoas por lote
  cover_image_url     TEXT,
  gallery_urls        TEXT[] DEFAULT '{}',
  included_items      TEXT[] DEFAULT '{}',       -- O que está incluído
  requirements        TEXT[] DEFAULT '{}',       -- Requisitos (ex: CNH, capacete)
  meeting_point       TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de associação Passeio <-> Veículos disponíveis para aquele passeio
CREATE TABLE public.tour_vehicles (
  tour_id     UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  vehicle_id  UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  PRIMARY KEY (tour_id, vehicle_id)
);

-- ============================================================
-- TABELA: tour_schedules (Lotes / Horários dos Passeios)
-- ============================================================

CREATE TABLE public.tour_schedules (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id               UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  agency_id             UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  schedule_date         DATE NOT NULL,
  start_time            TIME NOT NULL,
  end_time              TIME,
  max_people            INTEGER NOT NULL,         -- Capacidade máxima deste lote
  confirmed_people      INTEGER NOT NULL DEFAULT 0,  -- Calculado via trigger
  price_override        NUMERIC(10, 2),           -- Permite preço diferente do tour para este lote
  guide_id              UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes                 TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_confirmed_lte_max CHECK (confirmed_people <= max_people)
);

-- View calculada de disponibilidade de veículos por lote
CREATE VIEW public.schedule_vehicle_availability AS
SELECT
  ts.id AS schedule_id,
  ts.tour_id,
  ts.agency_id,
  ts.schedule_date,
  ts.start_time,
  ts.max_people,
  ts.confirmed_people,
  ts.max_people - ts.confirmed_people AS available_spots,
  v.id AS vehicle_id,
  v.type AS vehicle_type,
  v.model AS vehicle_model,
  v.capacity AS vehicle_capacity,
  -- Veículos comprometidos = ceil(pessoas confirmadas / capacidade do veículo)
  CEIL(ts.confirmed_people::FLOAT / NULLIF(v.capacity, 0)) AS vehicles_used,
  -- Veículos disponíveis deste tipo para este lote
  (SELECT COUNT(*) FROM public.vehicles vv
    WHERE vv.agency_id = ts.agency_id
      AND vv.type = v.type
      AND vv.is_active = TRUE) -
  CEIL(ts.confirmed_people::FLOAT / NULLIF(v.capacity, 0)) AS vehicles_available
FROM public.tour_schedules ts
JOIN public.tours t ON t.id = ts.tour_id
JOIN public.tour_vehicles tv ON tv.tour_id = ts.tour_id
JOIN public.vehicles v ON v.id = tv.vehicle_id
WHERE ts.is_active = TRUE;

-- ============================================================
-- TABELA: bookings (Reservas)
-- ============================================================

CREATE TABLE public.bookings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_ref           TEXT NOT NULL UNIQUE,    -- Código legível (ex: RTB-2024-00001)
  agency_id             UUID NOT NULL REFERENCES public.agencies(id) ON DELETE RESTRICT,
  tour_id               UUID NOT NULL REFERENCES public.tours(id) ON DELETE RESTRICT,
  schedule_id           UUID NOT NULL REFERENCES public.tour_schedules(id) ON DELETE RESTRICT,
  client_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,

  -- Passageiros
  num_people            INTEGER NOT NULL CHECK (num_people >= 1),
  passenger_names       TEXT[] DEFAULT '{}',     -- Nomes dos passageiros adicionais

  -- Financeiro
  price_per_person      NUMERIC(10, 2) NOT NULL,
  total_amount          NUMERIC(10, 2) NOT NULL,
  amount_paid           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_policy        payment_policy NOT NULL,
  deposit_amount        NUMERIC(10, 2),          -- Valor do sinal cobrado (se policy = sinal)

  -- Status
  status                booking_status NOT NULL DEFAULT 'pendente',
  payment_status        payment_status NOT NULL DEFAULT 'aguardando',
  payment_method        payment_method,
  gateway_payment_id    TEXT,                    -- ID da transação no gateway (MP/Asaas)
  gateway_pix_qrcode    TEXT,                    -- QR Code Pix (base64 ou URL)
  gateway_pix_copy_paste TEXT,                   -- Código Pix copia e cola

  -- Check-in
  checked_in_at         TIMESTAMPTZ,
  checked_in_by         UUID REFERENCES public.users(id),

  -- Pós-passeio
  photo_gallery_url     TEXT,                    -- URL do álbum/galeria de fotos do passeio
  video_url             TEXT,

  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_bookings_agency_id ON public.bookings(agency_id);
CREATE INDEX idx_bookings_schedule_id ON public.bookings(schedule_id);
CREATE INDEX idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_booking_ref ON public.bookings(booking_ref);

-- ============================================================
-- TABELA: waivers (Termos de Responsabilidade)
-- ============================================================

CREATE TABLE public.waivers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id        UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  agency_id         UUID NOT NULL REFERENCES public.agencies(id) ON DELETE RESTRICT,

  -- Dados do signatário
  signer_name       TEXT NOT NULL,
  signer_cpf        TEXT NOT NULL,
  signer_rg         TEXT,
  signer_birthdate  DATE,
  signer_phone      TEXT,

  -- Assinatura
  signature_data    TEXT NOT NULL,     -- Assinatura em base64 (canvas drawing)
  signature_ip      TEXT,
  signed_at         TIMESTAMPTZ,

  -- Status e PDF gerado
  status            waiver_status NOT NULL DEFAULT 'pendente',
  waiver_pdf_url    TEXT,             -- URL do PDF gerado (Supabase Storage)
  waiver_template   TEXT,            -- Snapshot do texto do termo assinado

  -- Para passageiros adicionais (um waiver por pessoa)
  is_main_client    BOOLEAN NOT NULL DEFAULT TRUE,
  passenger_index   INTEGER DEFAULT 0,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waivers_booking_id ON public.waivers(booking_id);
CREATE INDEX idx_waivers_client_id ON public.waivers(client_id);

-- ============================================================
-- TABELA: reviews (Avaliações)
-- ============================================================

CREATE TABLE public.reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id     UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  tour_id       UUID REFERENCES public.tours(id) ON DELETE SET NULL,
  booking_id    UUID UNIQUE REFERENCES public.bookings(id) ON DELETE SET NULL,
  client_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,

  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT,
  is_verified   BOOLEAN NOT NULL DEFAULT TRUE,  -- TRUE = cliente fez a reserva
  is_visible    BOOLEAN NOT NULL DEFAULT TRUE,
  agency_reply  TEXT,
  replied_at    TIMESTAMPTZ,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_agency_id ON public.reviews(agency_id);

-- ============================================================
-- TABELA: whatsapp_logs (Log de Disparos WhatsApp)
-- ============================================================

CREATE TABLE public.whatsapp_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id       UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  booking_id      UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  recipient_type  whatsapp_recipient_type NOT NULL,
  recipient_phone TEXT NOT NULL,
  template_name   TEXT NOT NULL,   -- Ex: "booking_confirmation", "new_booking_alert"
  message_body    TEXT NOT NULL,   -- Mensagem enviada
  status          whatsapp_status NOT NULL DEFAULT 'pendente',
  provider        TEXT,            -- 'evolution' ou 'zapi'
  provider_msg_id TEXT,            -- ID da mensagem retornado pelo provider
  error_message   TEXT,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_logs_booking_id ON public.whatsapp_logs(booking_id);
CREATE INDEX idx_whatsapp_logs_agency_id ON public.whatsapp_logs(agency_id);

-- ============================================================
-- TABELA: payment_transactions (Histórico de Transações)
-- ============================================================

CREATE TABLE public.payment_transactions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id          UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
  agency_id           UUID NOT NULL REFERENCES public.agencies(id) ON DELETE RESTRICT,
  gateway             TEXT NOT NULL,              -- 'mercado_pago' ou 'asaas'
  gateway_tx_id       TEXT NOT NULL,
  gateway_status      TEXT NOT NULL,
  amount              NUMERIC(10, 2) NOT NULL,
  payment_method      payment_method NOT NULL,
  pix_qrcode          TEXT,
  pix_copy_paste      TEXT,
  pix_expiration      TIMESTAMPTZ,
  metadata            JSONB DEFAULT '{}',         -- Resposta completa do gateway
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Políticas de Acesso
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_amenities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_vehicles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_schedules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waivers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Funções auxiliares de RLS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.get_my_agency_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT agency_id FROM public.users WHERE id = auth.uid()
$$;

-- ============================================================
-- POLÍTICAS: users
-- ============================================================

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (
    id = auth.uid()
    OR public.get_my_role() = 'super_admin'
    OR (public.get_my_role() IN ('empresa', 'guia') AND agency_id = public.get_my_agency_id())
  );

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid() OR public.get_my_role() = 'super_admin');

CREATE POLICY "users_insert_super_admin" ON public.users
  FOR INSERT WITH CHECK (public.get_my_role() = 'super_admin');

-- ============================================================
-- POLÍTICAS: agencies
-- ============================================================

CREATE POLICY "agencies_select_public" ON public.agencies
  FOR SELECT USING (is_active = TRUE OR public.get_my_role() = 'super_admin');

CREATE POLICY "agencies_update_own" ON public.agencies
  FOR UPDATE USING (
    id = public.get_my_agency_id() AND public.get_my_role() = 'empresa'
    OR public.get_my_role() = 'super_admin'
  );

CREATE POLICY "agencies_insert_super_admin" ON public.agencies
  FOR INSERT WITH CHECK (public.get_my_role() = 'super_admin');

-- ============================================================
-- POLÍTICAS: agency_amenities, vehicles, tours, tour_schedules
-- ============================================================

CREATE POLICY "amenities_select_public" ON public.agency_amenities
  FOR SELECT USING (is_active = TRUE OR public.get_my_role() = 'super_admin');

CREATE POLICY "vehicles_select_public" ON public.vehicles
  FOR SELECT USING (is_active = TRUE OR public.get_my_role() IN ('super_admin', 'empresa', 'guia'));

CREATE POLICY "tours_select_public" ON public.tours
  FOR SELECT USING (is_active = TRUE OR public.get_my_role() = 'super_admin');

CREATE POLICY "schedules_select_public" ON public.tour_schedules
  FOR SELECT USING (is_active = TRUE OR public.get_my_role() IN ('super_admin', 'empresa', 'guia'));

CREATE POLICY "amenities_write_empresa" ON public.agency_amenities
  FOR ALL USING (
    agency_id = public.get_my_agency_id() AND public.get_my_role() = 'empresa'
    OR public.get_my_role() = 'super_admin'
  );

CREATE POLICY "vehicles_write_empresa" ON public.vehicles
  FOR ALL USING (
    agency_id = public.get_my_agency_id() AND public.get_my_role() = 'empresa'
    OR public.get_my_role() = 'super_admin'
  );

CREATE POLICY "tours_write_empresa" ON public.tours
  FOR ALL USING (
    agency_id = public.get_my_agency_id() AND public.get_my_role() = 'empresa'
    OR public.get_my_role() = 'super_admin'
  );

CREATE POLICY "schedules_write_empresa" ON public.tour_schedules
  FOR ALL USING (
    agency_id = public.get_my_agency_id() AND public.get_my_role() = 'empresa'
    OR public.get_my_role() = 'super_admin'
  );

-- ============================================================
-- POLÍTICAS: bookings
-- ============================================================

CREATE POLICY "bookings_select" ON public.bookings
  FOR SELECT USING (
    client_id = auth.uid()
    OR agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('empresa', 'guia')
    OR public.get_my_role() = 'super_admin'
  );

CREATE POLICY "bookings_insert_client" ON public.bookings
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "bookings_update_empresa" ON public.bookings
  FOR UPDATE USING (
    agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('empresa', 'guia')
    OR public.get_my_role() = 'super_admin'
    OR client_id = auth.uid() -- cliente pode cancelar
  );

-- ============================================================
-- POLÍTICAS: waivers
-- ============================================================

CREATE POLICY "waivers_select" ON public.waivers
  FOR SELECT USING (
    client_id = auth.uid()
    OR agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('empresa', 'guia')
    OR public.get_my_role() = 'super_admin'
  );

CREATE POLICY "waivers_insert" ON public.waivers
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "waivers_update" ON public.waivers
  FOR UPDATE USING (
    client_id = auth.uid()
    OR agency_id = public.get_my_agency_id() AND public.get_my_role() IN ('empresa', 'guia')
    OR public.get_my_role() = 'super_admin'
  );

-- ============================================================
-- POLÍTICAS: reviews
-- ============================================================

CREATE POLICY "reviews_select_public" ON public.reviews
  FOR SELECT USING (is_visible = TRUE OR public.get_my_role() IN ('super_admin', 'empresa'));

CREATE POLICY "reviews_insert_client" ON public.reviews
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "reviews_update" ON public.reviews
  FOR UPDATE USING (
    client_id = auth.uid()
    OR agency_id = public.get_my_agency_id() AND public.get_my_role() = 'empresa'
    OR public.get_my_role() = 'super_admin'
  );

-- ============================================================
-- FUNÇÕES E TRIGGERS
-- ============================================================

-- TRIGGER: Gerar booking_ref automático
CREATE OR REPLACE FUNCTION public.generate_booking_ref()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  seq_num INTEGER;
  year_str TEXT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num FROM public.bookings
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  NEW.booking_ref := 'RTB-' || year_str || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_booking_ref
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.generate_booking_ref();

-- TRIGGER: Atualizar confirmed_people no lote ao confirmar/cancelar reserva
CREATE OR REPLACE FUNCTION public.update_schedule_confirmed_people()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.tour_schedules
  SET confirmed_people = (
    SELECT COALESCE(SUM(num_people), 0)
    FROM public.bookings
    WHERE schedule_id = COALESCE(NEW.schedule_id, OLD.schedule_id)
      AND status IN ('pendente', 'confirmada')
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.schedule_id, OLD.schedule_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_update_schedule_people
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_schedule_confirmed_people();

-- TRIGGER: Recalcular avg_rating da agência ao inserir/atualizar review
CREATE OR REPLACE FUNCTION public.update_agency_avg_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.agencies
  SET
    avg_rating = (
      SELECT ROUND(AVG(rating)::NUMERIC, 2)
      FROM public.reviews
      WHERE agency_id = COALESCE(NEW.agency_id, OLD.agency_id)
        AND is_visible = TRUE
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE agency_id = COALESCE(NEW.agency_id, OLD.agency_id)
        AND is_visible = TRUE
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.agency_id, OLD.agency_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_update_agency_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_agency_avg_rating();

-- TRIGGER: updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at     BEFORE UPDATE ON public.users              FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_agencies_updated_at  BEFORE UPDATE ON public.agencies           FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_vehicles_updated_at  BEFORE UPDATE ON public.vehicles           FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tours_updated_at     BEFORE UPDATE ON public.tours              FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_schedules_updated_at BEFORE UPDATE ON public.tour_schedules     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_bookings_updated_at  BEFORE UPDATE ON public.bookings           FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_waivers_updated_at   BEFORE UPDATE ON public.waivers            FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FUNÇÃO: Verificar disponibilidade antes de reservar (chamada pelo app)
CREATE OR REPLACE FUNCTION public.check_schedule_availability(
  p_schedule_id UUID,
  p_num_people  INTEGER
) RETURNS TABLE (
  available        BOOLEAN,
  spots_remaining  INTEGER,
  reason           TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_max_people      INTEGER;
  v_confirmed       INTEGER;
  v_spots_remaining INTEGER;
BEGIN
  SELECT max_people, confirmed_people
  INTO v_max_people, v_confirmed
  FROM public.tour_schedules
  WHERE id = p_schedule_id AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'Lote não encontrado ou inativo';
    RETURN;
  END IF;

  v_spots_remaining := v_max_people - v_confirmed;

  IF v_spots_remaining < p_num_people THEN
    RETURN QUERY SELECT FALSE, v_spots_remaining,
      'Apenas ' || v_spots_remaining || ' vagas disponíveis neste horário';
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, v_spots_remaining, 'Disponível';
END;
$$;

-- FUNÇÃO/TRIGGER: Criar registro em public.users ao criar auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'cliente')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
