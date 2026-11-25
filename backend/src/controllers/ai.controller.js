const { query } = require('../config/db');

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest'
];

const SYSTEM_INSTRUCTION = `You are the Master Jewellery Stylist and Wholesale Advisor for "Mahalaxmi Novelties", a premier imitation jewellery house at Sangam Talkies Complex, S.B. Temple Road, Kalaburagi, Karnataka.
Proprietor: Manoharsingh P. Rathore.

Your expertise covers:
1. Traditional Indian Antique & Matte Finish Jewellery (Patli Bangles, Temple Kadas, Kemp Stone Chokers, Kasu Malai Harams, Agra Payal, Roldgold Chains, Temple Lockets).
2. Matching jewellery sets to sarees (Kanjivaram, Ilkal, Banarasi, Paithani), lehengas, bridal attire, or temple pujas.
3. Advising wholesale jewellers across Karnataka, Maharashtra, and Telangana on high-turnover fast-moving imitation jewellery lot sizes, MOQs, and retail margins.
4. Tone: Regal, warm, respectful, culturally knowledgeable (Karnataka and Hyderabad-Karnataka traditions), concise and under 150 words.
5. Only recommend exact product names and SKUs provided in the live showroom inventory context.`;

async function fetchMatchingProducts(queryText = '', selectedCategory = '') {
  const products = await query(`
    SELECT p.id, p.sku, p.name_en, p.name_kn, p.retail_price, p.wholesale_price, p.moq,
           c.slug AS category_slug
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = TRUE
    ORDER BY p.is_featured DESC, p.id ASC
  `);

  const lower = String(queryText || '').toLowerCase();
  let matched = [];

  if (selectedCategory) {
    matched = products.filter(p => p.category_slug === selectedCategory);
  }

  if (matched.length === 0) {
    if (lower.includes('payal') || lower.includes('anklet') || lower.includes('leg') || lower.includes('feet') || lower.includes('silver')) {
      matched = products.filter(p => p.category_slug === 'agra-payal');
    } else if (lower.includes('bangle') || lower.includes('patli') || lower.includes('kada') || lower.includes('hand') || lower.includes('wrist')) {
      matched = products.filter(p => p.category_slug === 'patli-bangles');
    } else if (lower.includes('haram') || lower.includes('necklace') || lower.includes('neck') || lower.includes('malai') || lower.includes('choker') || lower.includes('bridal') || lower.includes('saree')) {
      matched = products.filter(p => p.category_slug === 'necklaces' || p.category_slug === 'matte-cz-jewellery');
    } else if (lower.includes('chain') || lower.includes('mangalsutra') || lower.includes('thali') || lower.includes('roldgold') || lower.includes('black bead')) {
      matched = products.filter(p => p.category_slug === 'roldgold-guarantee-chains');
    } else if (lower.includes('ring') || lower.includes('locket') || lower.includes('ganesha') || lower.includes('lakshmi') || lower.includes('pendant')) {
      matched = products.filter(p => p.category_slug === 'finger-rings-lockets');
    } else {
      matched = products;
    }
  }

  return matched.slice(0, 3);
}

function getAiStatus(req, res) {
  const key = process.env.GEMINI_API_KEY || '';
  const configured = Boolean(key && key.trim().length > 15);
  return res.json({
    success: true,
    gemini_configured: configured
  });
}

async function getStylistAdvice(req, res) {
  try {
    const { query: userQuery, mode = 'retail', category = '' } = req.body;

    if (!userQuery || !String(userQuery).trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a styling question.' });
    }

    const liveMatches = await fetchMatchingProducts(userQuery, category);
    const suggestedProducts = liveMatches.map(p => ({
      id: p.id,
      name: p.name_en,
      sku: p.sku,
      price: mode === 'wholesale'
        ? `₹${Number(p.wholesale_price).toFixed(0)} wholesale (Min ${p.moq || 1})`
        : `₹${Number(p.retail_price).toFixed(0)} retail (₹${Number(p.wholesale_price).toFixed(0)} wholesale)`,
      category: p.category_slug
    }));

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (apiKey && apiKey.trim().length > 15) {
      for (const modelName of GEMINI_MODELS) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: SYSTEM_INSTRUCTION },
                      {
                        text: `Customer Shopping Mode: ${mode}. Category Filter: ${category || 'All'}. Customer Query: "${String(userQuery).trim()}".
Available Live Showroom Pieces:
${suggestedProducts.length > 0 ? suggestedProducts.map(m => `- ${m.name} (${m.sku}, ${m.price})`).join('\n') : 'Catalogue is ready for custom orders.'}`
                      }
                    ]
                  }
                ],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 350
                }
              })
            }
          );

          if (response.ok) {
            const data = await response.json();
            const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiReply) {
              return res.json({
                success: true,
                source: `gemini-live (${modelName})`,
                reply: aiReply.trim(),
                suggestedProducts
              });
            }
          }
        } catch (err) {
          console.warn(`Gemini call to ${modelName} failed:`, err.message);
        }
      }
    }

    // Curated fallback built from live database items
    const lower = String(userQuery).toLowerCase();
    const topPick = suggestedProducts[0];
    let advice = '';

    if (topPick) {
      if (lower.includes('bangle') || lower.includes('patli') || lower.includes('kada') || lower.includes('hand')) {
        advice = `Namaste! For a regal royal look, we recommend **${topPick.name}** (${topPick.sku} · ${topPick.price}). Handcrafted with durable 1-gram micro-gold plating, it pairs gracefully with festive silk sarees and bridal bangles.`;
      } else if (lower.includes('wedding') || lower.includes('bride') || lower.includes('choker') || lower.includes('neck') || lower.includes('saree')) {
        advice = `Namaste! For weddings and Kanjivaram/Ilkal silk sarees, we suggest **${topPick.name}** (${topPick.sku} · ${topPick.price}). Layering a choker with a temple haram creates timeless South Indian heirloom grandeur.`;
      } else if (lower.includes('payal') || lower.includes('anklet') || lower.includes('silver')) {
        advice = `Namaste! Our authentic **${topPick.name}** (${topPick.sku} · ${topPick.price}) features classic Agra craftsmanship with fine ghungroo detailing ideal for both bridal and daily wear.`;
      } else if (lower.includes('chain') || lower.includes('mangalsutra') || lower.includes('thali')) {
        advice = `Namaste! Our **${topPick.name}** (${topPick.sku} · ${topPick.price}) carries our trusted 1-year Roldgold guarantee polish for lasting daily lustre.`;
      } else {
        advice = `Namaste! Welcome to Mahalaxmi Novelties, Kalaburagi. Our master stylist recommends **${topPick.name}** (${topPick.sku} · ${topPick.price}) from our live collection — available in both Retail and Wholesale MOQ slabs.`;
      }
    } else {
      advice = 'Namaste! Welcome to Mahalaxmi Novelties, Kalaburagi. Browse our six signature collections or contact us directly on WhatsApp (+91 98800 42188) for bespoke wholesale styling.';
    }

    return res.json({
      success: true,
      source: 'curated-live-catalogue',
      reply: advice,
      suggestedProducts
    });
  } catch (error) {
    console.error('AI Stylist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to consult AI stylist.'
    });
  }
}

module.exports = {
  getAiStatus,
  getStylistAdvice
};
