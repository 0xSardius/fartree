-- Enable UUID extension (if not already enabled in your Neon project)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Using gen_random_uuid() for Next.js 15 compatibility
  fid BIGINT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'dark', -- Default to dark theme as per design
  custom_domain TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast FID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_fid ON profiles(fid);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Links table
CREATE TABLE IF NOT EXISTS profile_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Using gen_random_uuid()
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  position INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  auto_detected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_links_profile_id ON profile_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_links_position ON profile_links(profile_id, position);
