-- Fix existing student address data
-- Students had their name stored in firm_name instead of full_name
-- This migration moves the value to the correct column

-- For student users: copy firm_name → full_name, then clear firm_name
UPDATE public.user_addresses
SET
  full_name = firm_name,
  firm_name = ''
WHERE
  user_id IN (
    SELECT id FROM public.registration_forms WHERE role = 'student'
  )
  AND firm_name != ''
  AND firm_name IS NOT NULL;
