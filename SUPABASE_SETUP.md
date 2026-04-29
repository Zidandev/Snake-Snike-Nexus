-- SQL SCHEMA FOR SNAKE SNIKE NEXUS
-- Run these in your Supabase SQL Editor

-- 1. Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  coins INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  unlocked_skins TEXT[] DEFAULT ARRAY['neon-cyan'],
  active_skin TEXT DEFAULT 'neon-cyan',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create helper function for Admin check (Prevents infinite recursion)
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. RLS - Profiles (Security Rules)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (is_admin());

-- 4. Create Scores Table
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0 NOT NULL,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. RLS - Scores
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scores" ON scores
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own scores" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. RPC: Update Player Stats (Security Definer to prevent client spoofing)
CREATE OR REPLACE FUNCTION update_player_stats(p_user_id UUID, p_score_add INTEGER, p_coins_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    total_score = total_score + p_score_add,
    coins = coins + p_coins_add
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. HOW TO CREATE AN ADMIN ACCOUNT
-- Step 1: Open the app and go to the Register page.
-- Step 2: Create an account.
-- Step 3: Run the following in Supabase SQL Editor:
-- UPDATE profiles SET role = 'admin', coins = 99999 WHERE username = 'YOUR_USERNAME';
