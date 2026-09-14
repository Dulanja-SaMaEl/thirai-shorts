import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { userStore } from '../config/userStore.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

export const DEFAULT_SPONSORS = [
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    product: 'R2 & Stream',
    tier: 'headline',
    role: 'Official Cloud Infrastructure Partner',
    category: 'Cloud & Media Delivery',
    tag: 'Global Edge Network',
    description: 'Powering secure zero-egress media storage and ultra-low latency worldwide cinema streaming for Thirai+ filmmakers.',
    website_url: 'https://www.cloudflare.com',
    logo_url: '',
    is_active: true,
    display_order: 1
  },
  {
    id: 'dolby',
    name: 'Dolby',
    product: 'Vision • Atmos',
    tier: 'headline',
    role: 'Official Cinema Sound & Color Partner',
    category: 'Acoustics & Visual Tech',
    tag: 'Immersive Experience',
    description: 'Setting spatial acoustic fidelity and dynamic color mastering standards for our festival official competition.',
    website_url: 'https://www.dolby.com',
    logo_url: '',
    is_active: true,
    display_order: 2
  },
  {
    id: 'blackmagic',
    name: 'Blackmagic Design',
    product: 'DaVinci Resolve Studio',
    tier: 'headline',
    role: 'Official Post-Production Partner',
    category: 'Color Grading & Finishing',
    tag: 'Industry Standard',
    description: 'Providing advanced color correction and digital mastering suites to help independent directors bring cinema vision to life.',
    website_url: 'https://www.blackmagicdesign.com',
    logo_url: '',
    is_active: true,
    display_order: 3
  },
  {
    id: 'arri',
    name: 'ARRI',
    product: 'Cinema Systems & Optics',
    tier: 'headline',
    role: 'Official Digital Cinematography Partner',
    category: 'Optics & Camera Guild',
    tag: 'Cinema Heritage',
    description: 'Celebrating exceptional cinematic texture, dynamic latitude, and high-fidelity optical craft in short filmmaking.',
    website_url: 'https://www.arri.com',
    logo_url: '',
    is_active: true,
    display_order: 4
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    product: 'Global Checkout',
    tier: 'guild',
    role: 'Global Payment & Billing Partner',
    category: 'Financial Infrastructure',
    tag: '135+ Currencies',
    description: 'Secure multi-currency ticket and token transaction processing.',
    website_url: 'https://stripe.com',
    logo_url: '',
    is_active: true,
    display_order: 5
  },
  {
    id: 'sony',
    name: 'Sony CineAlta',
    product: 'FX Cinema Series',
    tier: 'guild',
    role: 'Cinematography Camera Guild Associate',
    category: 'Camera Guild',
    tag: 'CineAlta FX Guild',
    description: 'Supporting independent cinematographers with high-end sensor technology.',
    website_url: 'https://pro.sony',
    logo_url: '',
    is_active: true,
    display_order: 6
  },
  {
    id: 'sennheiser',
    name: 'Sennheiser Pro Audio',
    product: 'MKH & EW Series',
    tier: 'guild',
    role: 'Official Acoustic & Audio Partner',
    category: 'Sound Capture',
    tag: 'Studio Sound',
    description: 'On-location shotgun microphones and wireless production audio.',
    website_url: 'https://www.sennheiser.com',
    logo_url: '',
    is_active: true,
    display_order: 7
  },
  {
    id: 'nfc',
    name: 'National Film Corporation (NFC)',
    product: 'Sri Lanka Film Guild',
    tier: 'guild',
    role: 'Institutional & Cultural Associate',
    category: 'Cultural Guild',
    tag: 'Sri Lanka',
    description: 'Preserving Sri Lankan cinematic heritage and nurturing emerging talent.',
    website_url: 'http://www.nfc.gov.lk',
    logo_url: '',
    is_active: true,
    display_order: 8
  },
  {
    id: 'filmfreeway',
    name: 'FilmFreeway',
    product: 'Festival Network',
    tier: 'guild',
    role: 'Global Submission Platform Associate',
    category: 'Submission Portal',
    tag: 'Verified Festival',
    description: 'Connecting world short film submissions directly to Thirai+.',
    website_url: 'https://filmfreeway.com',
    logo_url: '',
    is_active: true,
    display_order: 9
  }
];

// Helper to retrieve current sponsors list
async function getSponsorsList() {
  let list = userStore.getSetting('festival_sponsors');
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', 'festival_sponsors')
        .maybeSingle();

      if (!error && data && Array.isArray(data.value)) {
        list = data.value;
        userStore.setSetting('festival_sponsors', list);
      }
    } catch (e) {
      console.warn('Supabase fetch sponsors error:', e.message);
    }
  }

  if (!list || !Array.isArray(list) || list.length === 0) {
    list = DEFAULT_SPONSORS;
    userStore.setSetting('festival_sponsors', list);
  }

  return list;
}

// Helper to persist sponsors list
async function saveSponsorsList(list) {
  userStore.setSetting('festival_sponsors', list);
  if (isSupabaseConfigured) {
    try {
      await supabaseAdmin
        .from('system_settings')
        .upsert({
          key: 'festival_sponsors',
          value: list,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
    } catch (e) {
      console.warn('Supabase save sponsors error:', e.message);
    }
  }
  return list;
}

/**
 * @route GET /api/sponsors
 * @desc Public endpoint to get all active festival sponsors & partners
 */
router.get('/', async (req, res) => {
  try {
    const list = await getSponsorsList();
    const sorted = [...list].sort((a, b) => (a.display_order || 99) - (b.display_order || 99));
    return res.status(200).json({ success: true, sponsors: sorted });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return res.status(200).json({ success: true, sponsors: DEFAULT_SPONSORS });
  }
});

/**
 * @route POST /api/sponsors
 * @desc Add a new Sponsor (Admin only)
 */
router.post('/', requireAuth(['admin']), async (req, res) => {
  try {
    const { name, product, tier, role, category, tag, description, website_url, logo_url } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'Sponsor Name and Partnership Role are required.' });
    }

    const currentList = await getSponsorsList();
    const newSponsor = {
      id: `sponsor-${Date.now()}`,
      name: name.trim(),
      product: (product || '').trim(),
      tier: tier === 'guild' ? 'guild' : 'headline',
      role: role.trim(),
      category: (category || 'Industry Partner').trim(),
      tag: (tag || 'Official Partner').trim(),
      description: (description || '').trim(),
      website_url: (website_url || '').trim(),
      logo_url: (logo_url || '').trim(),
      is_active: true,
      display_order: currentList.length + 1,
      created_at: new Date().toISOString()
    };

    const updatedList = [newSponsor, ...currentList];
    await saveSponsorsList(updatedList);

    return res.status(201).json({
      success: true,
      message: `Sponsor "${newSponsor.name}" added successfully.`,
      sponsor: newSponsor,
      sponsors: updatedList
    });
  } catch (error) {
    console.error('Error adding sponsor:', error);
    return res.status(500).json({ error: 'Failed to add sponsor.' });
  }
});

/**
 * @route PUT /api/sponsors/:id
 * @desc Update an existing Sponsor (Admin only)
 */
router.put('/:id', requireAuth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, product, tier, role, category, tag, description, website_url, logo_url, is_active, display_order } = req.body;

    const currentList = await getSponsorsList();
    const index = currentList.findIndex(s => s.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Sponsor not found.' });
    }

    const updatedSponsor = {
      ...currentList[index],
      name: name !== undefined ? name.trim() : currentList[index].name,
      product: product !== undefined ? product.trim() : currentList[index].product,
      tier: tier !== undefined ? tier : currentList[index].tier,
      role: role !== undefined ? role.trim() : currentList[index].role,
      category: category !== undefined ? category.trim() : currentList[index].category,
      tag: tag !== undefined ? tag.trim() : currentList[index].tag,
      description: description !== undefined ? description.trim() : currentList[index].description,
      website_url: website_url !== undefined ? website_url.trim() : currentList[index].website_url,
      logo_url: logo_url !== undefined ? logo_url.trim() : currentList[index].logo_url,
      is_active: typeof is_active === 'boolean' ? is_active : currentList[index].is_active,
      display_order: typeof display_order === 'number' ? display_order : currentList[index].display_order,
      updated_at: new Date().toISOString()
    };

    currentList[index] = updatedSponsor;
    await saveSponsorsList(currentList);

    return res.status(200).json({
      success: true,
      message: `Sponsor "${updatedSponsor.name}" updated successfully.`,
      sponsor: updatedSponsor,
      sponsors: currentList
    });
  } catch (error) {
    console.error('Error updating sponsor:', error);
    return res.status(500).json({ error: 'Failed to update sponsor.' });
  }
});

/**
 * @route DELETE /api/sponsors/:id
 * @desc Delete a Sponsor (Admin only)
 */
router.delete('/:id', requireAuth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const currentList = await getSponsorsList();
    const updatedList = currentList.filter(s => s.id !== id);

    await saveSponsorsList(updatedList);

    return res.status(200).json({
      success: true,
      message: 'Sponsor removed successfully.',
      sponsors: updatedList
    });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    return res.status(500).json({ error: 'Failed to delete sponsor.' });
  }
});

/**
 * @route POST /api/sponsors/reset
 * @desc Reset sponsors to standard festival default partners (Admin only)
 */
router.post('/reset', requireAuth(['admin']), async (req, res) => {
  try {
    await saveSponsorsList(DEFAULT_SPONSORS);
    return res.status(200).json({
      success: true,
      message: 'Sponsors reset to default festival partners.',
      sponsors: DEFAULT_SPONSORS
    });
  } catch (error) {
    console.error('Error resetting sponsors:', error);
    return res.status(500).json({ error: 'Failed to reset sponsors.' });
  }
});

export default router;
