import api from './api';

/**
 * Mahalaxmi Novelties — AI Jewellery Stylist & Wholesale Advisor
 * Routes AI requests through the backend so keys remain secure on the server
 * and product links match live database IDs.
 */

const SHOWROOM_CATALOGUE = [
  { id: 1, name: 'Royal Kemp Stone Antique Kada / Bajuband Pair', sku: 'MN-VJ-1250', category: 'patli-bangles', retail_price: 2650, wholesale_price: 1250 },
  { id: 12, name: 'Classic Micro-Gold Daily Wear Patli Bangles Set of 4', sku: 'MN-PB-450', category: 'patli-bangles', retail_price: 899, wholesale_price: 450 },
  { id: 13, name: 'Diamond-Cut Textured Royal 1-Gram Gold Patli Bangle Set of 4', sku: 'MN-PB-850', category: 'patli-bangles', retail_price: 1699, wholesale_price: 850 },
  { id: 14, name: 'Antique Temple Nakshi Elephant Face Kada Single', sku: 'MN-PB-950', category: 'patli-bangles', retail_price: 1899, wholesale_price: 950 },
  { id: 2, name: 'Heritage Temple Haram Long Necklace with Floral Pendant', sku: 'MN-NK-1080', category: 'necklaces', retail_price: 2450, wholesale_price: 1080 },
  { id: 15, name: 'Royal Lakshmi Kasu Malai Antique Long Temple Haram', sku: 'MN-NK-1450', category: 'necklaces', retail_price: 2899, wholesale_price: 1450 },
  { id: 16, name: 'Traditional Peacock Nakshi Bridal Choker with Kemp Stones', sku: 'MN-NK-980', category: 'necklaces', retail_price: 1950, wholesale_price: 980 },
  { id: 17, name: 'Grand Manga Malai South Indian Heritage Haram', sku: 'MN-NK-1650', category: 'necklaces', retail_price: 3299, wholesale_price: 1650 },
  { id: 18, name: 'Royal Heritage Agra Meenakari Enamelled Bridal Payal Pair', sku: 'MN-AP-650', category: 'agra-payal', retail_price: 1299, wholesale_price: 650 },
  { id: 19, name: 'Genuine Agra Daily-Wear Silver Coated Ghungroo Payal Pair', sku: 'MN-AP-350', category: 'agra-payal', retail_price: 699, wholesale_price: 350 },
  { id: 20, name: 'Traditional Broad Bridal Agra Chandi Finish Payal Pair', sku: 'MN-AP-480', category: 'agra-payal', retail_price: 999, wholesale_price: 480 },
  { id: 21, name: 'Handcrafted Agra Daily Silver Anklet with Delicate Beads', sku: 'MN-AP-220', category: 'agra-payal', retail_price: 450, wholesale_price: 220 },
  { id: 3, name: 'Classic Kemp Stone Floral Pendant Long Chain', sku: 'MN-CH-650', category: 'matte-cz-jewellery', retail_price: 1450, wholesale_price: 650 },
  { id: 22, name: 'Premium Ruby-Green Kemp Bridal Choker Set with Matching Jhumkas', sku: 'MN-CZ-850', category: 'matte-cz-jewellery', retail_price: 1750, wholesale_price: 850 },
  { id: 23, name: 'Matte Antique Goddess Lakshmi Pendant Necklace Set', sku: 'MN-CZ-1150', category: 'matte-cz-jewellery', retail_price: 2299, wholesale_price: 1150 },
  { id: 4, name: 'Micro Gold Flat Mesh Mangalsutra Chain with Black Beads', sku: 'MN-RG-700', category: 'roldgold-guarantee-chains', retail_price: 1550, wholesale_price: 700 },
  { id: 5, name: 'Dual Strand Box Link Gold Chain with Black Bead Stations', sku: 'MN-RG-1050', category: 'roldgold-guarantee-chains', retail_price: 2250, wholesale_price: 1050 },
  { id: 6, name: 'Traditional Double Strand 1-Gram Gold Chain with Clusters', sku: 'MN-RG-1200', category: 'roldgold-guarantee-chains', retail_price: 2600, wholesale_price: 1200 },
  { id: 7, name: 'Heritage Double Strand Gold Box Chain with Black Crystals', sku: 'MN-RG-1250', category: 'roldgold-guarantee-chains', retail_price: 2750, wholesale_price: 1250 },
  { id: 8, name: 'Premium Double Flat Ribbon 1-Gram Gold Thali Chain', sku: 'MN-RG-1500', category: 'roldgold-guarantee-chains', retail_price: 3250, wholesale_price: 1500 },
  { id: 9, name: 'Royal Double Layered Thali Chain with Black Bead Motifs', sku: 'MN-RG-1550', category: 'roldgold-guarantee-chains', retail_price: 3400, wholesale_price: 1550 },
  { id: 10, name: 'Broad Double Strand Fancy Link Gold Chain with Black Beads', sku: 'MN-RG-1800', category: 'roldgold-guarantee-chains', retail_price: 3950, wholesale_price: 1800 },
  { id: 11, name: 'Opulent Grand 36-Inch Double Strand Bridal Gold Chain', sku: 'MN-RG-2500', category: 'roldgold-guarantee-chains', retail_price: 5400, wholesale_price: 2500 },
  { id: 24, name: 'Adjustable Floral CZ Micro-Gold Plated Finger Ring', sku: 'MN-FR-280', category: 'finger-rings-lockets', retail_price: 599, wholesale_price: 280 },
  { id: 25, name: 'Auspicious Lord Ganesha Embossed 1-Gram Gold Temple Locket', sku: 'MN-LK-320', category: 'finger-rings-lockets', retail_price: 650, wholesale_price: 320 },
  { id: 26, name: 'Goddess Mahalakshmi Heritage Coin Pendant Locket', sku: 'MN-LK-380', category: 'finger-rings-lockets', retail_price: 799, wholesale_price: 380 }
];

export const isGeminiConfigured = import.meta.env.VITE_ENABLE_AI_FEATURES !== 'false';

export async function checkAiStatus() {
  try {
    const res = await api.get('/ai/status');
    return Boolean(res.data?.gemini_configured);
  } catch (e) {
    return false;
  }
}

function getMatchingCatalogueItems(queryText, mode = 'retail') {
  const lower = queryText.toLowerCase();
  let matched = [];

  if (lower.includes('payal') || lower.includes('anklet') || lower.includes('leg') || lower.includes('feet') || lower.includes('silver')) {
    matched = SHOWROOM_CATALOGUE.filter(p => p.category === 'agra-payal');
  } else if (lower.includes('bangle') || lower.includes('patli') || lower.includes('kada') || lower.includes('hand') || lower.includes('wrist')) {
    matched = SHOWROOM_CATALOGUE.filter(p => p.category === 'patli-bangles');
  } else if (lower.includes('haram') || lower.includes('necklace') || lower.includes('neck') || lower.includes('malai') || lower.includes('choker') || lower.includes('bridal') || lower.includes('saree')) {
    matched = SHOWROOM_CATALOGUE.filter(p => p.category === 'necklaces' || p.category === 'matte-cz-jewellery');
  } else if (lower.includes('chain') || lower.includes('mangalsutra') || lower.includes('thali') || lower.includes('roldgold') || lower.includes('black bead')) {
    matched = SHOWROOM_CATALOGUE.filter(p => p.category === 'roldgold-guarantee-chains');
  } else if (lower.includes('ring') || lower.includes('locket') || lower.includes('ganesha') || lower.includes('lakshmi') || lower.includes('pendant')) {
    matched = SHOWROOM_CATALOGUE.filter(p => p.category === 'finger-rings-lockets');
  } else {
    matched = [
      SHOWROOM_CATALOGUE.find(p => p.sku === 'MN-VJ-1250'),
      SHOWROOM_CATALOGUE.find(p => p.sku === 'MN-NK-1080'),
      SHOWROOM_CATALOGUE.find(p => p.sku === 'MN-AP-650')
    ].filter(Boolean);
  }

  return matched.slice(0, 3).map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: mode === 'wholesale'
      ? `₹${p.wholesale_price} wholesale`
      : `₹${p.retail_price} retail (₹${p.wholesale_price} wholesale)`,
    category: p.category
  }));
}

export async function getAiStylistAdvice(userQuery, userMode = 'retail', selectedCategory = '') {
  try {
    const res = await api.post('/ai/stylist', {
      query: userQuery,
      mode: userMode,
      category: selectedCategory
    });
    if (res.data?.success && res.data?.reply) {
      return {
        source: res.data.source || 'ai-stylist',
        reply: res.data.reply,
        suggestedProducts: res.data.suggestedProducts || []
      };
    }
  } catch (err) {
    console.warn('AI Stylist backend notice, using curated fallback:', err.message);
  }

  const matchingItems = getMatchingCatalogueItems(userQuery, userMode);
  const lower = userQuery.toLowerCase();
  let advice = '';

  if (lower.includes('bangle') || lower.includes('patli') || lower.includes('kada') || lower.includes('hand')) {
    advice = 'Namaste! For an opulent royal look, our **Royal Kemp Stone Antique Kada Pair** (SKU: MN-VJ-1250) paired with **Daily Wear Patli Bangles** is exquisite. Handcrafted with 1-gram micro gold finish over copper-brass, it provides timeless elegance with traditional Karnataka heirloom motifs.';
  } else if (lower.includes('wedding') || lower.includes('bride') || lower.includes('choker') || lower.includes('neck') || lower.includes('saree')) {
    advice = 'Namaste! For bridal and wedding celebrations, we highly recommend layering our **Heritage Temple Haram Long Necklace** (SKU: MN-NK-1080) with the **Premium Ruby-Green Kemp Bridal Choker** (SKU: MN-CZ-850). The 24K antique matte plating complements Kanjivaram and Ilkal silk sarees flawlessly.';
  } else if (lower.includes('payal') || lower.includes('anklet') || lower.includes('silver')) {
    advice = 'Namaste! Our genuine **Royal Heritage Agra Meenakari Bridal Payal** (SKU: MN-AP-650) features authentic fine ghungroos with silver-coated polish, specially curated from Agra artisans for auspicious occasions.';
  } else if (lower.includes('chain') || lower.includes('mangalsutra') || lower.includes('thali')) {
    advice = 'Namaste! Our **1-Gram Guarantee Roldgold Chains** (from ₹700 to ₹2,500 wholesale) feature durable micro-lacquer polish and traditional black crystal stations, ideal for daily wear and festive gifting.';
  } else {
    advice = 'Namaste! Welcome to Mahalaxmi Novelties, Kalaburagi. Our master craftsmen recommend our signature **Heritage Temple Harams** and **1-Gram Patli Kada Collections** with authentic wholesale and retail pricing.';
  }

  return {
    source: 'curated-ai-fallback',
    reply: advice,
    suggestedProducts: matchingItems
  };
}
