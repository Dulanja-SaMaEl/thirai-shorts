-- ====================================================================
-- Thirai+ Seed Data Script for Supabase (PostgreSQL)
-- Includes: Encrypted Bcrypt Passwords, Native Supabase Auth sync,
--           Users, Movies, Reviews, Packages, and Unlocks.
-- ====================================================================

-- 1. Ensure extensions for password encryption
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Safely Upsert into Supabase Native Auth (auth.users & auth.identities)
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

        -- Ensure identities table has matching rows (safely handling UUID id and optional provider_id)
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'identities') THEN
            BEGIN
                IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'auth' AND table_name = 'identities' AND column_name = 'provider_id') THEN
                    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
                    VALUES 
                        (admin_uuid, admin_uuid, admin_uuid::text, json_build_object('sub', admin_uuid::text, 'email', 'admin@thiraiplus.com')::jsonb, 'email', NOW(), NOW(), NOW()),
                        (judge_uuid, judge_uuid, judge_uuid::text, json_build_object('sub', judge_uuid::text, 'email', 'judge@thiraiplus.com')::jsonb, 'email', NOW(), NOW(), NOW()),
                        (director_uuid, director_uuid, director_uuid::text, json_build_object('sub', director_uuid::text, 'email', 'director@thiraiplus.com')::jsonb, 'email', NOW(), NOW(), NOW()),
                        (viewer_uuid, viewer_uuid, viewer_uuid::text, json_build_object('sub', viewer_uuid::text, 'email', 'viewer@thiraiplus.com')::jsonb, 'email', NOW(), NOW(), NOW())
                    ON CONFLICT DO NOTHING;
                ELSE
                    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
                    VALUES 
                        (admin_uuid, admin_uuid, json_build_object('sub', admin_uuid::text, 'email', 'admin@thiraiplus.com')::jsonb, 'email', NOW(), NOW(), NOW()),
                        (judge_uuid, judge_uuid, json_build_object('sub', judge_uuid::text, 'email', 'judge@thiraiplus.com')::jsonb, 'email', NOW(), NOW(), NOW()),
                        (director_uuid, director_uuid, director_uuid::text, json_build_object('sub', director_uuid::text, 'email', 'director@thiraiplus.com')::jsonb, 'email', NOW(), NOW(), NOW()),
                        (viewer_uuid, viewer_uuid, viewer_uuid::text, json_build_object('sub', viewer_uuid::text, 'email', 'viewer@thiraiplus.com')::jsonb, 'email', NOW(), NOW(), NOW())
                    ON CONFLICT DO NOTHING;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                -- Never let identity sync prevent schema completion
                RAISE NOTICE 'identities notice: %', SQLERRM;
            END;
        END IF;

    END IF;
END $$;

-- 3. Seed Public Users Table (with Encrypted Bcrypt password_hash)
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

-- 4. Seed Subscription Packages ($4.99 & $39.99 with estimated LKR)
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

-- 5. Seed Featured Short Films
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

-- 6. Seed Judge Reviews (linked via dynamic judge_id)
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

-- 7. Seed Community Verified Ratings
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

-- 8. Seed System Settings (Community Voting Event)
INSERT INTO public.system_settings (key, value)
VALUES (
    'community_rating_event',
    '{"is_active": true, "end_time": "2026-10-31T23:59:59Z", "title": "Festival Choice Community Voting"}'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 9. Seed Sample User Movie Unlock (Pre-unlock Film 1 for Demo Viewer)
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
