import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, Check, ExternalLink } from 'lucide-react';
import { getAiStylistAdvice, isGeminiConfigured } from '../../services/aiStylist';
import { Link } from 'react-router-dom';

const quickPrompts = [
  '👑 Recommend wedding bangle set for bride',
  '🥻 Match jewellery for Maroon Kanjivaram saree',
  '📦 Best-selling wholesale lot for Kalaburagi showroom',
  '💎 Temple jewellery choker & jhumka pair'
];

export default function AiStylistModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to Mahalaxmi Novelties AI Jewellery Stylist & Wholesale Advisor. How can I help curate the perfect imitation jewellery pieces or bulk lot for you today?',
      suggestedProducts: [
        { name: 'Royal Antique Filigree Patli Kada', price: '₹450 wholesale', sku: 'MN-BG-001' },
        { name: 'Rajwadi Choker & Kemp Jhumka Set', price: '₹790 wholesale', sku: 'MN-NK-402' }
      ]
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (userText) => {
    const textToSend = userText || query;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const result = await getAiStylistAdvice(textToSend);
      const botMsg = {
        sender: 'bot',
        text: result.reply,
        suggestedProducts: result.suggestedProducts || [],
        source: result.source
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'I apologize, could not process your query at this moment. Please browse our catalogue or WhatsApp our Kalaburagi showroom directly at +91 94812 42188.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#280812] border border-gold/40 rounded-3xl shadow-deep-3d overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Decorative ambient glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-wine-950 via-wine-900 to-wine-850 border-b border-gold/30 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center shadow-floating-gold">
              <Sparkles className="w-5 h-5 text-gold-light" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-lg font-bold text-ivory tracking-wide">
                  Mahalaxmi AI Stylist
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/20 text-gold-light border border-gold/30">
                  {isGeminiConfigured ? 'Gemini Live' : 'AI Curated'}
                </span>
              </div>
              <p className="text-[11px] text-ivory/70">
                Jewellery styling, saree matching & wholesale lots
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 text-gold hover:text-gold-light border border-gold/30 flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-medium shadow-floating-gold'
                    : 'bg-[#37141e]/90 text-ivory border border-gold/30 shadow-floating-card'
                }`}
              >
                <div className="whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Suggested Products list */}
                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-gold/20 space-y-2">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gold-light">
                      Curated Matching Pieces:
                    </p>
                    {msg.suggestedProducts.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="bg-black/30 border border-gold/25 rounded-xl p-2 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-serif font-bold text-gold-light">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-ivory/70">
                            {p.price} {p.sku ? `· ${p.sku}` : ''}
                          </div>
                        </div>
                        <Link
                          to={p.id ? `/product/${p.id}` : (p.category ? `/catalogue?category=${p.category}` : '/catalogue')}
                          onClick={onClose}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 text-[10px] font-bold hover:scale-105 shadow-sm transition"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-gold-light text-xs py-2 px-1">
              <span className="w-2 h-2 rounded-full bg-gold animate-ping"></span>
              <span className="font-serif italic">Consulting master jewellery craftsmen & catalogue...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-gold/20 flex gap-2 overflow-x-auto no-scrollbar bg-black/20">
          {quickPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(prompt.replace(/^[^\s]+\s/, ''))}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-wine-900/60 hover:bg-wine-900 text-gold-light text-[11px] border border-gold/30 transition flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-wine-950 border-t border-gold/30 flex items-center space-x-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask styling advice, bridal sets, or wholesale lots..."
            className="flex-1 bg-[#1D050D] text-ivory placeholder:text-ivory/40 border border-gold/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-gold to-gold-light text-wine-950 flex items-center justify-center font-bold shadow-floating-gold disabled:opacity-40 transition active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
