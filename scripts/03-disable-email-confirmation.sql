-- Išjungti el. pašto patvirtinimą Supabase projekte
-- Šis SQL kodas turi būti paleistas Supabase SQL editoriuje

-- Atnaujinti vartotojų lentelę, kad automatiškai patvirtintų el. paštus
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Sukurti trigger'į, kuris automatiškai patvirtins naujų vartotojų el. paštus
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatiškai patvirtinti el. paštą naujiems vartotojams
  NEW.email_confirmed_at = NOW();
  NEW.confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sukurti trigger'į
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_email();

-- Atnaujinti vartotojų lentelę mūsų aplikacijoje
ALTER TABLE vartotojai 
ALTER COLUMN el_pasto_patvirtintas SET DEFAULT true;

-- Atnaujinti esamus vartotojus
UPDATE vartotojai 
SET el_pasto_patvirtintas = true 
WHERE el_pasto_patvirtintas = false OR el_pasto_patvirtintas IS NULL;
