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
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON public.users(email);
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_packages_plan_id_unique ON public.packages(plan_id);
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
    original_language,
    subtitle_language,
    genre,
    running_time,
    year_of_production,
    country_of_production,
    director_name,
    director_email,
    director_phone,
    producer_name,
    producer_email,
    producer_phone,
    writer_name,
    cinematographer_name,
    editor_name,
    sound_designer_name,
    music_composer_name,
    lead_casts,
    production_company,
    budget_range,
    shooting_format,
    editing_software,
    premiere_status,
    production_date,
    applied_festivals,
    film_type,
    contact_name,
    contact_email,
    contact_phone,
    social_media_links,
    director_photo_url,
    declaration_content_permission,
    declaration_copyright_compliant,
    declaration_screening_allowed,
    declaration_confirmed,
    digital_signature,
    signature_date,
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
        'Tamil',
        'English',
        'Experimental Visual',
        '14 mins',
        '2026',
        'Sri Lanka',
        'Mani Ratnam',
        'director@thiraiplus.com',
        '+94 77 123 4567',
        'Madras Talkies',
        'producer@thiraiplus.com',
        '+94 77 111 2233',
        'Mani Ratnam',
        'P. C. Sreeram',
        'A. Sreekar Prasad',
        'Resul Pookutty',
        'A. R. Rahman',
        '[{"actor": "Arvind Swami", "character": "The Traveler"}, {"actor": "Revathi", "character": "The Narrator"}]'::jsonb,
        'Thirai Visual Labs',
        '$5,000 - $10,000',
        'Arri Alexa Mini',
        'DaVinci Resolve Studio',
        'National Premiere',
        '2026-01-15',
        'Cannes Short Film Corner, IFFI Goa',
        'Independent Film',
        'Mani Ratnam',
        'director@thiraiplus.com',
        '+94 77 123 4567',
        'https://instagram.com/thiraiplus',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        true,
        true,
        true,
        true,
        'Mani Ratnam',
        '2026-01-15',
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
        'Tamil',
        'English, French',
        'Coastal Drama',
        '22 mins',
        '2025',
        'Sri Lanka',
        'Vetrimaaran',
        'vetri@grassroot.com',
        '+94 77 987 6543',
        'Grass Root Film Company',
        'producer@grassroot.com',
        '+94 77 987 6544',
        'Vetrimaaran',
        'Velraj',
        'R. Ramar',
        'Tapass Nayak',
        'Santhosh Narayanan',
        '[{"actor": "Dhanush", "character": "Anbu"}, {"actor": "Kishore", "character": "Elder Murugan"}]'::jsonb,
        'Northern Cinema Collective',
        '$10,000 - $20,000',
        'RED Komodo 6K',
        'Final Cut Pro X',
        'World Premiere',
        '2025-11-20',
        'Rotterdam Film Festival',
        'Independent Film',
        'Vetrimaaran',
        'vetri@grassroot.com',
        '+94 77 987 6543',
        'https://twitter.com/grassrootfilms',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        true,
        true,
        true,
        true,
        'Vetrimaaran',
        '2025-11-20',
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
        'Tamil / Ambient',
        'English',
        'Neo-Noir Thriller',
        '16 mins',
        '2026',
        'Sri Lanka',
        'Thiagarajan Kumararaja',
        'kumararaja@noir.com',
        '+94 71 555 4321',
        'Tyler Durden Productions',
        'tyler@noir.com',
        '+94 71 555 4322',
        'Thiagarajan Kumararaja',
        'P. S. Vinod',
        'Sathyaraj Natarajan',
        'Suren. G',
        'Yuvan Shankar Raja',
        '[{"actor": "Vijay Sethupathi", "character": "Shilpa"}, {"actor": "Fahadh Faasil", "character": "Mugil"}]'::jsonb,
        'Neon Alley Motion Pictures',
        '$5,000 - $10,000',
        'Sony FX6 Cinema Line',
        'Adobe Premiere Pro 2026',
        'Regional Premiere',
        '2026-02-10',
        'Clermont-Ferrand',
        'Independent Film',
        'Thiagarajan Kumararaja',
        'kumararaja@noir.com',
        '+94 71 555 4321',
        'https://instagram.com/neonalleyfilms',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        true,
        true,
        true,
        true,
        'Thiagarajan Kumararaja',
        '2026-02-10',
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
        'Tamil',
        'English, German',
        'Historical Drama',
        '18 mins',
        '2025',
        'Sri Lanka',
        'Sudha Kongara',
        'sudha@cinemahouse.com',
        '+94 76 222 3344',
        '2D Entertainment',
        'producer@2d.com',
        '+94 76 222 3345',
        'Sudha Kongara',
        'Niketh Bommireddy',
        'Sathish Suriya',
        'G. V. Prakash Kumar',
        'G. V. Prakash Kumar',
        '[{"actor": "Suriya", "character": "Captain Nedumaaran"}, {"actor": "Aparna Balamurali", "character": "Bommi"}]'::jsonb,
        '2D Short Formats',
        '$15,000 - $30,000',
        'Arri Alexa Mini LF',
        'DaVinci Resolve Studio',
        'National Premiere',
        '2025-08-14',
        'Toronto International Film Festival',
        'Independent Film',
        'Sudha Kongara',
        'sudha@cinemahouse.com',
        '+94 76 222 3344',
        'https://instagram.com/2d_entertainment',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        true,
        true,
        true,
        true,
        'Sudha Kongara',
        '2025-08-14',
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
        'Tamil, Sinhala',
        'English',
        'Psychological Thriller',
        '19 mins',
        '2026',
        'Sri Lanka',
        'Prasanna Vithanage',
        'prasanna@highlandcinema.com',
        '+94 70 888 9900',
        'Highland Reel Productions',
        'producer@highlandcinema.com',
        '+94 70 888 9901',
        'Prasanna Vithanage',
        'M. D. Mahindapala',
        'A. Sreekar Prasad',
        'Lakshman Joseph de Saram',
        'Lakshman Joseph de Saram',
        '[{"actor": "Shyam Fernando", "character": "Victor"}, {"actor": "Nimmi Harasgama", "character": "Anula"}]'::jsonb,
        'Hill Country Pictures',
        '$8,000 - $15,000',
        'Canon Cinema EOS C300 Mark III',
        'DaVinci Resolve Studio',
        'World Premiere',
        '2026-01-28',
        'Busan International Film Festival',
        'Independent Film',
        'Prasanna Vithanage',
        'prasanna@highlandcinema.com',
        '+94 70 888 9900',
        'https://highlandcinema.com',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
        true,
        true,
        true,
        true,
        'Prasanna Vithanage',
        '2026-01-28',
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
        'Tamil',
        'English',
        'Folk Documentary',
        '12 mins',
        '2026',
        'Sri Lanka',
        'Anoma Janadari',
        'anoma@folklore.org',
        '+94 72 444 5566',
        'Heritage Cinema Trust',
        'trust@folklore.org',
        '+94 72 444 5567',
        'Anoma Janadari',
        'Channa Deshapriya',
        'Ravindra Guruge',
        'Kalinga Gihan',
        'Traditional Folk Troupe',
        '[{"actor": "K. Perera", "character": "Master Storyteller"}]'::jsonb,
        'Heritage Cinema Trust',
        'Under $5,000',
        'Blackmagic Pocket Cinema 6K Pro',
        'Adobe Premiere Pro 2026',
        'Not Premiered',
        '2026-03-01',
        'None',
        'Student Film',
        'Anoma Janadari',
        'anoma@folklore.org',
        '+94 72 444 5566',
        'https://instagram.com/heritagefolk',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
        true,
        true,
        true,
        true,
        'Anoma Janadari',
        '2026-03-01',
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
    original_language = EXCLUDED.original_language,
    subtitle_language = EXCLUDED.subtitle_language,
    genre = EXCLUDED.genre,
    running_time = EXCLUDED.running_time,
    year_of_production = EXCLUDED.year_of_production,
    country_of_production = EXCLUDED.country_of_production,
    director_name = EXCLUDED.director_name,
    director_email = EXCLUDED.director_email,
    director_phone = EXCLUDED.director_phone,
    producer_name = EXCLUDED.producer_name,
    producer_email = EXCLUDED.producer_email,
    producer_phone = EXCLUDED.producer_phone,
    writer_name = EXCLUDED.writer_name,
    cinematographer_name = EXCLUDED.cinematographer_name,
    editor_name = EXCLUDED.editor_name,
    sound_designer_name = EXCLUDED.sound_designer_name,
    music_composer_name = EXCLUDED.music_composer_name,
    lead_casts = EXCLUDED.lead_casts,
    production_company = EXCLUDED.production_company,
    budget_range = EXCLUDED.budget_range,
    shooting_format = EXCLUDED.shooting_format,
    editing_software = EXCLUDED.editing_software,
    premiere_status = EXCLUDED.premiere_status,
    production_date = EXCLUDED.production_date,
    applied_festivals = EXCLUDED.applied_festivals,
    film_type = EXCLUDED.film_type,
    contact_name = EXCLUDED.contact_name,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    social_media_links = EXCLUDED.social_media_links,
    director_photo_url = EXCLUDED.director_photo_url,
    declaration_content_permission = EXCLUDED.declaration_content_permission,
    declaration_copyright_compliant = EXCLUDED.declaration_copyright_compliant,
    declaration_screening_allowed = EXCLUDED.declaration_screening_allowed,
    declaration_confirmed = EXCLUDED.declaration_confirmed,
    digital_signature = EXCLUDED.digital_signature,
    signature_date = EXCLUDED.signature_date,
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
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;

-- 10. Seed Official Festival Awards (22 Award Categories Sample Allocations)
CREATE TABLE IF NOT EXISTS public.festival_awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(150) NOT NULL,
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255),
    citation TEXT,
    year VARCHAR(10) DEFAULT '2026',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_festival_awards_category_unique ON public.festival_awards(category);

INSERT INTO public.festival_awards (
    id,
    category,
    movie_id,
    recipient_name,
    citation,
    year
)
VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        'Best Film of Entire Festival - Main Award',
        'e0000000-0000-0000-0000-000000000002',
        'Vetrimaaran (Director) & Grass Root Film Company',
        'Awarded for superlative poetic storytelling and unforgettable portrayal of coastal heritage.',
        '2026'
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        'Best Director',
        'e0000000-0000-0000-0000-000000000001',
        'Mani Ratnam',
        'Awarded for masterful visual rhythm, aesthetic restraint, and atmospheric direction.',
        '2026'
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        'Best Cinematography',
        'e0000000-0000-0000-0000-000000000002',
        'Velraj',
        'Awarded for breathtaking ocean vistas and exquisite natural light photography.',
        '2026'
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        'Best Actor',
        'e0000000-0000-0000-0000-000000000002',
        'Dhanush as Anbu',
        'Awarded for an emotionally nuanced, grounded, and mesmerizing lead performance.',
        '2026'
    ),
    (
        '40000000-0000-0000-0000-000000000005',
        'Best Sound Design',
        'e0000000-0000-0000-0000-000000000001',
        'Resul Pookutty',
        'Awarded for rich acoustic textures and pristine spatial audio design.',
        '2026'
    ),
    (
        '40000000-0000-0000-0000-000000000006',
        'Audience Choice Award',
        'e0000000-0000-0000-0000-000000000005',
        'Prasanna Vithanage',
        'Crowned by popular audience votes across festival community screenings.',
        '2026'
    )
ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    movie_id = EXCLUDED.movie_id,
    recipient_name = EXCLUDED.recipient_name,
    citation = EXCLUDED.citation,
    year = EXCLUDED.year;
