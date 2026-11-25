import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  ChevronRight, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  ShoppingBag,
  Truck
} from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/common/ProductCard';
import AiStylistModal from '../../components/common/AiStylistModal';

// 6 Core Categories with luxury imagery & bilingual titles
const coreCategories = [
  {
    slug: 'agra-payal',
    en: 'Agra Payal',
    kn: 'ಆಗ್ರಾ ಪಾಯಲ್',
    image: '/assets/products/payal-650.jpg',
    tag: 'From ₹220'
  },
  {
    slug: 'patli-bangles',
    en: 'Kada & Patli',
    kn: 'ಪಟ್ಲಿ ಬಳೆಗಳು',
    image: '/assets/products/kada-1250.jpg',
    tag: 'From ₹450'
  },
  {
    slug: 'necklaces',
    en: 'Temple Harams',
    kn: 'ಹಾರಗಳು / ನೆಕ್ಲೇಸ್',
    image: '/assets/products/haram-1080.jpg',
    tag: 'From ₹980'
  },
  {
    slug: 'matte-cz-jewellery',
    en: 'Kemp & CZ Sets',
    kn: 'ಮ್ಯಾಟ್ & ಸಿ.ಝಡ್.',
    image: '/assets/products/cz-choker-850.jpg',
    tag: 'From ₹650'
  },
  {
    slug: 'roldgold-guarantee-chains',
    en: 'Roldgold Chains',
    kn: 'ರೋಲ್ಡ್‌ಗೋಲ್ಡ್ ಚೈನ್ಸ್',
    image: '/assets/products/chain-700.jpg',
    tag: 'From ₹700'
  },
  {
    slug: 'finger-rings-lockets',
    en: 'Rings & Lockets',
    kn: 'ಉಂಗುರ & ಲಾಕೆಟ್',
    image: '/assets/products/locket-320.jpg',
    tag: 'From ₹280'
  }
];

// Real jewellery items from supplier WhatsApp catalogue with verified prices
const realShowcaseProducts = [
  {
    id: 1,
    sku: 'MN-VJ-1250',
    name_en: 'Royal Kemp Stone Antique Kada / Bajuband Pair',
    name_kn: 'ರಾಯಲ್ ಕೆಂಪ್ ಕಲ್ಲು ಆಂಟಿಕ್ ಕಡಾ / ಬಾಜುಬಂದ್ ಜೋಡಿ',
    category_slug: 'patli-bangles',
    retail_price: 2650.0,
    wholesale_price: 1250.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/kada-1250.jpg'
  },
  {
    id: 12,
    sku: 'MN-PB-450',
    name_en: 'Classic Micro-Gold Daily Wear Patli Bangles Set of 4',
    name_kn: 'ಕ್ಲಾಸಿಕ್ ಮೈಕ್ರೋ-ಗೋಲ್ಡ್ ನಿತ್ಯೋಪಯೋಗಿ ಪಟ್ಲಿ ಬಳೆಗಳು (4ರ ಸೆಟ್)',
    category_slug: 'patli-bangles',
    retail_price: 899.0,
    wholesale_price: 450.0,
    moq: 12,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/bangles-450.jpg'
  },
  {
    id: 13,
    sku: 'MN-PB-850',
    name_en: 'Diamond-Cut Textured Royal 1-Gram Gold Patli Bangle Set of 4',
    name_kn: 'ಡೈಮಂಡ್-ಕಟ್ ವಿನ್ಯಾಸದ ರಾಯಲ್ 1-ಗ್ರಾಂ ಗೋಲ್ಡ್ ಪಟ್ಲಿ ಬಳೆಗಳು',
    category_slug: 'patli-bangles',
    retail_price: 1699.0,
    wholesale_price: 850.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/bangles-850.jpg'
  },
  {
    id: 14,
    sku: 'MN-PB-950',
    name_en: 'Antique Temple Nakshi Elephant Face Kada Single',
    name_kn: 'ಆಂಟಿಕ್ ಟೆಂಪಲ್ ನಕ್ಷಿ ಗಜ ಮುಖದ ಕಡಾ',
    category_slug: 'patli-bangles',
    retail_price: 1899.0,
    wholesale_price: 950.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/kada-950.jpg'
  },
  {
    id: 2,
    sku: 'MN-NK-1080',
    name_en: 'Heritage Temple Haram Long Necklace with Floral Pendant',
    name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ದೇವಸ್ಥಾನ ಹಾರ ಉದ್ದನೆಯ ನೆಕ್ಲೇಸ್',
    category_slug: 'necklaces',
    retail_price: 2450.0,
    wholesale_price: 1080.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/haram-1080.jpg'
  },
  {
    id: 15,
    sku: 'MN-NK-1450',
    name_en: 'Royal Lakshmi Kasu Malai Antique Long Temple Haram',
    name_kn: 'ರಾಯಲ್ ಲಕ್ಷ್ಮೀ ಕಾಸು ಮಾಲೆ ಆಂಟಿಕ್ ಉದ್ದನೆಯ ದೇವಸ್ಥಾನ ಹಾರ',
    category_slug: 'necklaces',
    retail_price: 2899.0,
    wholesale_price: 1450.0,
    moq: 3,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/haram-1450.jpg'
  },
  {
    id: 16,
    sku: 'MN-NK-980',
    name_en: 'Traditional Peacock Nakshi Bridal Choker with Kemp Stones',
    name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ನವಿಲು ನಕ್ಷಿ ಬ್ರೈಡಲ್ ಚೋಕರ್ ನೆಕ್ಲೇಸ್',
    category_slug: 'necklaces',
    retail_price: 1950.0,
    wholesale_price: 980.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/choker-980.jpg'
  },
  {
    id: 17,
    sku: 'MN-NK-1650',
    name_en: 'Grand Manga Malai South Indian Heritage Haram',
    name_kn: 'ಗ್ರ್ಯಾಂಡ್ ಮಾವಿನಕಾಯಿ ಮಾಲೆ (ಮಂಗಾ ಮಾಲೈ) ಹೆರಿಟೇಜ್ ಹಾರ',
    category_slug: 'necklaces',
    retail_price: 3299.0,
    wholesale_price: 1650.0,
    moq: 2,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/haram-1650.jpg'
  },
  {
    id: 18,
    sku: 'MN-AP-650',
    name_en: 'Royal Heritage Agra Meenakari Enamelled Bridal Payal Pair',
    name_kn: 'ರಾಯಲ್ ಹೆರಿಟೇಜ್ ಆಗ್ರಾ ಮೀನಾಕಾರಿ ಬ್ರೈಡಲ್ ಪಾಯಲ್ ಜೋಡಿ',
    category_slug: 'agra-payal',
    retail_price: 1299.0,
    wholesale_price: 650.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/payal-650.jpg'
  },
  {
    id: 19,
    sku: 'MN-AP-350',
    name_en: 'Genuine Agra Daily-Wear Silver Coated Ghungroo Payal Pair',
    name_kn: 'ಅಸಲಿ ಆಗ್ರಾ ನಿತ್ಯೋಪಯೋಗಿ ಬೆಳ್ಳಿ ಕೋಟೆಡ್ ಗಂಟಿನ ಪಾಯಲ್ ಜೋಡಿ',
    category_slug: 'agra-payal',
    retail_price: 699.0,
    wholesale_price: 350.0,
    moq: 10,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/payal-350.jpg'
  },
  {
    id: 20,
    sku: 'MN-AP-480',
    name_en: 'Traditional Broad Bridal Agra Chandi Finish Payal Pair',
    name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಅಗಲವಾದ ಆಗ್ರಾ ಚಾಂದಿ ಫಿನಿಶ್ ಬ್ರೈಡಲ್ ಪಾಯಲ್',
    category_slug: 'agra-payal',
    retail_price: 999.0,
    wholesale_price: 480.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/payal-480.jpg'
  },
  {
    id: 21,
    sku: 'MN-AP-220',
    name_en: 'Handcrafted Agra Daily Silver Anklet with Delicate Beads',
    name_kn: 'ಆಗ್ರಾ ಸೂಕ್ಷ್ಮ ಮಣಿಗಳುಳ್ಳ ಬೆಳ್ಳಿ ಸರ ಪಾಯಲ್ ಜೋಡಿ',
    category_slug: 'agra-payal',
    retail_price: 450.0,
    wholesale_price: 220.0,
    moq: 12,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/payal-220.jpg'
  },
  {
    id: 3,
    sku: 'MN-CH-650',
    name_en: 'Classic Kemp Stone Floral Pendant Long Chain',
    name_kn: 'ಕ್ಲಾಸಿಕ್ ಕೆಂಪ್ ಕಲ್ಲು ಹೂವಿನ ಲಾಕೆಟ್ ಸರ',
    category_slug: 'matte-cz-jewellery',
    retail_price: 1450.0,
    wholesale_price: 650.0,
    moq: 10,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/pendant-650.jpg'
  },
  {
    id: 22,
    sku: 'MN-CZ-850',
    name_en: 'Premium Ruby-Green Kemp Bridal Choker Set with Matching Jhumkas',
    name_kn: 'ಪ್ರೀಮಿಯಂ ಕೆಂಪು-ಹಸಿರು ಕೆಂಪ್ ಬ್ರೈಡಲ್ ಚೋಕರ್ & ಜುಮ್ಕಿ ಸೆಟ್',
    category_slug: 'matte-cz-jewellery',
    retail_price: 1750.0,
    wholesale_price: 850.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/cz-choker-850.jpg'
  },
  {
    id: 23,
    sku: 'MN-CZ-1150',
    name_en: 'Matte Antique Goddess Lakshmi Pendant Necklace Set',
    name_kn: 'ಮ್ಯಾಟ್ ಆಂಟಿಕ್ ಲಕ್ಷ್ಮೀ ದೇವಿ ಪೆಂಡೆಂಟ್ ನೆಕ್ಲೇಸ್ ಸೆಟ್',
    category_slug: 'matte-cz-jewellery',
    retail_price: 2299.0,
    wholesale_price: 1150.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/matte-set-1150.jpg'
  },
  {
    id: 4,
    sku: 'MN-RG-700',
    name_en: 'Micro Gold Flat Mesh Mangalsutra Chain with Black Beads',
    name_kn: 'ಮೈಕ್ರೋ ಗೋಲ್ಡ್ ಫ್ಲ್ಯಾಟ್ ಮೆಶ್ ಮಾಂಗಲ್ಯ ಸರ ಕರಿಮಣಿ',
    category_slug: 'roldgold-guarantee-chains',
    retail_price: 1550.0,
    wholesale_price: 700.0,
    moq: 10,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-700.jpg',
    craft_image: '/assets/products/chain-700-craft.jpg'
  },
  {
    id: 5,
    sku: 'MN-RG-1050',
    name_en: 'Dual Strand Box Link Gold Chain with Black Bead Stations',
    name_kn: 'ಡಬಲ್ ಎಳೆ ಬಾಕ್ಸ್ ಲಿಂಕ್ ಗೋಲ್ಡ್ ಚೈನ್ ಕರಿಮಣಿ ಸರ',
    category_slug: 'roldgold-guarantee-chains',
    retail_price: 2250.0,
    wholesale_price: 1050.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-1050.jpg',
    craft_image: '/assets/products/chain-1050-craft.jpg'
  },
  {
    id: 6,
    sku: 'MN-RG-1200',
    name_en: 'Traditional Double Strand 1-Gram Gold Chain with Clusters',
    name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಡಬಲ್ ಎಳೆ 1-ಗ್ರಾಂ ಗೋಲ್ಡ್ ಚೈನ್',
    category_slug: 'roldgold-guarantee-chains',
    retail_price: 2600.0,
    wholesale_price: 1200.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-1200.jpg',
    craft_image: '/assets/products/chain-1200-craft.jpg'
  },
  {
    id: 7,
    sku: 'MN-RG-1250',
    name_en: 'Heritage Double Strand Gold Box Chain with Black Crystals',
    name_kn: 'ಹೆರಿಟೇಜ್ ಡಬಲ್ ಎಳೆ ಗೋಲ್ಡ್ ಬಾಕ್ಸ್ ಚೈನ್',
    category_slug: 'roldgold-guarantee-chains',
    retail_price: 2750.0,
    wholesale_price: 1250.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-1250.jpg',
    craft_image: '/assets/products/chain-1250-craft.jpg'
  },
  {
    id: 8,
    sku: 'MN-RG-1500',
    name_en: 'Premium Double Flat Ribbon 1-Gram Gold Thali Chain',
    name_kn: 'ಪ್ರೀಮಿಯಂ ಡಬಲ್ ಫ್ಲ್ಯಾಟ್ ರಿಬ್ಬನ್ 1-ಗ್ರಾಂ ಗೋಲ್ಡ್ ತಾಳಿ ಚೈನ್',
    category_slug: 'roldgold-guarantee-chains',
    retail_price: 3250.0,
    wholesale_price: 1500.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-1500.jpg',
    craft_image: '/assets/products/chain-1500-craft.jpg'
  },
  {
    id: 9,
    sku: 'MN-RG-1550',
    name_en: 'Royal Double Layered Thali Chain with Black Bead Motifs',
    name_kn: 'ರಾಯಲ್ ಡಬಲ್ ಲೇಯರ್ಡ್ ತಾಳಿ ಚೈನ್ ಕರಿಮಣಿ ವಿನ್ಯಾಸ',
    category_slug: 'roldgold-guarantee-chains',
    retail_price: 3400.0,
    wholesale_price: 1550.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-1550.jpg',
    craft_image: '/assets/products/chain-1550-craft.jpg'
  },
  {
    id: 10,
    sku: 'MN-RG-1800',
    name_en: 'Broad Double Strand Fancy Link Gold Chain with Black Beads',
    name_kn: 'ಬ್ರಾಡ್ ಡಬಲ್ ಎಳೆ ಫ್ಯಾನ್ಸಿ ಲಿಂಕ್ ಗೋಲ್ಡ್ ಚೈನ್',
    category_slug: 'roldgold-guarantee-chains',
    retail_price: 3950.0,
    wholesale_price: 1800.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-1800.jpg',
    craft_image: '/assets/products/chain-1800-craft.jpg'
  },
  {
    id: 11,
    sku: 'MN-RG-2500',
    name_en: 'Opulent Grand 36-Inch Double Strand Bridal Gold Chain',
    name_kn: 'ಭವ್ಯ ಗ್ರ್ಯಾಂಡ್ 36-ಇಂಚು ಡಬಲ್ ಎಳೆ ಬ್ರೈಡಲ್ ಗೋಲ್ಡ್ ಚೈನ್',
    category_slug: 'roldgold-guarantee-chains',
    retail_price: 5400.0,
    wholesale_price: 2500.0,
    moq: 2,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-2500.jpg',
    craft_image: '/assets/products/chain-2500-craft.jpg'
  },
  {
    id: 24,
    sku: 'MN-FR-280',
    name_en: 'Adjustable Floral CZ Micro-Gold Plated Finger Ring',
    name_kn: 'ಅಡ್ಜಸ್ಟಬಲ್ ಹೂವಿನ ಸಿ.ಝಡ್. ಮೈಕ್ರೋ ಗೋಲ್ಡ್ ಉಂಗುರ',
    category_slug: 'finger-rings-lockets',
    retail_price: 599.0,
    wholesale_price: 280.0,
    moq: 12,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/ring-280.jpg'
  },
  {
    id: 25,
    sku: 'MN-LK-320',
    name_en: 'Auspicious Lord Ganesha Embossed 1-Gram Gold Temple Locket',
    name_kn: 'ಶುಭ ಗಣೇಶ ಕೆತ್ತನೆಯ 1-ಗ್ರಾಂ ಗೋಲ್ಡ್ ದೇವಸ್ಥಾನ ಲಾಕೆಟ್',
    category_slug: 'finger-rings-lockets',
    retail_price: 650.0,
    wholesale_price: 320.0,
    moq: 10,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/locket-320.jpg'
  },
  {
    id: 26,
    sku: 'MN-LK-380',
    name_en: 'Goddess Mahalakshmi Heritage Coin Pendant Locket',
    name_kn: 'ಮಹಾಲಕ್ಷ್ಮೀ ದೇವಿ ಹೆರಿಟೇಜ್ ಕಾಯಿನ್ ಪೆಂಡೆಂಟ್ ಲಾಕೆಟ್',
    category_slug: 'finger-rings-lockets',
    retail_price: 799.0,
    wholesale_price: 380.0,
    moq: 10,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/locket-380.jpg'
  }
];

export default function HomePage() {
  const { lang } = useLanguage();
  const { setOrderMode } = useCart();
  const [products, setProducts] = useState(realShowcaseProducts);
  const [pincodeInput, setPincodeInput] = useState('585101');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/products');
        if (res.data.success && res.data.products && res.data.products.length > 0) {
          setProducts(res.data.products);
        }
      } catch (err) {
        // Fallback to realShowcaseProducts
      }
    };
    loadProducts();
  }, []);

  const handleCheckPincode = async (e) => {
    e.preventDefault();
    const cleanPin = pincodeInput.trim();
    if (!cleanPin || cleanPin.length !== 6) return;
    setCheckingPin(true);
    try {
      const res = await api.get(`/settings/pincodes/check/${cleanPin}`);
      setPincodeResult(res.data);
    } catch (err) {
      const validPins = ['585101', '585102', '585103', '585104', '585105'];
      if (validPins.includes(cleanPin)) {
        setPincodeResult({
          success: true,
          is_serviceable: true,
          locality: 'Kalaburagi City Direct Express',
          delivery_fee: cleanPin === '585101' ? 30 : cleanPin === '585104' ? 50 : 40,
          free_delivery_threshold: 1500
        });
      } else {
        setPincodeResult({
          success: false,
          is_serviceable: false,
          message: `PIN code ${cleanPin} is outside our direct local delivery zone in Kalaburagi.`
        });
      }
    } finally {
      setCheckingPin(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#280812] text-ivory pb-28 overflow-x-hidden selection:bg-gold selection:text-wine-950">
      
      {/* ==================== 1. HERO SECTION WITH 3D OVERHANG ==================== */}
      <section className="relative hero-gradient bg-lotus-pattern pt-8 pb-20 px-4 sm:px-6 overflow-visible border-b border-gold/20">
        
        {/* Atmospheric Ambient Glows behind jewellery */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-gold/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-36 left-1/4 w-48 h-48 bg-gold-light/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 pt-2 mb-2">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 backdrop-blur-md border border-gold/30 mb-3 shadow-glass-inset-dark">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-gold-light">
              Heritage Collection 2026 · Direct Wholesale &amp; Retail
            </span>
          </div>

          {/* Regal Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-ivory tracking-wide gold-text-glow leading-tight">
            {lang === 'kn' ? 'ಮಹಾಲಕ್ಷ್ಮೀ ನಾವೆಲ್ಟೀಸ್' : 'Mahalaxmi Novelties'}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-ivory/80 font-normal tracking-wider mt-2 max-w-xl mx-auto">
            {lang === 'kn' 
              ? 'ಪ್ರತಿಷ್ಠಿತ ಸಗಟು ಮತ್ತು ಚಿಲ್ಲರೆ ಇಮಿಟೇಶನ್ ಆಭರಣಗಳ ಭಂಡಾರ — ಕಲಬುರಗಿ' 
              : 'Direct Wholesale & Retail Imitation Jewellery House · Sangam Talkies Complex, S.B. Temple Road'}
          </p>
        </div>

        {/* Floating Jewellery Cut-out with 3D Overhang into next section */}
        <div className="relative z-20 mt-4 -mb-16 flex flex-col items-center max-w-md mx-auto">
          {/* Glow pedestal / floating ring */}
          <div className="relative w-72 sm:w-80 h-72 sm:h-80 flex items-center justify-center">
            {/* Circular soft halo plate */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-gold/30 via-wine-700/40 to-transparent backdrop-blur-sm border border-gold/40 shadow-deep-3d"></div>
            
            {/* Centerpiece Image: Temple Haram Long Necklace (₹1080 Wholesale) */}
            <Link 
              to="/product/2"
              className="relative z-10 w-64 sm:w-72 h-64 sm:h-72 transition-transform transform hover:scale-105 duration-500 block"
            >
              <img 
                src="/assets/products/haram-1080.jpg" 
                alt="Heritage Temple Haram Long Necklace" 
                className="w-full h-full object-contain drop-shadow-[0_22px_28px_rgba(15,2,7,0.85)] filter brightness-105 select-none rounded-2xl"
              />
            </Link>

            {/* Floating 3D Badge Tag with Real Price */}
            <div className="absolute bottom-4 right-4 z-30 bg-wine-950/90 backdrop-blur-md border border-gold/60 rounded-2xl px-3.5 py-1.5 shadow-floating-gold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-light" />
              <div className="text-left">
                <span className="text-gold-light text-xs font-serif font-bold block">
                  Wholesale ₹1,080
                </span>
                <span className="text-[10px] text-ivory/60 line-through">
                  Retail ₹2,450
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="relative z-30 flex items-center justify-center space-x-3 w-full mt-3 px-3">
            <Link 
              to="/catalogue"
              onClick={() => setOrderMode('retail')}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-sans font-semibold text-xs tracking-wider uppercase text-center shadow-floating-gold active:scale-95 transition-all border border-gold-light"
            >
              Explore Catalogue
            </Link>
            <Link 
              to="/catalogue"
              onClick={() => setOrderMode('wholesale')}
              className="flex-1 py-3 px-4 rounded-xl bg-white/10 backdrop-blur-md border border-gold/60 text-ivory font-sans font-medium text-xs tracking-wider uppercase text-center shadow-glass-inset-dark hover:bg-white/15 active:scale-95 transition-all"
            >
              Wholesale Buyer
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== 2. SLIDING JEWELLERY SHOWPIECE STRIP (WITH REAL PRICES) ==================== */}
      <section className="relative pt-24 pb-8 px-4 max-w-5xl mx-auto overflow-hidden">
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-4 h-[1px] bg-gold"></span>
              <span className="text-[10px] tracking-widest font-semibold uppercase text-gold-light">
                Curated Showpieces &amp; Real Prices
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
              Iconic Showcases
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-gold-light">
            <span className="text-[11px] font-medium text-ivory/60">Swipe</span>
            <div className="w-7 h-7 rounded-full bg-wine-900 border border-gold/40 flex items-center justify-center shadow-md animate-pulse">
              <ArrowRight className="w-3.5 h-3.5 text-gold" />
            </div>
          </div>
        </div>

        {/* 3D Perspective Card Slider Row with Real Screenshot Prices */}
        <div className="perspective-container relative flex items-center justify-center space-x-[-10px] sm:space-x-4 py-4 overflow-visible">
          
          {/* Left Card: Kada 1250 */}
          <Link
            to="/product/1"
            className="tilt-card-left w-[125px] sm:w-[155px] h-[205px] sm:h-[235px] rounded-2xl bg-gradient-to-b from-wine-900 to-wine-950 p-3 flex flex-col justify-between border border-gold/30 shadow-lg relative flex-shrink-0 opacity-90 group hover:opacity-100"
          >
            <div className="text-[9px] uppercase tracking-wider text-gold-light/80 font-bold">Kada Pair</div>
            <div className="relative w-full h-24 my-auto overflow-hidden rounded-xl bg-black/30 p-1">
              <img src="/assets/products/kada-1250.jpg" alt="" className="w-full h-full object-contain filter drop-shadow-[0_10px_12px_rgba(0,0,0,0.7)] group-hover:scale-105 transition" />
            </div>
            <div className="text-center pt-1 border-t border-gold/20">
              <div className="text-[11px] font-serif font-bold text-ivory truncate">Kemp Stone Kada</div>
              <div className="text-[10px] font-mono text-gold-light font-bold">Wholesale ₹1,250</div>
            </div>
          </Link>

          {/* Center Card: Temple Haram 1080 (Elevated Focal Point) */}
          <Link
            to="/product/2"
            className="tilt-card-center z-20 w-[155px] sm:w-[185px] h-[235px] sm:h-[265px] rounded-2xl bg-gradient-to-b from-wine-800 via-wine-900 to-wine-950 p-3.5 flex flex-col justify-between border border-gold shadow-floating-gold relative flex-shrink-0 group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-gold/20 border border-gold/40 text-[9px] font-semibold text-gold-light tracking-wider uppercase">FEATURED</span>
              <span className="text-gold-light text-xs font-serif font-bold">MN-1080</span>
            </div>
            
            <div className="relative w-full h-32 my-auto transform scale-105 rounded-xl overflow-hidden bg-black/40 p-1">
              <img src="/assets/products/haram-1080.jpg" alt="" className="w-full h-full object-contain filter drop-shadow-[0_16px_20px_rgba(0,0,0,0.85)] group-hover:scale-110 transition duration-300" />
            </div>

            <div className="text-center pt-1 border-t border-gold/25">
              <div className="text-[12px] font-serif font-bold text-ivory tracking-wide truncate">
                Temple Haram Long Set
              </div>
              <div className="text-[11px] font-mono text-gold font-bold">
                Wholesale ₹1,080
              </div>
            </div>
          </Link>

          {/* Right Card: Pendant 650 */}
          <Link
            to="/product/3"
            className="tilt-card-right w-[125px] sm:w-[155px] h-[205px] sm:h-[235px] rounded-2xl bg-gradient-to-b from-wine-900 to-wine-950 p-3 flex flex-col justify-between border border-gold/30 shadow-lg relative flex-shrink-0 opacity-90 group hover:opacity-100"
          >
            <div className="text-[9px] uppercase tracking-wider text-gold-light/80 font-bold">Kemp Pendant</div>
            <div className="relative w-full h-24 my-auto overflow-hidden rounded-xl bg-black/30 p-1">
              <img src="/assets/products/pendant-650.jpg" alt="" className="w-full h-full object-contain filter drop-shadow-[0_10px_12px_rgba(0,0,0,0.7)] group-hover:scale-105 transition" />
            </div>
            <div className="text-center pt-1 border-t border-gold/20">
              <div className="text-[11px] font-serif font-bold text-ivory truncate">Floral Pendant Chain</div>
              <div className="text-[10px] font-mono text-gold-light font-bold">Wholesale ₹650</div>
            </div>
          </Link>

        </div>

        {/* Gold Progress indicator */}
        <div className="w-full max-w-[200px] mx-auto mt-2 h-[2px] bg-wine-900/40 rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-gradient-to-r from-gold via-gold-light to-gold rounded-full mx-auto"></div>
        </div>
      </section>

      {/* ==================== 3. SHOP BY CATEGORY ==================== */}
      <section className="py-6 px-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-4 h-[1px] bg-gold"></span>
              <span className="text-[10px] tracking-widest font-semibold uppercase text-gold-light">
                Browse Collections
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
              Shop by Category
            </h2>
          </div>
          <Link 
            to="/catalogue" 
            className="text-xs font-semibold text-gold hover:text-gold-light flex items-center transition"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        {/* 6 Circular Floating Category Tiles */}
        <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2 px-1">
          {coreCategories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/catalogue?category=${cat.slug}`}
              className="flex flex-col items-center flex-shrink-0 group cursor-pointer w-20 sm:w-24"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-wine-900 to-wine-950 p-1 shadow-floating-card border-2 border-gold/50 group-hover:border-gold transition-all duration-300">
                <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center overflow-hidden relative">
                  <img 
                    src={cat.image} 
                    alt={cat.en} 
                    className="w-14 sm:w-16 h-14 sm:h-16 object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300" 
                  />
                </div>
              </div>
              <span className="mt-2 text-[11px] font-medium text-ivory/90 text-center leading-tight group-hover:text-gold-light transition">
                {lang === 'kn' ? cat.kn : cat.en}
              </span>
              <span className="text-[9px] font-mono text-gold-light font-bold mt-0.5">
                {cat.tag}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== 4. AI JEWELLERY STYLIST PROMO BANNER ==================== */}
      <section className="py-4 px-4 max-w-5xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-wine-950 via-wine-900 to-wine-850 border border-gold/40 p-5 sm:p-6 shadow-deep-3d overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold to-gold-light text-wine-950 flex items-center justify-center font-bold shadow-floating-gold shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-light font-bold">
                  Powered by Google Gemini AI
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-ivory leading-tight mt-0.5">
                  Mahalaxmi AI Stylist &amp; Advisor
                </h3>
                <p className="text-xs text-ivory/70 mt-1 max-w-md">
                  Ask our AI to match ₹700, ₹1,200, and ₹2,500 gold chains with sarees, calculate wholesale margins, or curate temple sets.
                </p>
              </div>
            </div>

            <button
              onClick={() => setAiModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-light text-wine-950 font-sans font-bold text-xs tracking-wider uppercase shadow-floating-gold hover:opacity-95 active:scale-95 transition"
            >
              Ask AI Stylist
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 5. ALL REAL PRODUCTS WITH PRICES FROM SCREENSHOTS ==================== */}
      <section className="py-6 px-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-4 h-[1px] bg-gold"></span>
              <span className="text-[10px] tracking-widest font-semibold uppercase text-gold-light">
                Verified Catalogue Pricing
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
              Chains, Harams &amp; Kada Collections
            </h2>
          </div>
          <span className="text-xs text-gold-light font-medium">
            {products.length} Designs Available
          </span>
        </div>

        {/* Responsive Grid with all products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ==================== 6. KALABURAGI LOCAL DELIVERY PIN CODE CHECKER ==================== */}
      <section className="py-6 px-4 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-[#37141e]/90 border border-gold/30 p-5 sm:p-6 shadow-floating-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-gold">
                <Truck className="w-5 h-5 text-gold-light" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-ivory">
                  Local Kalaburagi Delivery Check
                </h3>
              </div>
              <p className="text-xs text-ivory/70">
                Express same-day dispatch for PIN codes 585101 to 585105. Free shipping on orders above ₹1,500.
              </p>
            </div>

            <form onSubmit={handleCheckPincode} className="flex w-full sm:w-auto items-center space-x-2">
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                maxLength={6}
                placeholder="Enter PIN (e.g. 585101)"
                className="w-full sm:w-44 px-3.5 py-2 rounded-xl bg-black/40 border border-gold/40 text-ivory text-xs sm:text-sm font-mono tracking-wider focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={checkingPin}
                className="px-4 py-2 rounded-xl bg-gold text-wine-950 font-bold text-xs uppercase tracking-wider hover:bg-gold-light transition active:scale-95 shrink-0"
              >
                {checkingPin ? 'Checking...' : 'Check'}
              </button>
            </form>
          </div>

          {pincodeResult && (
            <div className="mt-4 pt-3 border-t border-gold/20 flex items-center space-x-2 text-xs">
              {pincodeResult.is_serviceable ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_#D4AF6A] shrink-0"></span>
                  <span className="text-gold-light font-semibold">
                    {pincodeResult.locality || 'Express Delivery Available'}
                  </span>
                  <span className="text-ivory/70">
                    · Delivery Fee: ₹{pincodeResult.delivery_fee ?? 40} (Free above ₹{pincodeResult.free_delivery_threshold ?? 1500})
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
                  <span className="text-amber-300">
                    {pincodeResult.message || 'PIN code outside direct local delivery zone.'}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ==================== 7. FLOATING WHATSAPP LUXURY BUTTON ==================== */}
      <a 
        href="https://wa.me/919481242188?text=Hello%20Mahalaxmi%20Novelties%2C%20I%20would%20like%20to%20order%20jewellery%20from%20your%20catalogue." 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full bg-wine-950/80 backdrop-blur-xl border border-gold/70 shadow-floating-gold flex items-center justify-center active:scale-95 transition-transform group" 
        aria-label="Direct Wholesale WhatsApp Chat"
        title="WhatsApp Wholesale Enquiry"
      >
        <div className="relative flex items-center justify-center">
          <svg className="w-6 h-6 text-gold group-hover:text-gold-light transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.11 7.44C8.95 7.44 8.68 7.5 8.46 7.74C8.24 7.98 7.62 8.56 7.62 9.73C7.62 10.9 8.47 12.03 8.59 12.19C8.71 12.35 10.23 14.77 12.63 15.71C14.62 16.5 15.03 16.34 15.47 16.3C15.91 16.26 16.89 15.72 17.09 15.15C17.29 14.58 17.29 14.1 17.23 14C17.17 13.9 17.01 13.84 16.77 13.72C16.53 13.6 15.35 13.02 15.13 12.94C14.91 12.86 14.75 12.82 14.59 13.06C14.43 13.3 13.97 13.84 13.83 14C13.69 14.16 13.55 14.18 13.31 14.06C13.07 13.94 12.3 13.69 11.39 12.88C10.68 12.25 10.2 11.47 10.06 11.23C9.92 10.99 10.05 10.86 10.17 10.74C10.28 10.63 10.42 10.45 10.54 10.31C10.66 10.17 10.7 10.07 10.78 9.91C10.86 9.75 10.82 9.61 10.76 9.49C10.7 9.37 10.24 8.24 10.04 7.78C9.85 7.33 9.66 7.39 9.52 7.38C9.39 7.38 9.24 7.44 9.11 7.44Z"/>
          </svg>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gold border border-white"></span>
        </div>
      </a>

      {/* AI Stylist Modal */}
      <AiStylistModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  );
}
