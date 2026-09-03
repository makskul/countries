-- Deactivate Russia and Belarus as relocation destinations.
-- Rows may not exist yet (not in seed); insert inactive stubs so is_active is authoritative.

INSERT INTO countries (code, region, is_active, language_key, currency, climate_key, cost_level, residency_months, tax_employee, tax_corporate)
VALUES
  ('RU', 'europe', false, 'russian', 'RUB', 'temperate', 'medium', '60', '—', '—'),
  ('BY', 'europe', false, 'belarusian', 'BYN', 'temperate', 'low', '60', '—', '—')
ON CONFLICT (code) DO UPDATE SET
  is_active = false,
  updated_at = now();
