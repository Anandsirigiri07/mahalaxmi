import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  ArrowLeft,
  ChevronDown,
  Check
} from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/common/ProductCard';

const categoryTabs = [
  { slug: '', en: 'All Collections', kn: 'ಎಲ್ಲಾ ಆಭರಣಗಳು' },
  { slug: 'patli-bangles', en: 'Kada & Patli', kn: 'ಪಟ್ಲಿ ಬಳೆಗಳು' },
  { slug: 'necklaces', en: 'Temple Harams', kn: 'ಹಾರಗಳು / ನೆಕ್ಲೇಸ್' },
  { slug: 'agra-payal', en: 'Agra Payal', kn: 'ಆಗ್ರಾ ಪಾಯಲ್' },
  { slug: 'matte-cz-jewellery', en: 'Kemp Sets', kn: 'ಮ್ಯಾಟ್ & ಸಿ.ಝಡ್.' },
  { slug: 'roldgold-guarantee-chains', en: 'Roldgold Chains', kn: 'ರೋಲ್ಡ್‌ಗೋಲ್ಡ್ ಚೈನ್ಸ್' },
  { slug: 'finger-rings-lockets', en: 'Rings & Lockets', kn: 'ಉಂಗುರ & ಲಾಕೆಟ್' }
];

const verifiedProducts = [
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

export default function CataloguePage() {
  const { lang } = useLanguage();
  const { orderMode, setOrderMode } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(verifiedProducts);
  const [loading, setLoading] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  const selectedCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategory) params.category_slug = selectedCategory;
        if (searchTerm) params.search = searchTerm;
        if (sortBy) params.sort = sortBy;

        const res = await api.get('/products', { params });
        if (res.data.success && res.data.products && res.data.products.length > 0) {
          setProducts(res.data.products);
        } else {
          let filtered = [...verifiedProducts];
          if (selectedCategory) {
            filtered = filtered.filter(p => p.category_slug === selectedCategory);
          }
          if (searchTerm) {
            filtered = filtered.filter(p => 
              p.name_en.toLowerCase().includes(searchTerm.toLowerCase()) || 
              p.sku.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          setProducts(filtered);
        }
      } catch (err) {
        let filtered = [...verifiedProducts];
        if (selectedCategory) {
          filtered = filtered.filter(p => p.category_slug === selectedCategory);
        }
        setProducts(filtered);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, sortBy]);

  const handleCategorySelect = (slug) => {
    if (slug) {
      searchParams.set('category', slug);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchParams.set('search', searchTerm.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  let displayedProducts = inStockOnly 
    ? products.filter(p => p.stock_status !== 'out_of_stock')
    : products;

  if (sortBy === 'price_asc') {
    displayedProducts = [...displayedProducts].sort((a, b) => a.wholesale_price - b.wholesale_price);
  } else if (sortBy === 'price_desc') {
    displayedProducts = [...displayedProducts].sort((a, b) => b.wholesale_price - a.wholesale_price);
  }

  return (
    <div className="min-h-screen bg-[#280812] text-ivory pb-28 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Top Breadcrumb & Quick Info Bar */}
        <div className="flex items-center justify-between py-1 px-1">
          <div className="flex items-center space-x-2">
            <Link
              to="/"
              className="w-8 h-8 rounded-full bg-wine-900 border border-gold/30 flex items-center justify-center text-gold-light active:scale-95 transition"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono uppercase tracking-wider text-outline">
              <Link to="/" className="hover:text-gold transition">HOME</Link>
              <span>/</span>
              <span className="text-gold font-semibold">
                {selectedCategory ? selectedCategory.toUpperCase().replace('-', ' ') : 'ALL JEWELLERY'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-gold-light text-[11px] font-bold bg-wine-900/80 border border-gold/30 px-3 py-1 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_#D4AF6A]"></span>
            <span>{displayedProducts.length} DESIGNS</span>
          </div>
        </div>

        {/* Editorial Sub-Hero Banner */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-wine-950 via-wine-900 to-wine-800 p-5 sm:p-6 border border-gold/30 shadow-deep-3d">
          <div className="relative z-10 max-w-lg space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold-light font-bold">
              Mahalaxmi Heritage Vault · Kalaburagi
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory gold-text-glow leading-tight">
              {selectedCategory === 'roldgold-guarantee-chains' 
                ? 'Roldgold Chains & Thali Collection' 
                : selectedCategory === 'necklaces'
                ? 'Temple Harams & Necklaces'
                : selectedCategory === 'patli-bangles'
                ? 'Patli Bangles & Kadas'
                : 'Jewellery Wholesale & Retail Vitrine'}
            </h1>
            <p className="text-xs text-ivory/75 mt-1">
              Verified supplier pricing with dual rates: Wholesale (₹650 to ₹2,500) and Retail. Order individual pieces or full dealer lots.
            </p>
          </div>

          <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-gold/15 blur-2xl pointer-events-none"></div>
        </div>

        {/* Search Bar & Order Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by SKU (e.g. MN-RG-1050), chains, haram..."
              className="w-full bg-[#1D050D] text-ivory placeholder:text-ivory/40 border border-gold/35 rounded-xl pl-9 pr-20 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-gold"
            />
            <Search className="w-4 h-4 text-gold absolute left-3 top-3" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gold text-wine-950 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gold-light transition"
            >
              Search
            </button>
          </form>

          {/* Wholesale Mode Toggle */}
          <div className="flex items-center space-x-1 p-1 bg-black/40 border border-gold/30 rounded-full w-full sm:w-auto shrink-0">
            <button
              onClick={() => setOrderMode('retail')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition ${
                orderMode === 'retail'
                  ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 font-bold shadow-sm'
                  : 'text-ivory/70 hover:text-gold-light'
              }`}
            >
              Retail (1+ pcs)
            </button>
            <button
              onClick={() => setOrderMode('wholesale')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition ${
                orderMode === 'wholesale'
                  ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 font-bold shadow-sm'
                  : 'text-ivory/70 hover:text-gold-light'
              }`}
            >
              Wholesale (MOQ)
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
          {categoryTabs.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => handleCategorySelect(tab.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                selectedCategory === tab.slug
                  ? 'bg-gold text-wine-950 font-bold border-gold shadow-floating-gold'
                  : 'bg-wine-900/60 text-ivory/80 border-gold/30 hover:border-gold hover:text-gold-light'
              }`}
            >
              {lang === 'kn' ? tab.kn : tab.en}
            </button>
          ))}
        </div>

        {/* Floating Glass Filter & Sorting Pill Bar */}
        <div className="sticky top-14 z-20 py-1.5 backdrop-blur-md bg-[#280812]/85">
          <div className="w-full bg-[#37141e]/90 border border-gold/30 rounded-full px-3 py-1.5 shadow-floating-card flex items-center justify-between gap-2">
            
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs transition active:scale-95 ${
                inStockOnly
                  ? 'bg-gold text-wine-950 font-bold shadow-sm'
                  : 'bg-wine-950/70 text-gold-light border border-gold/30'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>In Stock Only</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1.5 text-xs text-ivory/80">
              <span className="text-outline text-[11px] hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-wine-950 text-gold-light text-xs rounded-full px-2.5 py-1 border border-gold/30 focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="newest">Featured</option>
                <option value="price_asc">Price: Low to High (₹650+)</option>
                <option value="price_desc">Price: High to Low (₹2,500)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2-Column Luxury Jewellery Vitrine Grid */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
            {displayedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#37141e]/50 rounded-3xl border border-gold/20 p-6">
            <Sparkles className="w-10 h-10 text-gold mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-ivory">
              No Jewellery Found
            </h3>
            <p className="text-xs text-ivory/70 mt-1 max-w-sm mx-auto">
              No matching pieces found for your filter.
            </p>
            <button
              onClick={() => {
                setSearchParams({});
                setSearchTerm('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-gold text-wine-950 font-bold text-xs uppercase"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
