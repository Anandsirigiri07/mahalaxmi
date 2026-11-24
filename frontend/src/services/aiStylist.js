/**
 * Mahalaxmi Novelties — AI Jewellery Stylist & Wholesale Advisor
 * Powered by Google Gemini API
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 10);

const SYSTEM_INSTRUCTION = `You are the Master Jewellery Stylist and Wholesale Advisor for "Mahalaxmi Novelties", a premier imitation jewellery house located at Sangam Talkies Complex, S.B. Temple Road, Kalaburagi, Karnataka.
Proprietor: Manoharsingh P. Rathore.

Your expertise covers:
1. Traditional Indian Antique & Matte Finish Jewellery (Patli Bangles, Temple Kadas, Kemp Stone Chokers, Rajwadi Sets, Jhumkas, Agra Payal, Roldgold Chains).
2. Matching jewellery sets to customer sarees, lehengas, bridal attire, or temple functions.
3. Advising wholesale jewellery retailers across Karnataka, Maharashtra, and Telangana on fast-moving imitation jewellery lot sizes, MOQs, and profit margins.
4. Tone: Regal, warm, respectful, culturally knowledgeable (understands Karnataka and South Indian traditions), with a luxury aesthetic.

Always keep your suggestions concise, structured, with clear recommendations on jewellery piece names, finish (Antique Matte Gold / Traditional Roldgold / Kemp Ruby), and styling tips.`;

/**
 * Ask the AI Jewellery Stylist for recommendations
 */
export async function getAiStylistAdvice(userQuery, userMode = 'retail', selectedCategory = '') {
  // If user provided a Gemini API Key in .env, call the Google Gemini API
  if (isGeminiConfigured) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: SYSTEM_INSTRUCTION },
                  { text: `Mode: ${userMode}. Category focus: ${selectedCategory || 'All'}. Customer Request: ${userQuery}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiReply) {
        return {
          source: 'gemini-live',
          reply: aiReply,
          suggestions: [
            'Patli Bangles Set (4 Pcs) in Matte Finish',
            'Temple Kemp Lakshmi Kada',
            'Rajwadi Antique Choker Set'
          ]
        };
      }
    } catch (err) {
      console.warn('Live Gemini call failed or quota reached, falling back to curated advisory:', err);
    }
  }

  // Curated Intelligent Stylist Engine (Local knowledge base fallback)
  const lower = userQuery.toLowerCase();
  let advice = '';
  let items = [];

  if (lower.includes('bangle') || lower.includes('patli') || lower.includes('kada') || lower.includes('hand')) {
    advice = `For an opulent royal silhouette, pair our **Royal Antique Filigree Patli Kadas** with 2.6 or 2.8 size sizing. The micro-gold finish reflects deep warmth without excessive flash, complimenting both Kanjivaram silk and velvet lehengas.`;
    items = [
      { name: 'Royal Antique Filigree Patli Kada', price: '₹450 wholesale · ₹1,200 retail', sku: 'MN-BG-001' },
      { name: 'Lakshmi Temple Carved Patli', price: '₹580 wholesale · ₹1,550 retail', sku: 'MN-BG-002' },
      { name: 'Kemp Flora Embossed Set (4Pcs)', price: '₹750 wholesale · ₹2,100 retail', sku: 'MN-BG-003' }
    ];
  } else if (lower.includes('wedding') || lower.includes('bride') || lower.includes('choker') || lower.includes('neck')) {
    advice = `For bridal & grand celebratory attire, the **Rajwadi Choker & Kemp Jhumka Set** is the hallmark choice. Its 24K antique micro-gold electroplating over brass delivers genuine heirloom weight with ruby cabochon accents.`;
    items = [
      { name: 'Rajwadi Choker & Jhumka Set', price: '₹790 wholesale · ₹1,850 retail', sku: 'MN-NK-402' },
      { name: 'Kemp Ruby Dome Jhumkas', price: '₹280 wholesale · ₹820 retail', sku: 'MN-ER-519' },
      { name: 'Agra Ghungroo Payal Pair', price: '₹320 wholesale · ₹950 retail', sku: 'MN-PL-881' }
    ];
  } else if (lower.includes('wholesale') || lower.includes('shop') || lower.includes('bulk') || lower.includes('margin')) {
    advice = `For jewellery retailers in North Karnataka and Hyderabad-Karnataka regions, our **Patli Bangles 12-Pair Assorted Lots** and **Agra Silver-Finish Payals** yield highest inventory turnover (up to 60-70% retail markup).`;
    items = [
      { name: 'Assorted Filigree Patli Master Lot (12 Pcs)', price: '₹450 / pair · Min 12', sku: 'LOT-BG-12' },
      { name: 'Agra Ghungroo Anklet Bundle (10 Pairs)', price: '₹320 / pair · Min 10', sku: 'LOT-PL-10' },
      { name: 'Temple Lakshmi Chuda Box', price: '₹550 / pair · Min 6', sku: 'LOT-CH-06' }
    ];
  } else {
    advice = `Welcome to **Mahalaxmi Novelties**, Kalaburagi. Our master craftsmen recommend our signature **Matte Gold Patli Collection** and **Antique Kemp Sets**. Handcrafted with 1-gram finish micro-plating, they ensure timeless luster for festivals, weddings, and showroom stock.`;
    items = [
      { name: 'Royal Antique Filigree Patli Kada', price: '₹450 wholesale', sku: 'MN-BG-001' },
      { name: 'Rajwadi Choker & Jhumka', price: '₹790 wholesale', sku: 'MN-NK-402' },
      { name: 'Agra Ghungroo Payal Pair', price: '₹320 wholesale', sku: 'MN-PL-881' }
    ];
  }

  return {
    source: isGeminiConfigured ? 'gemini-live' : 'curated-ai-fallback',
    reply: advice,
    suggestedProducts: items
  };
}
