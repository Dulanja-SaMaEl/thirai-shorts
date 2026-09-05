-- ====================================================================
-- Thirai+ Complete Database Schema & Seed Data for Supabase (PostgreSQL)
-- Platform: Thirai+ Short Film Festival & Streaming Portal
-- Includes: Roles, Encrypted Passwords, Auth Sync, VIP Subscriptions,
--           Movies, Reviews, Community Votes, & Movie Unlocks
-- ====================================================================

-- --------------------------------------------------------------------
-- STEP 1: Enable Extensions (uuid-ossp & pgcrypto for password hashing)
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- STEP 2: Enums & Custom Types (Safe Idempotent Creation)
-- --------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'judge', 'submitter', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE movie_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure 'viewer' exists in user_role for existing databases
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'viewer';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- --------------------------------------------------------------------
-- STEP 3: Core Database Tables
-- --------------------------------------------------------------------

-- 1. Users / Profile Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    tokens_balance INTEGER NOT NULL DEFAULT 2, -- Default 2 free tokens for viewing 2 short films
    subscription_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'monthly', 'yearly'
    subscription_status VARCHAR(50) DEFAULT 'inactive', -- 'inactive', 'active'
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    profile_pic_url TEXT,
    username VARCHAR(100) UNIQUE,
    password_hash TEXT, -- Encrypted bcrypt password
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Idempotent column additions for existing tables
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tokens_balance INTEGER NOT NULL DEFAULT 2;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_pic_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Subscription Packages Table
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id VARCHAR(50) UNIQUE NOT NULL, -- 'monthly', 'yearly'
    name VARCHAR(100) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    estimated_price_lkr NUMERIC(10, 2) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Movies Table
CREATE TABLE IF NOT EXISTS public.movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    uploader_email VARCHAR(255) NOT NULL,
    uploader_phone VARCHAR(50) NOT NULL,
    status movie_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    view_count BIGINT DEFAULT 0,
    is_winner BOOLEAN DEFAULT FALSE,
    winner_category VARCHAR(100),
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movies_status ON public.movies(status);
CREATE INDEX IF NOT EXISTS idx_movies_created_at ON public.movies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movies_view_count ON public.movies(view_count DESC);

-- 4. Reviews Table (Judges)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    comment TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_movie_judge_review UNIQUE (movie_id, judge_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON public.reviews(movie_id);

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    movie_id UUID REFERENCES public.movies(id) ON DELETE SET NULL,
    package_type VARCHAR(50),
    stripe_session_id VARCHAR(255) UNIQUE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'usd',
    status VARCHAR(50) NOT NULL,
    payer_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Community Rating & Anti-Spam Votes Table
CREATE TABLE IF NOT EXISTS public.community_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    voter_email VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    otp_code VARCHAR(10),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_voter_per_movie UNIQUE (movie_id, voter_email)
);

CREATE INDEX IF NOT EXISTS idx_community_votes_movie ON public.community_votes(movie_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_email ON public.community_votes(voter_email);

-- 7. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. User Movie Unlocks Table (Token-Gated Short Film Access)
CREATE TABLE IF NOT EXISTS public.user_movie_unlocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_movie_unlock UNIQUE (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_user_movie_unlocks_user ON public.user_movie_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_movie_unlocks_movie ON public.user_movie_unlocks(movie_id);

-- --------------------------------------------------------------------
-- STEP 4: Views & Functions
-- --------------------------------------------------------------------

-- View: Public Movie Average Rating (Judge + Verified Community)
CREATE OR REPLACE VIEW public.movie_analytics AS
SELECT 
    m.id AS movie_id,
    m.title,
    m.status,
    m.view_count,
    COALESCE(AVG(r.score), 0) AS avg_judge_rating,
    COUNT(r.id) AS judge_review_count,
    COALESCE(AVG(v.rating) FILTER (WHERE v.is_verified = TRUE), 0) AS avg_community_rating,
    COUNT(v.id) FILTER (WHERE v.is_verified = TRUE) AS verified_vote_count
FROM public.movies m
LEFT JOIN public.reviews r ON m.id = r.movie_id
LEFT JOIN public.community_votes v ON m.id = v.movie_id
GROUP BY m.id;

-- Function: Increment View Count atomically
CREATE OR REPLACE FUNCTION increment_movie_view(p_movie_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.movies
    SET view_count = view_count + 1
    WHERE id = p_movie_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- STEP 5: Row Level Security (RLS) & Policies
-- --------------------------------------------------------------------
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_movie_unlocks ENABLE ROW LEVEL SECURITY;

-- Movies Policies
DROP POLICY IF EXISTS "Public can view approved movies" ON public.movies;
CREATE POLICY "Public can view approved movies" 
ON public.movies FOR SELECT 
USING (status = 'approved');

DROP POLICY IF EXISTS "Admins have full access to movies" ON public.movies;
CREATE POLICY "Admins have full access to movies" 
ON public.movies FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Judges can view movies" ON public.movies;
CREATE POLICY "Judges can view movies" 
ON public.movies FOR SELECT 
USING (auth.jwt() ->> 'role' = 'judge' OR status = 'approved');

-- Reviews Policies
DROP POLICY IF EXISTS "Public can read judge reviews" ON public.reviews;
CREATE POLICY "Public can read judge reviews" 
ON public.reviews FOR SELECT 
USING (is_public = TRUE);

DROP POLICY IF EXISTS "Judges can insert own review" ON public.reviews;
CREATE POLICY "Judges can insert own review" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = judge_id AND auth.jwt() ->> 'role' = 'judge');

-- Packages Policies
DROP POLICY IF EXISTS "Public can view active packages" ON public.packages;
CREATE POLICY "Public can view active packages" 
ON public.packages FOR SELECT 
USING (is_active = TRUE);

-- Users Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

-- --------------------------------------------------------------------
-- STEP 6: Seed Users in Supabase Auth & Public Users with Passwords
-- Passwords Set:
--   admin@thiraiplus.com    -> Admin@123456
--   judge@thiraiplus.com    -> Judge@123456
--   director@thiraiplus.com -> Director@123456
--   viewer@thiraiplus.com   -> Viewer@123456
-- --------------------------------------------------------------------

-- 1. Safely Upsert into Supabase Native Auth (auth.users & auth.identities)
-- Prevents "duplicate key value violates unique constraint users_email_partial_key"
DO $$ 
DECLARE
    admin_uuid UUID;
    judge_uuid UUID;
    director_uuid UUID;
    viewer_uuid UUID;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        
        -- Admin: update password if exists, else insert
        SELECT id INTO admin_uuid FROM auth.users WHERE email = 'admin@thiraiplus.com';
        IF admin_uuid IS NOT NULL THEN
            UPDATE auth.users 
            SET encrypted_password = crypt('Admin@123456', gen_salt('bf')),
                email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
                raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
                raw_user_meta_data = '{"full_name":"Executive Admin","role":"admin"}'::jsonb,
                updated_at = NOW()
            WHERE id = admin_uuid;
        ELSE
            admin_uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password,
                email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', admin_uuid,
                'authenticated', 'authenticated', 'admin@thiraiplus.com',
                crypt('Admin@123456', gen_salt('bf')), NOW(),
                '{"provider":"email","providers":["email"]}'::jsonb,
                '{"full_name":"Executive Admin","role":"admin"}'::jsonb, NOW(), NOW()
            );
        END IF;

        -- Judge: update password if exists, else insert
        SELECT id INTO judge_uuid FROM auth.users WHERE email = 'judge@thiraiplus.com';
        IF judge_uuid IS NOT NULL THEN
            UPDATE auth.users 
            SET encrypted_password = crypt('Judge@123456', gen_salt('bf')),
                email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
                raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
                raw_user_meta_data = '{"full_name":"Judge Steven Spielberg","role":"judge"}'::jsonb,
                updated_at = NOW()
            WHERE id = judge_uuid;
        ELSE
            judge_uuid := 'b0000000-0000-0000-0000-000000000002'::uuid;
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password,
                email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', judge_uuid,
                'authenticated', 'authenticated', 'judge@thiraiplus.com',
                crypt('Judge@123456', gen_salt('bf')), NOW(),
                '{"provider":"email","providers":["email"]}'::jsonb,
                '{"full_name":"Judge Steven Spielberg","role":"judge"}'::jsonb, NOW(), NOW()
            );
        END IF;

        -- Director: update password if exists, else insert
        SELECT id INTO director_uuid FROM auth.users WHERE email = 'director@thiraiplus.com';
        IF director_uuid IS NOT NULL THEN
            UPDATE auth.users 
            SET encrypted_password = crypt('Director@123456', gen_salt('bf')),
                email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
                raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
                raw_user_meta_data = '{"full_name":"Mani Ratnam","role":"submitter"}'::jsonb,
                updated_at = NOW()
            WHERE id = director_uuid;
        ELSE
            director_uuid := 'c0000000-0000-0000-0000-000000000003'::uuid;
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password,
                email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', director_uuid,
                'authenticated', 'authenticated', 'director@thiraiplus.com',
                crypt('Director@123456', gen_salt('bf')), NOW(),
                '{"provider":"email","providers":["email"]}'::jsonb,
                '{"full_name":"Mani Ratnam","role":"submitter"}'::jsonb, NOW(), NOW()
            );
        END IF;

        -- Viewer: update password if exists, else insert
        SELECT id INTO viewer_uuid FROM auth.users WHERE email = 'viewer@thiraiplus.com';
        IF viewer_uuid IS NOT NULL THEN
            UPDATE auth.users 
            SET encrypted_password = crypt('Viewer@123456', gen_salt('bf')),
                email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
                raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
                raw_user_meta_data = '{"full_name":"Cinema Enthusiast","role":"viewer"}'::jsonb,
                updated_at = NOW()
            WHERE id = viewer_uuid;
        ELSE
            viewer_uuid := 'd0000000-0000-0000-0000-000000000004'::uuid;
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password,
                email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', viewer_uuid,
                'authenticated', 'authenticated', 'viewer@thiraiplus.com',
                crypt('Viewer@123456', gen_salt('bf')), NOW(),
                '{"provider":"email","providers":["email"]}'::jsonb,
                '{"full_name":"Cinema Enthusiast","role":"viewer"}'::jsonb, NOW(), NOW()
            );
        END IF;

        -- Ensure identities table has matching rows
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'identities') THEN
            INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
            VALUES 
                (admin_uuid::text, admin_uuid, json_build_object('sub', admin_uuid::text, 'email', 'admin@thiraiplus.com')::jsonb, 'email', NOW(), NOW(), NOW()),
                (judge_uuid::text, judge_uuid, json_build_object('sub', judge_uuid::text, 'email', 'judge@thiraiplus.com')::jsonb, 'email', NOW(), NOW(), NOW()),
                (director_uuid::text, director_uuid, json_build_object('sub', director_uuid::text, 'email', 'director@thiraiplus.com')::jsonb, 'email', NOW(), NOW(), NOW()),
                (viewer_uuid::text, viewer_uuid, json_build_object('sub', viewer_uuid::text, 'email', 'viewer@thiraiplus.com')::jsonb, 'email', NOW(), NOW(), NOW())
            ON CONFLICT (provider, id) DO NOTHING;
        END IF;

    END IF;
END $$;

-- 2. Seed Public Users Table (with Encrypted Bcrypt password_hash)
INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    tokens_balance,
    subscription_tier,
    subscription_status,
    username,
    profile_pic_url,
    password_hash
)
VALUES 
    (
        COALESCE((SELECT id FROM auth.users WHERE email = 'admin@thiraiplus.com'), 'a0000000-0000-0000-0000-000000000001'::uuid),
        'admin@thiraiplus.com',
        'Executive Admin',
        'admin',
        999,
        'yearly',
        'active',
        'admin',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        crypt('Admin@123456', gen_salt('bf'))
    ),
    (
        COALESCE((SELECT id FROM auth.users WHERE email = 'judge@thiraiplus.com'), 'b0000000-0000-0000-0000-000000000002'::uuid),
        'judge@thiraiplus.com',
        'Judge Steven Spielberg',
        'judge',
        999,
        'yearly',
        'active',
        'judge_steven',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        crypt('Judge@123456', gen_salt('bf'))
    ),
    (
        COALESCE((SELECT id FROM auth.users WHERE email = 'director@thiraiplus.com'), 'c0000000-0000-0000-0000-000000000003'::uuid),
        'director@thiraiplus.com',
        'Mani Ratnam',
        'submitter',
        5,
        'monthly',
        'active',
        'mani_filmmaker',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        crypt('Director@123456', gen_salt('bf'))
    ),
    (
        COALESCE((SELECT id FROM auth.users WHERE email = 'viewer@thiraiplus.com'), 'd0000000-0000-0000-0000-000000000004'::uuid),
        'viewer@thiraiplus.com',
        'Cinema Enthusiast',
        'viewer',
        2, -- 2 Free tokens for viewing 2 short films upon registration
        'free',
        'inactive',
        'cine_fan',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        crypt('Viewer@123456', gen_salt('bf'))
    )
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    tokens_balance = EXCLUDED.tokens_balance,
    subscription_tier = EXCLUDED.subscription_tier,
    subscription_status = EXCLUDED.subscription_status,
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    profile_pic_url = EXCLUDED.profile_pic_url,
    password_hash = EXCLUDED.password_hash;

-- 3. Seed Subscription Packages ($4.99 & $39.99 with estimated LKR)
INSERT INTO public.packages (
    id,
    plan_id,
    name,
    price_usd,
    estimated_price_lkr,
    billing_cycle,
    features,
    is_active
)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'monthly',
        'Monthly VIP Pass',
        4.99,
        1550.00,
        'monthly',
        '["Unlimited short film streaming", "4K Ultra-HD & HDR playback", "Full access to jury reviews & ratings", "Priority streaming bandwidth", "Cancel anytime"]'::jsonb,
        true
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'yearly',
        'Annual VIP Pass',
        39.99,
        12400.00,
        'yearly',
        '["All Monthly VIP Pass features", "Festival Audience Choice voting rights", "Behind-the-scenes filmmaker interviews", "Exclusive virtual awards gala pass", "Save 33% compared to monthly"]'::jsonb,
        true
    )
ON CONFLICT (plan_id) DO UPDATE SET
    name = EXCLUDED.name,
    price_usd = EXCLUDED.price_usd,
    estimated_price_lkr = EXCLUDED.estimated_price_lkr,
    billing_cycle = EXCLUDED.billing_cycle,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active;

-- 4. Seed Featured Short Films
INSERT INTO public.movies (
    id,
    title,
    description,
    thumbnail_url,
    video_url,
    attachments,
    uploader_email,
    uploader_phone,
    status,
    view_count,
    is_winner,
    winner_category,
    payment_status
)
VALUES
    (
        'e0000000-0000-0000-0000-000000000001',
        'Blue End Screen: Winter Outro',
        'A breathtaking visual journey capturing winter landscapes, serene typography, and high-contrast cinematic atmosphere.',
        '/images/logo-wordmark.png',
        '/videos/demo-film.mp4',
        '[{"name": "Director Statement.pdf", "url": "/videos/demo-film.mp4"}, {"name": "Official Poster HD.png", "url": "/images/logo-icon.png"}]'::jsonb,
        'director@thiraiplus.com',
        '+94 77 123 4567',
        'approved',
        1420,
        true,
        'Best Cinematography',
        'paid'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'The Whispering Palms',
        'A poignant drama set along the sun-drenched shores of Jaffna, following an aging fisherman preserving timeless coastal folklore against modern tides.',
        'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
        '/videos/demo-film.mp4',
        '[{"name": "Production Notes.pdf", "url": "/videos/demo-film.mp4"}]'::jsonb,
        'director@thiraiplus.com',
        '+94 77 987 6543',
        'approved',
        2850,
        true,
        'Golden Thira Award - Best Short Film',
        'paid'
    ),
    (
        'e0000000-0000-0000-0000-000000000003',
        'Echoes of Silence',
        'An experimental neo-noir short exploring urban isolation in a bustling metropolitan city, portrayed entirely through ambient soundscapes and neon reflections.',
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
        '/videos/demo-film.mp4',
        '[{"name": "Soundtrack Stems.zip", "url": "/videos/demo-film.mp4"}]'::jsonb,
        'director@thiraiplus.com',
        '+94 71 555 4321',
        'approved',
        980,
        false,
        null,
        'paid'
    ),
    (
        'e0000000-0000-0000-0000-000000000004',
        'The Last Letter',
        'A heart-wrenching historical drama depicting two wartime correspondents separated across borders in 1989, connected only by unsent letters.',
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
        '/videos/demo-film.mp4',
        '[{"name": "Historical Reference.pdf", "url": "/videos/demo-film.mp4"}]'::jsonb,
        'director@thiraiplus.com',
        '+94 76 222 3344',
        'approved',
        1760,
        false,
        null,
        'paid'
    ),
    (
        'e0000000-0000-0000-0000-000000000005',
        'Shadows in the Mist',
        'A psychological thriller set deep in the central highlands of Sri Lanka as an ancient tea estate mystery slowly unravels among three stranded travelers.',
        'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800',
        '/videos/demo-film.mp4',
        '[{"name": "Screenplay Extract.pdf", "url": "/videos/demo-film.mp4"}]'::jsonb,
        'director@thiraiplus.com',
        '+94 70 888 9900',
        'approved',
        3410,
        true,
        'Best Sound Design',
        'paid'
    ),
    (
        'e0000000-0000-0000-0000-000000000006',
        'Under the Banyan',
        'An indie documentary on village storytelling traditions and the vanishing oral epics of ancient theater performed under sacred trees.',
        'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800',
        '/videos/demo-film.mp4',
        '[]'::jsonb,
        'director@thiraiplus.com',
        '+94 72 444 5566',
        'pending',
        120,
        false,
        null,
        'paid'
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url,
    video_url = EXCLUDED.video_url,
    attachments = EXCLUDED.attachments,
    status = EXCLUDED.status,
    view_count = EXCLUDED.view_count,
    is_winner = EXCLUDED.is_winner,
    winner_category = EXCLUDED.winner_category,
    payment_status = EXCLUDED.payment_status;

-- 5. Seed Judge Reviews (linked via dynamic judge_id)
INSERT INTO public.reviews (
    id,
    movie_id,
    judge_id,
    score,
    comment,
    is_public
)
SELECT
    'f0000000-0000-0000-0000-000000000001'::uuid,
    'e0000000-0000-0000-0000-000000000001'::uuid,
    u.id,
    10,
    'Masterpiece in atmospheric editing and subtle color grading. Exceptional timing, mood, and sound design!',
    true
FROM public.users u WHERE u.email = 'judge@thiraiplus.com'
ON CONFLICT (id) DO UPDATE SET
    score = EXCLUDED.score,
    comment = EXCLUDED.comment,
    is_public = EXCLUDED.is_public;

INSERT INTO public.reviews (
    id,
    movie_id,
    judge_id,
    score,
    comment,
    is_public
)
SELECT
    'f0000000-0000-0000-0000-000000000002'::uuid,
    'e0000000-0000-0000-0000-000000000002'::uuid,
    u.id,
    10,
    'Heart-touching storytelling with stunning framing of coastal life. Truly deserving of the Golden Thira Award!',
    true
FROM public.users u WHERE u.email = 'judge@thiraiplus.com'
ON CONFLICT (id) DO UPDATE SET
    score = EXCLUDED.score,
    comment = EXCLUDED.comment,
    is_public = EXCLUDED.is_public;

INSERT INTO public.reviews (
    id,
    movie_id,
    judge_id,
    score,
    comment,
    is_public
)
SELECT
    'f0000000-0000-0000-0000-000000000003'::uuid,
    'e0000000-0000-0000-0000-000000000003'::uuid,
    u.id,
    8,
    'Bold audio-visual experimentation. The neo-noir mood and neon reflections create a gripping sensory narrative.',
    true
FROM public.users u WHERE u.email = 'judge@thiraiplus.com'
ON CONFLICT (id) DO UPDATE SET
    score = EXCLUDED.score,
    comment = EXCLUDED.comment,
    is_public = EXCLUDED.is_public;

INSERT INTO public.reviews (
    id,
    movie_id,
    judge_id,
    score,
    comment,
    is_public
)
SELECT
    'f0000000-0000-0000-0000-000000000004'::uuid,
    'e0000000-0000-0000-0000-000000000005'::uuid,
    u.id,
    9,
    'Terrific suspense building. The use of natural hill-country mist creates an eerie and captivating atmosphere.',
    true
FROM public.users u WHERE u.email = 'judge@thiraiplus.com'
ON CONFLICT (id) DO UPDATE SET
    score = EXCLUDED.score,
    comment = EXCLUDED.comment,
    is_public = EXCLUDED.is_public;

-- 6. Seed Community Verified Ratings
INSERT INTO public.community_votes (
    id,
    movie_id,
    voter_email,
    rating,
    is_verified,
    verified_at
)
VALUES
    ('30000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'audience1@gmail.com', 9, true, NOW()),
    ('30000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'audience2@gmail.com', 10, true, NOW()),
    ('30000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'audience3@gmail.com', 8, true, NOW()),
    ('30000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000005', 'audience4@gmail.com', 9, true, NOW())
ON CONFLICT (movie_id, voter_email) DO NOTHING;

-- 7. Seed System Settings (Community Voting Event)
INSERT INTO public.system_settings (key, value)
VALUES (
    'community_rating_event',
    '{"is_active": true, "end_time": "2026-10-31T23:59:59Z", "title": "Festival Choice Community Voting"}'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8. Seed Sample User Movie Unlock (Pre-unlock Film 1 for Demo Viewer)
INSERT INTO public.user_movie_unlocks (
    id,
    user_id,
    movie_id
)
SELECT
    '20000000-0000-0000-0000-000000000001'::uuid,
    u.id,
    'e0000000-0000-0000-0000-000000000001'::uuid
FROM public.users u WHERE u.email = 'viewer@thiraiplus.com'
ON CONFLICT (user_id, movie_id) DO NOTHING;
