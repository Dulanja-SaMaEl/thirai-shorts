"use client";

import { useState, useEffect } from 'react';
import {
  Trophy, Award, Star, Play, Sparkles, Filter,
  Clock, CheckCircle2, Clapperboard, Film, ChevronRight, Eye,
  Lock, Unlock, Calendar, Flame, AlertCircle
} from 'lucide-react';
import api from '../lib/api';

// 3 Curated Nominated Films per Category (All 22 Official Categories)
const DEFAULT_NOMINATIONS = [
  {
    id: 'main-film',
    name: 'Best Film of Entire Festival - Main Award',
    group: 'grand',
    description: 'The highest honor of Thirai+ Festival awarded to the most outstanding overall short film production.',
    nominees: [
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        title: 'The Whispering Palms',
        director_name: 'Vetrimaaran',
        thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Coastal Drama',
        is_winner: true,
        citation: 'Awarded for superlative poetic storytelling and unforgettable portrayal of coastal heritage.'
      },
      {
        id: 'nom-main-02',
        title: 'Echoes of the Monsoon',
        director_name: 'Anurag Kashyap',
        thumbnail_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '26 mins',
        genre: 'Rural Noir',
        is_winner: false
      },
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        title: 'Blue End Screen: Winter Outro',
        director_name: 'Mani Ratnam',
        thumbnail_url: '/images/logo-wordmark.png',
        video_url: '/videos/demo-film.mp4',
        running_time: '14 mins',
        genre: 'Experimental Visual',
        is_winner: false
      }
    ]
  },
  {
    id: 'audience-choice',
    name: 'Audience Choice Award',
    group: 'grand',
    description: 'Determined by total verified audience community ratings & public engagement.',
    nominees: [
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        title: 'The Whispering Palms',
        director_name: 'Vetrimaaran',
        thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Coastal Drama',
        is_winner: true,
        citation: 'Crowned by popular audience votes across festival community screenings.'
      },
      {
        id: 'nom-aud-02',
        title: 'Rhythms of the Street',
        director_name: 'Pa. Ranjith',
        thumbnail_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '19 mins',
        genre: 'Urban Musical',
        is_winner: false
      },
      {
        id: 'nom-aud-03',
        title: 'Kite Runner of Trinco',
        director_name: 'Prasanna Vithanage',
        thumbnail_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '24 mins',
        genre: 'Coastal Drama',
        is_winner: false
      }
    ]
  },
  {
    id: 'social-impact',
    name: 'Best Social Impact Film',
    group: 'grand',
    description: 'Recognizing powerful films that highlight humanitarian, environmental, or urgent societal issues.',
    nominees: [
      {
        id: 'nom-soc-01',
        title: 'Borders of Sand',
        director_name: 'Mira Nair',
        thumbnail_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '28 mins',
        genre: 'Humanitarian Drama',
        is_winner: false
      },
      {
        id: 'nom-soc-02',
        title: "The Weaver's Loom",
        director_name: 'Vetri Duraisamy',
        thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '18 mins',
        genre: 'Social Realism',
        is_winner: false
      },
      {
        id: 'nom-soc-03',
        title: 'Silent Frequencies',
        director_name: 'Jeo Baby',
        thumbnail_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '21 mins',
        genre: 'Disability Advocacy',
        is_winner: false
      }
    ]
  },
  {
    id: 'best-director',
    name: 'Best Director',
    group: 'directing_writing',
    description: 'Awarded to the filmmaker demonstrating exceptional vision, staging, and storytelling prowess.',
    nominees: [
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        title: 'Blue End Screen: Winter Outro',
        director_name: 'Mani Ratnam',
        thumbnail_url: '/images/logo-wordmark.png',
        video_url: '/videos/demo-film.mp4',
        running_time: '14 mins',
        genre: 'Experimental Visual',
        is_winner: true,
        citation: 'Awarded for masterful visual rhythm, aesthetic restraint, and atmospheric direction.'
      },
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        title: 'The Whispering Palms',
        director_name: 'Vetrimaaran',
        thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Coastal Drama',
        is_winner: false
      },
      {
        id: 'nom-dir-03',
        title: 'Midnight Metro',
        director_name: 'Lokesh Kanagaraj',
        thumbnail_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '25 mins',
        genre: 'Action Thriller',
        is_winner: false
      }
    ]
  },
  {
    id: 'best-screenplay',
    name: 'Best Screenplay',
    group: 'directing_writing',
    description: 'Honoring exceptional structure, pacing, and narrative economy in short-format storytelling.',
    nominees: [
      {
        id: 'nom-scr-01',
        title: 'The Jaffna Rail',
        director_name: 'Prasanna Vithanage',
        thumbnail_url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '31 mins',
        genre: 'Historical Fiction',
        is_winner: false
      },
      {
        id: 'nom-scr-02',
        title: 'Letters to Ananya',
        director_name: 'Gautham Vasudev Menon',
        thumbnail_url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '19 mins',
        genre: 'Romance Drama',
        is_winner: false
      },
      {
        id: 'nom-scr-03',
        title: 'Solitude at Point Pedro',
        director_name: 'Jude Anthany Joseph',
        thumbnail_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '23 mins',
        genre: 'Mystery',
        is_winner: false
      }
    ]
  },
  {
    id: 'script-writer',
    name: 'Best Script Writer',
    group: 'directing_writing',
    description: 'Celebrating compelling concept, character arcs, and narrative originality.',
    nominees: [
      {
        id: 'nom-sw-01',
        title: 'Neon Horizon',
        director_name: 'Pushkar-Gayathri',
        thumbnail_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Neo-Noir',
        is_winner: false
      },
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        title: 'The Whispering Palms',
        director_name: 'Vetrimaaran',
        thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Coastal Drama',
        is_winner: false
      },
      {
        id: 'nom-sw-03',
        title: 'Parallel Realities',
        director_name: 'Thiagarajan Kumararaja',
        thumbnail_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '27 mins',
        genre: 'Surreal Drama',
        is_winner: false
      }
    ]
  },
  {
    id: 'dialogue-writer',
    name: 'Best Dialogue Writer',
    group: 'directing_writing',
    description: 'Awarded for authentic, poignant, and memorable spoken word and verbal rhythm.',
    nominees: [
      {
        id: 'nom-dw-01',
        title: 'Children of the Mist',
        director_name: 'Mari Selvaraj',
        thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '25 mins',
        genre: 'Rural Drama',
        is_winner: false
      },
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        title: 'Blue End Screen: Winter Outro',
        director_name: 'Mani Ratnam',
        thumbnail_url: '/images/logo-wordmark.png',
        video_url: '/videos/demo-film.mp4',
        running_time: '14 mins',
        genre: 'Experimental Visual',
        is_winner: false
      },
      {
        id: 'nom-dw-03',
        title: 'Chasing Stardust',
        director_name: 'Halitha Shameem',
        thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '18 mins',
        genre: 'Coming-of-Age',
        is_winner: false
      }
    ]
  },
  {
    id: 'best-actor',
    name: 'Best Actor',
    group: 'performance',
    description: 'For an outstanding lead performance by a male actor in a short film.',
    nominees: [
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        title: 'The Whispering Palms',
        director_name: 'Dhanush as Anbu',
        thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Coastal Drama',
        is_winner: true,
        citation: 'Awarded for an emotionally nuanced, grounded, and mesmerizing lead performance.'
      },
      {
        id: 'nom-act-02',
        title: 'Midnight Metro',
        director_name: 'Fahadh Faasil as Raghavan',
        thumbnail_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '25 mins',
        genre: 'Thriller',
        is_winner: false
      },
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        title: 'Blue End Screen: Winter Outro',
        director_name: 'Arvind Swami as The Traveler',
        thumbnail_url: '/images/logo-wordmark.png',
        video_url: '/videos/demo-film.mp4',
        running_time: '14 mins',
        genre: 'Experimental',
        is_winner: false
      }
    ]
  },
  {
    id: 'best-actress',
    name: 'Best Actress',
    group: 'performance',
    description: 'For an outstanding lead performance by a female actor in a short film.',
    nominees: [
      {
        id: 'nom-actress-01',
        title: 'Letters to Ananya',
        director_name: 'Sai Pallavi as Meera',
        thumbnail_url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '19 mins',
        genre: 'Romance',
        is_winner: false
      },
      {
        id: 'nom-actress-02',
        title: 'Borders of Sand',
        director_name: 'Parvathy Thiruvothu as Devi',
        thumbnail_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '28 mins',
        genre: 'Drama',
        is_winner: false
      },
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        title: 'Blue End Screen: Winter Outro',
        director_name: 'Revathi as The Narrator',
        thumbnail_url: '/images/logo-wordmark.png',
        video_url: '/videos/demo-film.mp4',
        running_time: '14 mins',
        genre: 'Visual Art',
        is_winner: false
      }
    ]
  },
  {
    id: 'supporting-actor',
    name: 'Best Supporting Actor',
    group: 'performance',
    description: 'Recognizing crucial dramatic contribution and presence in a supporting role.',
    nominees: [
      {
        id: 'nom-sa-01',
        title: 'The Whispering Palms',
        director_name: 'Kishore as Elder Murugan',
        thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Drama',
        is_winner: false
      },
      {
        id: 'nom-sa-02',
        title: 'Neon Horizon',
        director_name: 'Vijay Sethupathi as Uncle Sam',
        thumbnail_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Neo-Noir',
        is_winner: false
      },
      {
        id: 'nom-sa-03',
        title: 'Solitude at Point Pedro',
        director_name: 'Prakash Raj as Warden',
        thumbnail_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '23 mins',
        genre: 'Mystery',
        is_winner: false
      }
    ]
  },
  {
    id: 'supporting-actress',
    name: 'Best Supporting Actress',
    group: 'performance',
    description: 'Recognizing nuanced dramatic resonance in a supporting role.',
    nominees: [
      {
        id: 'nom-sact-01',
        title: 'Echoes of the Monsoon',
        director_name: 'Urvashi as Mother Lakshmi',
        thumbnail_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '26 mins',
        genre: 'Noir Drama',
        is_winner: false
      },
      {
        id: 'nom-sact-02',
        title: 'Midnight Metro',
        director_name: 'Andrea Jeremiah as Stella',
        thumbnail_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '25 mins',
        genre: 'Thriller',
        is_winner: false
      },
      {
        id: 'nom-sact-03',
        title: 'Children of the Mist',
        director_name: 'Rohini as Amma',
        thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '25 mins',
        genre: 'Drama',
        is_winner: false
      }
    ]
  },
  {
    id: 'cinematography',
    name: 'Best Cinematography',
    group: 'craft',
    description: 'Celebrating mastery in lighting, composition, camera movement, and visual tone.',
    nominees: [
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        title: 'The Whispering Palms',
        director_name: 'Cinematographer: Velraj',
        thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Coastal Drama',
        is_winner: true,
        citation: 'Awarded for breathtaking ocean vistas and exquisite natural light photography.'
      },
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        title: 'Blue End Screen: Winter Outro',
        director_name: 'Cinematographer: P. C. Sreeram',
        thumbnail_url: '/images/logo-wordmark.png',
        video_url: '/videos/demo-film.mp4',
        running_time: '14 mins',
        genre: 'Visual Art',
        is_winner: false
      },
      {
        id: 'nom-cine-03',
        title: 'Dawn Over Sigiriya',
        director_name: 'Cinematographer: Santosh Sivan',
        thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '20 mins',
        genre: 'Landscape Cinema',
        is_winner: false
      }
    ]
  },
  {
    id: 'editing',
    name: 'Best Editing',
    group: 'craft',
    description: 'Honoring rhythm, tension, seamless montage, and narrative velocity.',
    nominees: [
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        title: 'Blue End Screen: Winter Outro',
        director_name: 'Editor: A. Sreekar Prasad',
        thumbnail_url: '/images/logo-wordmark.png',
        video_url: '/videos/demo-film.mp4',
        running_time: '14 mins',
        genre: 'Montage Art',
        is_winner: false
      },
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        title: 'The Whispering Palms',
        director_name: 'Editor: R. Ramar',
        thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Drama',
        is_winner: false
      },
      {
        id: 'nom-ed-03',
        title: 'Midnight Metro',
        director_name: 'Editor: Philomin Raj',
        thumbnail_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '25 mins',
        genre: 'Action Thriller',
        is_winner: false
      }
    ]
  },
  {
    id: 'sound-design',
    name: 'Best Sound Design',
    group: 'craft',
    description: 'Awarded for acoustic atmosphere, foley richness, and sonic immersion.',
    nominees: [
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        title: 'Blue End Screen: Winter Outro',
        director_name: 'Sound: Resul Pookutty',
        thumbnail_url: '/images/logo-wordmark.png',
        video_url: '/videos/demo-film.mp4',
        running_time: '14 mins',
        genre: 'Spatial Audio',
        is_winner: true,
        citation: 'Awarded for rich acoustic textures and pristine spatial audio design.'
      },
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        title: 'The Whispering Palms',
        director_name: 'Sound: Tapass Nayak',
        thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Foley Oceanics',
        is_winner: false
      },
      {
        id: 'nom-sd-03',
        title: 'Neon Horizon',
        director_name: 'Sound: Kunal Rajan',
        thumbnail_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Cyber Foley',
        is_winner: false
      }
    ]
  },
  {
    id: 'original-music',
    name: 'Best Original Music',
    group: 'craft',
    description: 'For the most emotionally evocative and original musical composition and score.',
    nominees: [
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        title: 'Blue End Screen: Winter Outro',
        director_name: 'Composer: A. R. Rahman',
        thumbnail_url: '/images/logo-wordmark.png',
        video_url: '/videos/demo-film.mp4',
        running_time: '14 mins',
        genre: 'Orchestral Score',
        is_winner: false
      },
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        title: 'The Whispering Palms',
        director_name: 'Composer: Santhosh Narayanan',
        thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Acoustic Folk Score',
        is_winner: false
      },
      {
        id: 'nom-mus-03',
        title: 'Midnight Metro',
        director_name: 'Composer: Anirudh Ravichander',
        thumbnail_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '25 mins',
        genre: 'Electronic Synth Score',
        is_winner: false
      }
    ]
  },
  {
    id: 'vfx-animation',
    name: 'Best VFX/Animation Used for Film',
    group: 'craft',
    description: 'Recognizing standout visual effects, CGI integration, and composites within live-action films.',
    nominees: [
      {
        id: 'nom-vfx-01',
        title: 'Fractured Light',
        director_name: 'VFX: FutureWorks Studio',
        thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '16 mins',
        genre: 'Sci-Fi VFX',
        is_winner: false
      },
      {
        id: 'nom-vfx-02',
        title: 'Neon Horizon',
        director_name: 'VFX: Redchillies.vfx',
        thumbnail_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Neo-Noir CG',
        is_winner: false
      },
      {
        id: 'nom-vfx-03',
        title: 'The Mirage in the Sand',
        director_name: 'VFX: Phantom FX',
        thumbnail_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '15 mins',
        genre: 'Atmospheric VFX',
        is_winner: false
      }
    ]
  },
  {
    id: 'student-film',
    name: 'Best Student Film',
    group: 'formats',
    description: 'Honoring the most promising directorial debut and creative ambition by an active film student.',
    nominees: [
      {
        id: 'nom-stu-01',
        title: 'The First Flight',
        director_name: 'Kavin Raj (LV Prasad Film Academy)',
        thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '12 mins',
        genre: 'Student Debut',
        is_winner: false
      },
      {
        id: 'nom-stu-02',
        title: 'Shadows of the Classroom',
        director_name: 'Divya Mohan (FTII Pune)',
        thumbnail_url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '15 mins',
        genre: 'Social Study',
        is_winner: false
      },
      {
        id: 'nom-stu-03',
        title: 'Paper Boats Across Colombo',
        director_name: 'Tharun Kumar (Sri Lanka Media College)',
        thumbnail_url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '11 mins',
        genre: 'Urban Coming-of-Age',
        is_winner: false
      }
    ]
  },
  {
    id: 'animation-film',
    name: 'Best Animation/3D/2D/Stop Motion Film',
    group: 'formats',
    description: 'Dedicated to excellence in animated storytelling across 2D, 3D CGI, and Stop-Motion art.',
    nominees: [
      {
        id: 'nom-ani-01',
        title: 'The Mechanical Forest',
        director_name: 'Anand Sen',
        thumbnail_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '10 mins',
        genre: '3D CGI Animation',
        is_winner: false
      },
      {
        id: 'nom-ani-02',
        title: 'Tale of the Firefly',
        director_name: 'Priya Sundar',
        thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '8 mins',
        genre: '2D Hand-Drawn',
        is_winner: false
      },
      {
        id: 'nom-ani-03',
        title: 'Clay & Time',
        director_name: 'Sanjay Patil',
        thumbnail_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '9 mins',
        genre: 'Stop-Motion',
        is_winner: false
      }
    ]
  },
  {
    id: 'mobile-film',
    name: 'Best Mobile Film',
    group: 'formats',
    description: 'Celebrating cinematic brilliance shot entirely on smartphone / mobile cameras.',
    nominees: [
      {
        id: 'nom-mob-01',
        title: 'One Night in Pettah',
        director_name: 'Roshane Silva (Shot on iPhone 15 Pro Max)',
        thumbnail_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '11 mins',
        genre: 'Mobile Cinema',
        is_winner: false
      },
      {
        id: 'nom-mob-02',
        title: 'Reflections in Rain',
        director_name: 'Ananya Sen (Shot on Samsung Galaxy S24 Ultra)',
        thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '13 mins',
        genre: 'Mobile Poetry',
        is_winner: false
      },
      {
        id: 'nom-mob-03',
        title: 'The Coastal Commute',
        director_name: 'Dinesh Karthik (Shot on Pixel 8 Pro)',
        thumbnail_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '8 mins',
        genre: 'Mobile Docu',
        is_winner: false
      }
    ]
  },
  {
    id: 'ai-film',
    name: 'Best Ai Film',
    group: 'formats',
    description: 'Pioneering work leveraging generative AI visuals, neural rendering, and innovative hybrid cinema.',
    nominees: [
      {
        id: 'nom-ai-01',
        title: 'Neural Dreams of Eden',
        director_name: 'Marcus Vance (Midjourney + Sora)',
        thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '9 mins',
        genre: 'Generative AI Cinema',
        is_winner: false
      },
      {
        id: 'nom-ai-02',
        title: 'Synthetic Memories',
        director_name: 'Elena Rostova (Runway Gen-3)',
        thumbnail_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '12 mins',
        genre: 'Neural Sci-Fi',
        is_winner: false
      },
      {
        id: 'nom-ai-03',
        title: 'Echoes in Latent Space',
        director_name: 'Vikramaditya (Stable Video)',
        thumbnail_url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '7 mins',
        genre: 'Experimental AI',
        is_winner: false
      }
    ]
  },
  {
    id: 'comedy-short',
    name: 'Best Comedy Short Film',
    group: 'formats',
    description: 'Awarded for razor-sharp comedic timing, satire, and engaging entertainment value.',
    nominees: [
      {
        id: 'nom-com-01',
        title: 'The Misplaced Passport',
        director_name: 'Nelson Dilipkumar',
        thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '16 mins',
        genre: 'Dark Comedy',
        is_winner: false
      },
      {
        id: 'nom-com-02',
        title: 'Wedding Shenanigans',
        director_name: 'Basil Joseph',
        thumbnail_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '18 mins',
        genre: 'Family Satire',
        is_winner: false
      },
      {
        id: 'nom-com-03',
        title: 'Overcooked Dosa',
        director_name: 'Venkat Prabhu',
        thumbnail_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '12 mins',
        genre: 'Slapstick Comedy',
        is_winner: false
      }
    ]
  },
  {
    id: 'documentary-short',
    name: 'Best Documentary Short Film',
    group: 'formats',
    description: 'Honoring non-fiction journalistic courage, human truth, and documentary visual craft.',
    nominees: [
      {
        id: 'nom-doc-01',
        title: 'The Last Pearl Divers of Mannar',
        director_name: 'Tariq Ahamed',
        thumbnail_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '29 mins',
        genre: 'Maritime Non-Fiction',
        is_winner: false
      },
      {
        id: 'nom-doc-02',
        title: 'Sounds of the Tea Valleys',
        director_name: 'Nilani Fernando',
        thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '22 mins',
        genre: 'Cultural Docu',
        is_winner: false
      },
      {
        id: 'nom-doc-03',
        title: 'Guardians of the Sanctuary',
        director_name: 'Rohan Wickramasinghe',
        thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
        video_url: '/videos/demo-film.mp4',
        running_time: '25 mins',
        genre: 'Wildlife Conservation',
        is_winner: false
      }
    ]
  }
];

export default function AwardShowcase({ onOpenPlayerModal }) {
  const [categoriesData, setCategoriesData] = useState(DEFAULT_NOMINATIONS);
  const [loading, setLoading] = useState(false);
  const [activeGroup, setActiveGroup] = useState('all');
  
  // Unveil Rule: Nominations are officially unveiled after January 1st, 2027
  // Target: January 1, 2027 00:00:00 UTC
  const UNVEIL_DATE = new Date('2027-01-01T00:00:00Z');
  
  // Local state for countdown & preview toggle
  const [isAfterJan1, setIsAfterJan1] = useState(false);
  const [curatorPreview, setCuratorPreview] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Check if current real-world date is after January 1st, 2027
    const checkDate = () => {
      const now = new Date();
      const diff = UNVEIL_DATE.getTime() - now.getTime();

      if (diff <= 0) {
        setIsAfterJan1(true);
      } else {
        setIsAfterJan1(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    checkDate();
    const timer = setInterval(checkDate, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchNominations();
  }, []);

  const fetchNominations = async () => {
    try {
      const res = await api.get('/nominations').catch(() => api.get('/awards'));
      if (res?.data?.success && res.data.awards) {
        // Merge backend awards data with our 3-nominee structures
        const merged = DEFAULT_NOMINATIONS.map(defCat => {
          const remoteCat = res.data.awards.find(
            r => r.name.toLowerCase() === defCat.name.toLowerCase()
          );
          if (remoteCat && remoteCat.is_awarded && remoteCat.movie) {
            // Update the winner nominee with real movie data from DB
            const updatedNominees = [...defCat.nominees];
            updatedNominees[0] = {
              ...updatedNominees[0],
              ...remoteCat.movie,
              is_winner: true,
              citation: remoteCat.citation || updatedNominees[0].citation,
              recipient_name: remoteCat.recipient_name
            };
            return {
              ...defCat,
              is_awarded: true,
              nominees: updatedNominees
            };
          }
          return defCat;
        });
        setCategoriesData(merged);
      }
    } catch (err) {
      console.warn('Notice loading nominations, using curated 3-nominee showcase:', err);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All 22 Categories' },
    { id: 'grand', label: 'Grand Festival Honors' },
    { id: 'directing_writing', label: 'Directing & Writing' },
    { id: 'performance', label: 'Acting & Performance' },
    { id: 'craft', label: 'Craft & Technical' },
    { id: 'formats', label: 'Formats & Innovation' }
  ];

  const filteredCategories = categoriesData.filter(cat => {
    if (activeGroup === 'all') return true;
    return cat.group === activeGroup;
  });

  const shouldShowNominees = isAfterJan1 || curatorPreview;

  return (
    <section id="nominations" className="relative w-full my-12 scroll-mt-24 space-y-8">
      
      {/* Golden Section Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black border border-gold-500/40 shadow-[0_0_50px_rgba(255,215,0,0.12)] overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 border-b border-gold-500/20 pb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-extrabold text-xs uppercase tracking-widest mb-3">
              <Trophy className="w-3.5 h-3.5 fill-gold-400" /> Official Festival Nominations
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Thirai+ Festival <span className="gold-text-gradient">Official Nominations</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-3 leading-relaxed">
              Celebrating cinematic distinction across <strong>22 official categories</strong>. Each category showcases <strong>3 shortlisted nominated films</strong>. Nominations will be visible & unveiled after <strong>January 1st, 2027</strong>.
            </p>
          </div>

          {/* Quick Stats & Curator Toggle Pill */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-4 bg-black/70 border border-gold-500/30 p-4 rounded-2xl">
              <div className="text-center px-3 border-r border-zinc-800">
                <div className="text-2xl font-black text-gold-400 font-mono">22</div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">Categories</div>
              </div>
              <div className="text-center px-3 border-r border-zinc-800">
                <div className="text-2xl font-black text-white font-mono">66</div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">3 Films / Cat</div>
              </div>
              <div className="text-center px-3">
                <div className="text-2xl font-black text-gold-300 font-mono">Jan 1</div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">Unveil Date</div>
              </div>
            </div>

            {/* Curator Preview Mode Button */}
            {!isAfterJan1 && (
              <button
                onClick={() => setCuratorPreview(!curatorPreview)}
                className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-gold-glow ${
                  curatorPreview
                    ? 'bg-gold-500/20 text-gold-300 border-gold-500/60'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-gold-500/40'
                }`}
                title="Toggle curator inspection to preview the 3 nominated films per category"
              >
                {curatorPreview ? (
                  <>
                    <Unlock className="w-4 h-4 text-gold-400" />
                    <span>Curator Preview: Active</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-gold-400" />
                    <span>Preview 3 Nominees</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="relative z-10 pt-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveGroup(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeGroup === tab.id
                  ? 'bg-gold-gradient text-black shadow-gold-glow font-black'
                  : 'bg-black/60 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Gating: Before Jan 1st Notice & Live Countdown Banner */}
      {!shouldShowNominees && (
        <div className="relative rounded-3xl p-8 sm:p-12 bg-surface-card border-2 border-dashed border-gold-500/40 text-center space-y-6 shadow-gold-glow">
          <div className="w-16 h-16 rounded-2xl bg-gold-gradient p-0.5 shadow-gold-glow mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Lock className="w-8 h-8 text-gold-400 animate-pulse" />
            </div>
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="inline-block text-[11px] font-mono font-bold text-gold-400 uppercase tracking-widest bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30">
              Official Unveil Announcement
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Official Nominations Unveiled After January 1st
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Jury evaluations and community voting are currently underway. The <strong>3 official nominated short films</strong> for each of our 22 categories will be publicly unveiled on <strong>January 1, 2027</strong>.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 pt-2">
            <div className="bg-black/80 border border-gold-500/30 rounded-2xl p-3 sm:p-4 min-w-[70px] sm:min-w-[85px]">
              <div className="text-2xl sm:text-3xl font-black text-gold-400 font-mono">{timeLeft.days}</div>
              <div className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400">Days</div>
            </div>
            <div className="text-gold-500 font-black text-xl">:</div>
            <div className="bg-black/80 border border-gold-500/30 rounded-2xl p-3 sm:p-4 min-w-[70px] sm:min-w-[85px]">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400">Hours</div>
            </div>
            <div className="text-gold-500 font-black text-xl">:</div>
            <div className="bg-black/80 border border-gold-500/30 rounded-2xl p-3 sm:p-4 min-w-[70px] sm:min-w-[85px]">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400">Mins</div>
            </div>
            <div className="text-gold-500 font-black text-xl">:</div>
            <div className="bg-black/80 border border-gold-500/30 rounded-2xl p-3 sm:p-4 min-w-[70px] sm:min-w-[85px]">
              <div className="text-2xl sm:text-3xl font-black text-gold-400 font-mono">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400">Secs</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setCuratorPreview(true)}
              className="gold-btn px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-bold inline-flex items-center gap-2 shadow-gold-glow"
            >
              <Eye className="w-4 h-4" /> Preview 3 Nominees Per Category (Curator Mode)
            </button>
          </div>
        </div>
      )}

      {/* Nominations Showcase Grid: 22 Categories, Each Showcasing 3 Nominated Films */}
      {shouldShowNominees && (
        <div className="space-y-8">
          {curatorPreview && !isAfterJan1 && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>Curator Preview Active: Inspecting the 3 official nominated films per category before January 1st unveil.</span>
              </div>
              <button
                onClick={() => setCuratorPreview(false)}
                className="text-[11px] underline hover:text-white font-bold"
              >
                Close Preview
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCategories.map((category) => (
              <div
                key={category.name}
                className="relative rounded-3xl bg-zinc-950/80 border border-gold-500/30 p-6 space-y-5 hover:border-gold-400/80 transition-all shadow-gold-glow flex flex-col justify-between"
              >
                {/* Category Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gold-gradient p-0.5 shrink-0 flex items-center justify-center">
                        <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-gold-400" />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-gold-400 tracking-wider block">
                          Official Nomination Category
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                          {category.name}
                        </h3>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/40 text-gold-400 text-[10px] font-mono font-bold shrink-0">
                      3 Nominees
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mt-1 mb-4">
                    {category.description}
                  </p>

                  {/* 3 Nominated Films Grid */}
                  <div className="space-y-3">
                    <div className="text-[10px] uppercase font-extrabold text-zinc-500 tracking-wider flex items-center gap-1.5">
                      <Clapperboard className="w-3.5 h-3.5 text-gold-400" /> Shortlisted Nominated Films (3)
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {category.nominees.map((nominee, idx) => (
                        <div
                          key={nominee.id || idx}
                          className={`group relative rounded-2xl overflow-hidden border transition-all flex flex-col justify-between p-3 ${
                            nominee.is_winner
                              ? 'bg-gold-500/10 border-gold-500/60 shadow-gold-glow'
                              : 'bg-surface-card/60 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {/* Nominee Thumbnail */}
                          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800 mb-2.5">
                            <img
                              src={nominee.thumbnail_url || '/images/logo-wordmark.png'}
                              alt={nominee.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Badge */}
                            <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                              nominee.is_winner
                                ? 'bg-gold-500 text-black shadow-gold-glow'
                                : 'bg-black/70 text-zinc-300 border border-zinc-700'
                            }`}>
                              {nominee.is_winner ? '🏆 Laureled' : `Nominee #${idx + 1}`}
                            </span>

                            {/* Floating Play Button */}
                            <button
                              onClick={() => onOpenPlayerModal && onOpenPlayerModal(nominee)}
                              className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-gold-gradient text-black flex items-center justify-center shadow-gold-glow opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"
                              title="Watch Stream"
                            >
                              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                            </button>
                          </div>

                          {/* Nominee Metadata */}
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-gold-300 transition-colors" title={nominee.title}>
                              {nominee.title}
                            </h4>
                            <p className="text-[10px] text-zinc-400 line-clamp-1">
                              {nominee.director_name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-medium">
                              <span>{nominee.genre}</span>
                              {nominee.running_time && (
                                <>
                                  <span>•</span>
                                  <span>{nominee.running_time}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Watch / Laurel Button */}
                          <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-gold-400">
                              {nominee.is_winner ? 'Winner Laurel' : 'Official Shortlist'}
                            </span>
                            <button
                              onClick={() => onOpenPlayerModal && onOpenPlayerModal(nominee)}
                              className="text-[10px] font-bold text-zinc-300 hover:text-gold-300 flex items-center gap-0.5 transition-colors"
                            >
                              Watch <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer with Category Status */}
                <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="inline-flex items-center gap-1 text-gold-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 3 Nominated Films Unveiled
                  </span>
                  <span className="font-mono text-zinc-500 text-[10px]">
                    2026/2027 Season
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
}
