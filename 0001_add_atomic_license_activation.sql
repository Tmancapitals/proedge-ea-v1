CREATE OR REPLACE FUNCTION public.activate_capital_vault_license(
  p_code_hash TEXT,
  p_mentor_id TEXT,
  p_buyer_email TEXT,
  p_device_id TEXT
)
RETURNS TABLE (product_name TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_license public.licenses%ROWTYPE;
  activation_count INTEGER;
BEGIN
  SELECT * INTO selected_license
  FROM public.licenses
  WHERE code_hash = p_code_hash
    AND lower(buyer_email) = lower(p_buyer_email)
    AND mentor_id = p_mentor_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_LICENSE';
  END IF;
  IF selected_license.status <> 'active' THEN
    RAISE EXCEPTION 'LICENSE_INACTIVE';
  END IF;
  IF selected_license.expires_at IS NOT NULL AND selected_license.expires_at <= now() THEN
    RAISE EXCEPTION 'LICENSE_EXPIRED';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.license_activations
    WHERE license_id = selected_license.id AND device_id = p_device_id
  ) THEN
    SELECT count(*) INTO activation_count
    FROM public.license_activations
    WHERE license_id = selected_license.id;

    IF activation_count >= selected_license.max_devices THEN
      RAISE EXCEPTION 'DEVICE_LIMIT_REACHED';
    END IF;

    INSERT INTO public.license_activations (license_id, device_id)
    VALUES (selected_license.id, p_device_id);
  ELSE
    UPDATE public.license_activations
    SET last_seen_at = now()
    WHERE license_id = selected_license.id AND device_id = p_device_id;
  END IF;

  RETURN QUERY SELECT selected_license.product_name, selected_license.expires_at;
END;
$$;
REVOKE ALL ON FUNCTION public.activate_capital_vault_license(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_capital_vault_license(TEXT, TEXT, TEXT, TEXT) TO service_role;