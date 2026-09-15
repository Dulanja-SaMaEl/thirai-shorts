import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { userStore } from '../config/userStore.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

export const DEFAULT_JUDGES = [
  {
    id: 'steven-spielberg',
    name: 'Judge Steven Spielberg',
    nativeName: 'Steven Spielberg',
    role: 'Honorary International Advisory Chair',
    division: 'advisory',
    divisionLabel: 'International Advisory',
    country: 'United States',
    countryFlag: '🇺🇸',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    achievements: [
      '3× Academy Award Winner (Best Director & Best Picture)',
      'AFI Life Achievement Award Laureate',
      'Director of Schindler\'s List, Saving Private Ryan, Jurassic Park'
    ],
    specializations: ['Master Directing', 'Narrative Arc', 'Universal Storytelling'],
    quote: 'A great short film doesn\'t waste a single frame. In ten or twenty minutes, it has to touch the human condition in a way that stays with you forever.',
    bio: 'Renowned worldwide as one of the most influential filmmakers in cinema history, Steven Spielberg serves as the Honorary Advisory Chair for the Thirai+ Film Festival. His mentorship champions visionary emerging storytellers who harness the power of visual cinema to unite diverse audiences across cultures.',
    criteria: 'Emotional resonance, clarity of visual perspective, and mastery of narrative economy.'
  },
  {
    id: 'prasanna-vithanage',
    name: 'Prasanna Vithanage',
    nativeName: 'ප්‍රසන්න විතානගේ',
    role: 'Grand Jury Co-President • World Cinema',
    division: 'direction',
    divisionLabel: 'Direction & Screenplay',
    country: 'Sri Lanka',
    countryFlag: '🇱🇰',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    achievements: [
      'Winner of 35+ International Festival Awards',
      'Rotterdam, Amiens, Fribourg & IFFK Grand Prix Laureate',
      'Acclaimed Director of Death on a Full Moon Day & Gaadi'
    ],
    specializations: ['Poetic Realism', 'Political Subtext', 'Humanistic Cinema'],
    quote: 'Cinema begins where political borders end. We look for short films that dare to speak unvarnished truth with quiet, poetic restraint.',
    bio: 'Prasanna Vithanage is widely hailed as a pioneer of contemporary Sri Lankan independent cinema. His films have screened at premier festivals worldwide, confronting challenging historical, social, and human realities with profound lyrical sensitivity and rigorous craft.',
    criteria: 'Subtextual richness, authentic character psychology, and original voice.'
  },
  {
    id: 'vetri-maaran',
    name: 'Vetri Maaran',
    nativeName: 'வெற்றி மாறன்',
    role: 'Grand Jury Co-President • Social Realism',
    division: 'direction',
    divisionLabel: 'Direction & Screenplay',
    country: 'India',
    countryFlag: '🇮🇳',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
    achievements: [
      '5× National Film Award Winner',
      'Venice International Film Festival Orizzonti Nominee',
      'Visionary Director of Asuran, Visaranai, and Vadachennai'
    ],
    specializations: ['Gritty Realism', 'Screenplay Craft', 'Sociopolitical Drama'],
    quote: 'The rawest and most potent stories belong to the soil. We celebrate filmmakers who refuse to compromise their creative instincts for superficial gloss.',
    bio: 'Vetri Maaran stands among India\'s most celebrated cinematic auteurs. His groundbreaking work has earned five National Film Awards and represented India at the Oscars. Known for visceral authenticity, complex multi-layered scripts, and unrelenting dramatic power.',
    criteria: 'Organic screenwriting, fearless thematic courage, and dramatic pacing.'
  },
  {
    id: 'santosh-sivan',
    name: 'Santosh Sivan ASC, ISC',
    nativeName: 'சந்தோஷ் சிவன்',
    role: 'Head of Cinematography Jury',
    division: 'craft',
    divisionLabel: 'Cinematography & Craft',
    country: 'India',
    countryFlag: '🇮🇳',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
    achievements: [
      'Pierre Angénieux Tribute Laureate (Cannes 2024)',
      '12× National Film Awards for Cinematography & Direction',
      'First South Asian Member of the American Society of Cinematographers'
    ],
    specializations: ['Visual Composition', 'Natural Lighting', 'Cinematic Texture'],
    quote: 'Every shadow tells a secret. The visual language of a short film should speak deeply to the viewer even before the characters utter a word.',
    bio: 'Santosh Sivan ASC, ISC is a global luminary of visual cinematography. Honored at the Cannes Film Festival with the prestigious Pierre Angénieux Tribute, his visionary lens work on The Terrorist, Iruvar, and Asoka redefined visual poetry in world cinema.',
    criteria: 'Lighting architecture, intentional aspect ratios, and visual storytelling without reliance on dialogue.'
  },
  {
    id: 'resul-pookutty',
    name: 'Resul Pookutty CAS',
    nativeName: 'റസൂൽ പൂക്കുട്ടി',
    role: 'Head of Sound Design & Audiography',
    division: 'sound',
    divisionLabel: 'Sound & Editing',
    country: 'India',
    countryFlag: '🇮🇳',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    achievements: [
      'Academy Award Winner (Best Sound Mixing)',
      'BAFTA Award & Cinema Audio Society Award Laureate',
      'National Film Award for Best Audiography'
    ],
    specializations: ['Foley Artistry', 'Immersive Soundscapes', 'Acoustic Clarity'],
    quote: 'Sound is fifty percent of cinematic emotion. In short films, subtle acoustic nuances can turn an ordinary scene into pure visual poetry.',
    bio: 'Oscar-winner Resul Pookutty CAS is an internationally revered sound designer and mixer. His historic Academy Award and BAFTA wins for Slumdog Millionaire brought global attention to acoustic storytelling. He leads the evaluation for Thirai+\'s Best Sound Design category.',
    criteria: 'Spatial sound depth, dialogue intelligibility, dynamic audio range, and musical balance.'
  },
  {
    id: 'bina-paul',
    name: 'Bina Paul',
    nativeName: 'ബീන പോൾ',
    role: 'Head of Editing & Narrative Rhythm',
    division: 'sound',
    divisionLabel: 'Sound & Editing',
    country: 'India',
    countryFlag: '🇮🇳',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    achievements: [
      '2× National Film Award for Best Film Editing',
      'Long-serving Artistic Director of IFFK',
      'Vice Chairperson of Kerala State Chalachitra Academy'
    ],
    specializations: ['Montage Theory', 'Tempo & Cadence', 'Documentary Structure'],
    quote: 'Editing is the rhythm of thought. In a short film, the exact timing between two cuts can make the entire universe breathe.',
    bio: 'Two-time National Award-winning editor Bina Paul is celebrated as a transformative force in independent Indian and regional cinema. Having edited over 50 acclaimed features and documentaries, she serves as a leading champion for progressive narrative structures.',
    criteria: 'Cutting discipline, temporal flow, elliptical storytelling, and elimination of narrative flab.'
  },
  {
    id: 'niranjani-shanmugaraja',
    name: 'Niranjani Shanmugaraja',
    nativeName: 'நிரஞ்சனி சண்முகராஜா',
    role: 'Jury Member • Dramatic Arts & Performance',
    division: 'direction',
    divisionLabel: 'Direction & Screenplay',
    country: 'Sri Lanka',
    countryFlag: '🇱🇰',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80',
    achievements: [
      'Derana Lux Film Award for Best Actress',
      'Sarasaviya Award Winner',
      'Lead Actress in Ini Avan & acclaimed theatrical drama works'
    ],
    specializations: ['Actor Direction', 'Authentic Expression', 'Subtle Emotional Delivery'],
    quote: 'Acting is the bridge between human pain and empathy. We seek performances that feel truly lived, never performed.',
    bio: 'Niranjani Shanmugaraja is an award-winning Sri Lankan film and theatrical actress. Her lead role in Asoka Handagama\'s Cannes-selected Ini Avan cemented her stature as one of South Asia\'s most compelling acting talents, bringing immense insight to judging performance categories.',
    criteria: 'Actor authenticity, emotional restraint, chemistry, and non-verbal vulnerability.'
  },
  {
    id: 'claire-dubois',
    name: 'Claire Dubois',
    nativeName: 'Claire Dubois',
    role: 'Senior Jury Member • International Programming',
    division: 'advisory',
    divisionLabel: 'International Advisory',
    country: 'France / UK',
    countryFlag: '🇫🇷',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&auto=format&fit=crop&q=80',
    achievements: [
      'Clermont-Ferrand Short Film Festival Selection Committee',
      'European Film Academy (EFA) Member',
      'Curator of Global Independent Shorts & Documentary Showcases'
    ],
    specializations: ['Short Film Format', 'Global Curation', 'Experimental Cinema'],
    quote: 'Short cinema is not a training ground for feature films — it is an autonomous, fearless art form with boundless creative audacity.',
    bio: 'Claire Dubois has dedicated over 15 years to programming short-form cinema across Europe\'s most revered festivals, including Clermont-Ferrand and London Short Film Festival. Her keen eye discovers original cinematic voices across world territories.',
    criteria: 'Inventive use of the short form, cultural specificity with universal resonance, and daring concepts.'
  }
];

// Helper to retrieve current festival judges list
async function getJudgesList() {
  let list = userStore.getSetting('festival_judges');
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', 'festival_judges')
        .maybeSingle();

      if (!error && data && Array.isArray(data.value) && data.value.length > 0) {
        list = data.value;
        userStore.setSetting('festival_judges', list);
      }
    } catch (e) {
      console.warn('Supabase fetch judges error:', e.message);
    }
  }

  if (!list || !Array.isArray(list) || list.length === 0) {
    list = DEFAULT_JUDGES;
    userStore.setSetting('festival_judges', list);
  }

  return list;
}

// Helper to persist judges list
async function saveJudgesList(list) {
  userStore.setSetting('festival_judges', list);
  if (isSupabaseConfigured) {
    try {
      await supabaseAdmin
        .from('system_settings')
        .upsert({
          key: 'festival_judges',
          value: list,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
    } catch (e) {
      console.warn('Supabase save judges error:', e.message);
    }
  }
  return list;
}

/**
 * @route GET /api/judges
 * @desc Public endpoint to get all active festival judges
 */
router.get('/', async (req, res) => {
  try {
    const list = await getJudgesList();
    return res.status(200).json({ success: true, judges: list });
  } catch (error) {
    console.error('Error fetching judges:', error);
    return res.status(200).json({ success: true, judges: DEFAULT_JUDGES });
  }
});

/**
 * @route POST /api/judges
 * @desc Add a new Festival Judge (Admin only)
 */
router.post('/', requireAuth(['admin']), async (req, res) => {
  try {
    const {
      name,
      nativeName,
      role,
      division,
      divisionLabel,
      country,
      countryFlag,
      image,
      achievements,
      specializations,
      quote,
      bio,
      criteria
    } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'Judge Name and Position/Role are required.' });
    }

    const currentList = await getJudgesList();
    const newJudge = {
      id: `judge-${Date.now()}`,
      name: name.trim(),
      nativeName: (nativeName || name).trim(),
      role: role.trim(),
      division: division || 'direction',
      divisionLabel: divisionLabel || 'Direction & Screenplay',
      country: (country || 'Sri Lanka').trim(),
      countryFlag: (countryFlag || '🇱🇰').trim(),
      image: image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
      achievements: Array.isArray(achievements)
        ? achievements
        : typeof achievements === 'string' && achievements.trim()
          ? achievements.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
      specializations: Array.isArray(specializations)
        ? specializations
        : typeof specializations === 'string' && specializations.trim()
          ? specializations.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      quote: (quote || '').trim(),
      bio: (bio || '').trim(),
      criteria: (criteria || '').trim(),
      created_at: new Date().toISOString()
    };

    const updatedList = [...currentList, newJudge];
    await saveJudgesList(updatedList);

    return res.status(201).json({
      success: true,
      message: `Judge "${newJudge.name}" added to festival jury board.`,
      judge: newJudge,
      judges: updatedList
    });
  } catch (error) {
    console.error('Error adding judge:', error);
    return res.status(500).json({ error: 'Failed to add judge.' });
  }
});

/**
 * @route PUT /api/judges/:id
 * @desc Update an existing Festival Judge (Admin only)
 */
router.put('/:id', requireAuth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const currentList = await getJudgesList();
    const index = currentList.findIndex(j => j.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Judge not found.' });
    }

    const body = req.body;
    const updatedJudge = {
      ...currentList[index],
      name: body.name !== undefined ? body.name.trim() : currentList[index].name,
      nativeName: body.nativeName !== undefined ? body.nativeName.trim() : currentList[index].nativeName,
      role: body.role !== undefined ? body.role.trim() : currentList[index].role,
      division: body.division !== undefined ? body.division : currentList[index].division,
      divisionLabel: body.divisionLabel !== undefined ? body.divisionLabel : currentList[index].divisionLabel,
      country: body.country !== undefined ? body.country.trim() : currentList[index].country,
      countryFlag: body.countryFlag !== undefined ? body.countryFlag.trim() : currentList[index].countryFlag,
      image: body.image !== undefined ? body.image : currentList[index].image,
      achievements: body.achievements !== undefined
        ? (Array.isArray(body.achievements) ? body.achievements : body.achievements.split('\n').map(s => s.trim()).filter(Boolean))
        : currentList[index].achievements,
      specializations: body.specializations !== undefined
        ? (Array.isArray(body.specializations) ? body.specializations : body.specializations.split(',').map(s => s.trim()).filter(Boolean))
        : currentList[index].specializations,
      quote: body.quote !== undefined ? body.quote.trim() : currentList[index].quote,
      bio: body.bio !== undefined ? body.bio.trim() : currentList[index].bio,
      criteria: body.criteria !== undefined ? body.criteria.trim() : currentList[index].criteria,
      updated_at: new Date().toISOString()
    };

    currentList[index] = updatedJudge;
    await saveJudgesList(currentList);

    return res.status(200).json({
      success: true,
      message: `Judge "${updatedJudge.name}" updated successfully.`,
      judge: updatedJudge,
      judges: currentList
    });
  } catch (error) {
    console.error('Error updating judge:', error);
    return res.status(500).json({ error: 'Failed to update judge.' });
  }
});

/**
 * @route DELETE /api/judges/:id
 * @desc Delete a Judge from the jury board (Admin only)
 */
router.delete('/:id', requireAuth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const currentList = await getJudgesList();
    const updatedList = currentList.filter(j => j.id !== id);

    await saveJudgesList(updatedList);

    return res.status(200).json({
      success: true,
      message: 'Judge removed from jury board.',
      judges: updatedList
    });
  } catch (error) {
    console.error('Error deleting judge:', error);
    return res.status(500).json({ error: 'Failed to delete judge.' });
  }
});

/**
 * @route POST /api/judges/reset
 * @desc Reset judges to standard 8 Grand Jurors (Admin only)
 */
router.post('/reset', requireAuth(['admin']), async (req, res) => {
  try {
    await saveJudgesList(DEFAULT_JUDGES);
    return res.status(200).json({
      success: true,
      message: 'Jury board reset to official 8 Grand Jurors.',
      judges: DEFAULT_JUDGES
    });
  } catch (error) {
    console.error('Error resetting judges:', error);
    return res.status(500).json({ error: 'Failed to reset judges.' });
  }
});

export default router;
