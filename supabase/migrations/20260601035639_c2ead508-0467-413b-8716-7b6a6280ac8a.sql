
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS seq bigserial,
  ADD COLUMN IF NOT EXISTS prev_hash text,
  ADD COLUMN IF NOT EXISTS row_hash text;

CREATE OR REPLACE FUNCTION public.audit_logs_hash()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_hash text;
  payload text;
BEGIN
  SELECT row_hash INTO last_hash
    FROM public.audit_logs
    WHERE seq = (SELECT max(seq) FROM public.audit_logs WHERE seq < NEW.seq);
  NEW.prev_hash := COALESCE(last_hash, 'GENESIS');
  payload := concat_ws('|',
    NEW.seq::text, NEW.created_at::text, NEW.action,
    COALESCE(NEW.actor_id::text,''), COALESCE(NEW.actor_email,''),
    COALESCE(NEW.target,''), COALESCE(NEW.details::text,''), NEW.prev_hash);
  NEW.row_hash := encode(digest(payload, 'sha256'), 'hex');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_hash ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_hash
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.audit_logs_hash();

CREATE OR REPLACE FUNCTION public.audit_logs_block_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'audit_logs is append-only'; END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_no_update ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_no_update
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.audit_logs_block_mutation();

-- Backfill existing rows
DO $$
DECLARE r record; last_hash text := 'GENESIS'; payload text;
BEGIN
  ALTER TABLE public.audit_logs DISABLE TRIGGER trg_audit_logs_no_update;
  FOR r IN SELECT * FROM public.audit_logs ORDER BY seq LOOP
    payload := concat_ws('|',
      r.seq::text, r.created_at::text, r.action,
      COALESCE(r.actor_id::text,''), COALESCE(r.actor_email,''),
      COALESCE(r.target,''), COALESCE(r.details::text,''), last_hash);
    UPDATE public.audit_logs
      SET prev_hash = last_hash,
          row_hash = encode(digest(payload, 'sha256'), 'hex')
      WHERE id = r.id;
    last_hash := encode(digest(payload, 'sha256'), 'hex');
  END LOOP;
  ALTER TABLE public.audit_logs ENABLE TRIGGER trg_audit_logs_no_update;
END $$;

-- Confirm owner email so login works (only email_confirmed_at; confirmed_at is generated)
UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE lower(email) = 'prajankumar0807@gmail.com';
