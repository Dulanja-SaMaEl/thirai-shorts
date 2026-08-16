-- Thirai+ Database Schema for Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums
CREATE TYPE user_role AS ENUM ('admin', 'judge', 'submitter');
CREATE TYPE movie_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');

-- 1. Users / Profile Table (Extends Supabase Auth or standalone app users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'submitter',
    profile_pic_url TEXT,
    username VARCHAR(100) UNIQUE,
    password_hash TEXT, -- For custom judge auth if needed, otherwise managed via Supabase Auth
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Movies Table
CREATE TABLE IF NOT EXISTS public.movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb, -- e.g. [{"name": "script.pdf", "url": "..."}]
    uploader_email VARCHAR(255) NOT NULL,
    uploader_phone VARCHAR(50) NOT NULL,
    status movie_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    view_count BIGINT DEFAULT 0,
    is_winner BOOLEAN DEFAULT FALSE,
    winner_category VARCHAR(100), -- e.g. 'Best Director', 'Best Short Film'
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for gallery sorting and moderation filtering
CREATE INDEX idx_movies_status ON public.movies(status);
CREATE INDEX idx_movies_created_at ON public.movies(created_at DESC);
CREATE INDEX idx_movies_view_count ON public.movies(view_count DESC);

-- 3. Reviews Table (Judges)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    comment TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_movie_judge_review UNIQUE(movie_id, judge_id)
);

CREATE INDEX idx_reviews_movie_id ON public.reviews(movie_id);

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID REFERENCES public.movies(id) ON DELETE SET NULL,
    stripe_session_id VARCHAR(255) UNIQUE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'usd',
    status VARCHAR(50) NOT NULL,
    payer_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Community Rating & Anti-Spam Votes Table
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

CREATE INDEX idx_community_votes_movie ON public.community_votes(movie_id);
CREATE INDEX idx_community_votes_email ON public.community_votes(voter_email);

-- 6. System Settings Table (for Community Rating Timer & Global Controls)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Setting for Community Rating Timer
INSERT INTO public.system_settings (key, value)
VALUES (
    'community_rating_event',
    '{"is_active": false, "end_time": null, "title": "Festival Choice Community Voting"}'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- Views & Helper Functions

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

-- Row Level Security (RLS) Policies
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Movies Policies
-- Public can read approved movies
CREATE POLICY "Public can view approved movies" 
ON public.movies FOR SELECT 
USING (status = 'approved');

-- Admins can do all actions on movies
CREATE POLICY "Admins have full access to movies" 
ON public.movies FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Judges can view approved or assigned movies
CREATE POLICY "Judges can view movies" 
ON public.movies FOR SELECT 
USING (auth.jwt() ->> 'role' = 'judge' OR status = 'approved');

-- Reviews Policies
CREATE POLICY "Public can read judge reviews" 
ON public.reviews FOR SELECT 
USING (is_public = true);

CREATE POLICY "Judges can insert own review" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = judge_id AND auth.jwt() ->> 'role' = 'judge');

CREATE POLICY "Judges can update own review" 
ON public.reviews FOR UPDATE 
USING (auth.uid() = judge_id);
