import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Truck, 
  ShoppingBag,
  Share2,
  Phone
} from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const finishes = [
  '24K Micro-Gold Electroplate',
  'Roldgold Guarantee',
  'Antique Matte Finish'
];

const lengths = ['24 Inch', '30 Inch', '36 Inch'];

const verifiedCatalog = {
  1: {
    id: 1,
    sku: 'MN-VJ-1250',
    name_en: 'Royal Kemp Stone Antique Kada / Bajuband Pair',
    name_kn: 'ರಾಯಲ್ ಕೆಂಪ್ ಕಲ್ಲು ಆಂಟಿಕ್ ಕಡಾ / ಬಾಜುಬಂದ್ ಜೋಡಿ',
    category_slug: 'patli-bangles',
    description_en: 'Traditional South Indian antique gold finish kada pair studded with sparkling emerald and ruby kemp stones and hanging golden cluster drops. 24K micro-gold plated brass base for wedding longevity.',
    description_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ದಕ್ಷಿಣ ಭಾರತೀಯ ಆಂಟಿಕ್ ಗೋಲ್ಡ್ ಫಿನಿಶ್ ಕಡಾ ಜೋಡಿ, ಹೊಳೆಯುವ ಕೆಂಪು ಮತ್ತು ಹಸಿರು ಕೆಂಪ್ ಕಲ್ಲುಗಳಿಂದ ಕೂಡಿದೆ.',
    retail_price: 2650.0,
    wholesale_price: 1250.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/kada-1250.jpg'
  },
  12: {
    id: 12,
    sku: 'MN-PB-450',
    name_en: 'Classic Micro-Gold Daily Wear Patli Bangles Set of 4',
    name_kn: 'ಕ್ಲಾಸಿಕ್ ಮೈಕ್ರೋ-ಗೋಲ್ಡ್ ನಿತ್ಯೋಪಯೋಗಿ ಪಟ್ಲಿ ಬಳೆಗಳು (4ರ ಸೆಟ್)',
    category_slug: 'patli-bangles',
    description_en: 'Set of 4 slender, high-luster micro gold plated patli bangles with milled beaded edges for daily elegance and durability.',
    description_kn: '4 ತೆಳುವಾದ, ಉತ್ತಮ ಹೊಳಪಿನ ಮೈಕ್ರೋ ಗೋಲ್ಡ್ ಪ್ಲೇಟೆಡ್ ಪಟ್ಲಿ ಬಳೆಗಳು.',
    retail_price: 899.0,
    wholesale_price: 450.0,
    moq: 12,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/bangles-450.jpg'
  },
  13: {
    id: 13,
    sku: 'MN-PB-850',
    name_en: 'Diamond-Cut Textured Royal 1-Gram Gold Patli Bangle Set of 4',
    name_kn: 'ಡೈಮಂಡ್-ಕಟ್ ವಿನ್ಯಾಸದ ರಾಯಲ್ 1-ಗ್ರಾಂ ಗೋಲ್ಡ್ ಪಟ್ಲಿ ಬಳೆಗಳು',
    category_slug: 'patli-bangles',
    description_en: 'Set of 4 premium 1-gram gold patli bangles featuring precision diamond-cut starburst facets that sparkle like solid 22k gold.',
    description_kn: 'ಡೈಮಂಡ್-ಕಟ್ ವಿನ್ಯಾಸದ ಪ್ರೀಮಿಯಂ 1-ಗ್ರಾಂ ಗೋಲ್ಡ್ ಪಟ್ಲಿ ಬಳೆಗಳ ಸೆಟ್.',
    retail_price: 1699.0,
    wholesale_price: 850.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/bangles-850.jpg'
  },
  14: {
    id: 14,
    sku: 'MN-PB-950',
    name_en: 'Antique Temple Nakshi Elephant Face Kada Single',
    name_kn: 'ಆಂಟಿಕ್ ಟೆಂಪಲ್ ನಕ್ಷಿ ಗಜ ಮುಖದ ಕಡಾ',
    category_slug: 'patli-bangles',
    description_en: 'Grand antique gold kada featuring hand-carved Gaja (Elephant) motif terminals with ruby kemp eyes and floral repousse body.',
    description_kn: 'ಭವ್ಯ ಆಂಟಿಕ್ ಗೋಲ್ಡ್ ಗಜ ಮುಖದ ಕಡಾ, ಕೆಂಪು ಕಲ್ಲುಗಳಿಂದ ಅಲಂಕೃತವಾಗಿದೆ.',
    retail_price: 1899.0,
    wholesale_price: 950.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/kada-950.jpg'
  },
  2: {
    id: 2,
    sku: 'MN-NK-1080',
    name_en: 'Heritage Temple Haram Long Necklace with Floral Pendant',
    name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ದೇವಸ್ಥಾನ ಹಾರ ಉದ್ದನೆಯ ನೆಕ್ಲೇಸ್',
    category_slug: 'necklaces',
    description_en: 'Exquisite South Indian temple haram long necklace set on dark velvet display, embossed with floral and leaf motifs and teardrop ruby emerald stones with micro-cluster tassels.',
    description_kn: 'ಭವ್ಯವಾದ ದಕ್ಷಿಣ ಭಾರತೀಯ ದೇವಸ್ಥಾನ ಶೈಲಿಯ ಉದ್ದನೆಯ ಹಾರ, ಕೆಂಪು ಹಸಿರು ಕಲ್ಲುಗಳಿಂದ ಕೂಡಿದೆ.',
    retail_price: 2450.0,
    wholesale_price: 1080.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/haram-1080.jpg'
  },
  15: {
    id: 15,
    sku: 'MN-NK-1450',
    name_en: 'Royal Lakshmi Kasu Malai Antique Long Temple Haram',
    name_kn: 'ರಾಯಲ್ ಲಕ್ಷ್ಮೀ ಕಾಸು ಮಾಲೆ ಆಂಟಿಕ್ ಉದ್ದನೆಯ ದೇವಸ್ಥಾನ ಹಾರ',
    category_slug: 'necklaces',
    description_en: 'Traditional South Indian Kasu Malai featuring overlapping embossed Goddess Lakshmi coins with ruby kemp cabochons and droplet tassels.',
    description_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಲಕ್ಷ್ಮೀ ಕಾಸಿನ ಮಾಲೆ, ಶುಭ ಸಮಾರಂಭಗಳಿಗೆ ಸೂಕ್ತ.',
    retail_price: 2899.0,
    wholesale_price: 1450.0,
    moq: 3,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/haram-1450.jpg'
  },
  16: {
    id: 16,
    sku: 'MN-NK-980',
    name_en: 'Traditional Peacock Nakshi Bridal Choker with Kemp Stones',
    name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ನವಿಲು ನಕ್ಷಿ ಬ್ರೈಡಲ್ ಚೋಕರ್ ನೆಕ್ಲೇಸ್',
    category_slug: 'necklaces',
    description_en: 'Opulent South Indian antique gold choker necklace with dancing peacock carvings, kemp stones, and golden ghungroo fringe.',
    description_kn: 'ನವಿಲು ಕೆತ್ತನೆಯ ಆಂಟಿಕ್ ಗೋಲ್ಡ್ ಬ್ರೈಡಲ್ ಚೋಕರ್.',
    retail_price: 1950.0,
    wholesale_price: 980.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/choker-980.jpg'
  },
  17: {
    id: 17,
    sku: 'MN-NK-1650',
    name_en: 'Grand Manga Malai South Indian Heritage Haram',
    name_kn: 'ಗ್ರ್ಯಾಂಡ್ ಮಾವಿನಕಾಯಿ ಮಾಲೆ (ಮಂಗಾ ಮಾಲೈ) ಹೆರಿಟೇಜ್ ಹಾರ',
    category_slug: 'necklaces',
    description_en: 'Classic South Indian Manga Malai (Mango motif chain) studded with ruby cabochons and detailed gold leaf repousse.',
    description_kn: 'ಶಾಸ್ತ್ರೀಯ ದಕ್ಷಿಣ ಭಾರತೀಯ ಮಾವಿನಕಾಯಿ ವಿನ್ಯಾಸದ ಹಾರ.',
    retail_price: 3299.0,
    wholesale_price: 1650.0,
    moq: 2,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/haram-1650.jpg'
  },
  18: {
    id: 18,
    sku: 'MN-AP-650',
    name_en: 'Royal Heritage Agra Meenakari Enamelled Bridal Payal Pair',
    name_kn: 'ರಾಯಲ್ ಹೆರಿಟೇಜ್ ಆಗ್ರಾ ಮೀನಾಕಾರಿ ಬ್ರೈಡಲ್ ಪಾಯಲ್ ಜೋಡಿ',
    category_slug: 'agra-payal',
    description_en: 'Authentic Agra silver plated bridal payal pair with vivid ruby-red and green meenakari enamel medallions and cascading musical ghungroo bells.',
    description_kn: 'ಅಸಲಿ ಆಗ್ರಾ ಸಿಲ್ವರ್ ಕೋಟೆಡ್ ಮೀನಾಕಾರಿ ಬ್ರೈಡಲ್ ಕಾಲುಂಗುರ / ಪಾಯಲ್ ಜೋಡಿ.',
    retail_price: 1299.0,
    wholesale_price: 650.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/payal-650.jpg'
  },
  19: {
    id: 19,
    sku: 'MN-AP-350',
    name_en: 'Genuine Agra Daily-Wear Silver Coated Ghungroo Payal Pair',
    name_kn: 'ಅಸಲಿ ಆಗ್ರಾ ನಿತ್ಯೋಪಯೋಗಿ ಬೆಳ್ಳಿ ಕೋಟೆಡ್ ಗಂಟಿನ ಪಾಯಲ್ ಜೋಡಿ',
    category_slug: 'agra-payal',
    description_en: 'Durable daily wear silver coated payals from Agra with rhythmic sweet-sounding ghungroo bells and sturdy S-hook clasp.',
    description_kn: 'ನಿತ್ಯ ಧರಿಸಲು ಯೋಗ್ಯವಾದ ಆಗ್ರಾ ಬೆಳ್ಳಿ ಕೋಟೆಡ್ ಪಾಯಲ್ ಜೋಡಿ.',
    retail_price: 699.0,
    wholesale_price: 350.0,
    moq: 10,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/payal-350.jpg'
  },
  20: {
    id: 20,
    sku: 'MN-AP-480',
    name_en: 'Traditional Broad Bridal Agra Chandi Finish Payal Pair',
    name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಅಗಲವಾದ ಆಗ್ರಾ ಚಾಂದಿ ಫಿನಿಶ್ ಬ್ರೈಡಲ್ ಪಾಯಲ್',
    category_slug: 'agra-payal',
    description_en: 'Heavy traditional broad mesh bridal anklets with double-layer bell drops and embossed antique flower joints.',
    description_kn: 'ಭಾರವಾದ ಸಾಂಪ್ರದಾಯಿಕ ಆಗ್ರಾ ಮದುವೆ ಪಾಯಲ್ ಜೋಡಿ.',
    retail_price: 999.0,
    wholesale_price: 480.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/payal-480.jpg'
  },
  21: {
    id: 21,
    sku: 'MN-AP-220',
    name_en: 'Handcrafted Agra Daily Silver Anklet with Delicate Beads',
    name_kn: 'ಆಗ್ರಾ ಸೂಕ್ಷ್ಮ ಮಣಿಗಳುಳ್ಳ ಬೆಳ್ಳಿ ಸರ ಪಾಯಲ್ ಜೋಡಿ',
    category_slug: 'agra-payal',
    description_en: 'Lightweight and chic silver plated daily anklets with polished silver bead stations and gentle musical bells.',
    description_kn: 'ಹಗುರವಾದ ಮತ್ತು ಸುಂದರವಾದ ಆಗ್ರಾ ಸಿಲ್ವರ್ ಆಂಕ್ಲೆಟ್.',
    retail_price: 450.0,
    wholesale_price: 220.0,
    moq: 12,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/payal-220.jpg'
  },
  3: {
    id: 3,
    sku: 'MN-CH-650',
    name_en: 'Classic Kemp Stone Floral Pendant Long Chain',
    name_kn: 'ಕ್ಲಾಸಿಕ್ ಕೆಂಪ್ ಕಲ್ಲು ಹೂವಿನ ಲಾಕೆಟ್ ಸರ',
    category_slug: 'matte-cz-jewellery',
    description_en: 'Delicate 1-gram gold plated chain with central floral kemp pendant and hanging droplet accents. Perfect for festive and temple functions.',
    description_kn: 'ಕೆಂಪ್ ಕಲ್ಲಿನ ಹೂವಿನ ಲಾಕೆಟ್ ಹೊಂದಿರುವ ಆಕರ್ಷಕ ಸರ.',
    retail_price: 1450.0,
    wholesale_price: 650.0,
    moq: 10,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/pendant-650.jpg'
  },
  22: {
    id: 22,
    sku: 'MN-CZ-850',
    name_en: 'Premium Ruby-Green Kemp Bridal Choker Set with Matching Jhumkas',
    name_kn: 'ಪ್ರೀಮಿಯಂ ಕೆಂಪು-ಹಸಿರು ಕೆಂಪ್ ಬ್ರೈಡಲ್ ಚೋಕರ್ & ಜುಮ್ಕಿ ಸೆಟ್',
    category_slug: 'matte-cz-jewellery',
    description_en: 'Festive South Indian choker set with matching temple jhumkas, encrusted with kempu cabochons and lustrous pearl drops.',
    description_kn: 'ಮದುವೆ ಹಾಗೂ ಹಬ್ಬಗಳಿಗೆ ಸೂಕ್ತವಾದ ಕೆಂಪ್ ಚೋಕರ್ ಮತ್ತು ಜುಮ್ಕಿ ಸೆಟ್.',
    retail_price: 1750.0,
    wholesale_price: 850.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/cz-choker-850.jpg'
  },
  23: {
    id: 23,
    sku: 'MN-CZ-1150',
    name_en: 'Matte Antique Goddess Lakshmi Pendant Necklace Set',
    name_kn: 'ಮ್ಯಾಟ್ ಆಂಟಿಕ್ ಲಕ್ಷ್ಮೀ ದೇವಿ ಪೆಂಡೆಂಟ್ ನೆಕ್ಲೇಸ್ ಸೆಟ್',
    category_slug: 'matte-cz-jewellery',
    description_en: 'High-grade matte gold necklace set with presiding Lakshmi motif, high-sparkle cubic zirconia, and emerald kemp stones.',
    description_kn: 'ಲಕ್ಷ್ಮೀ ದೇವಿ ಕೆತ್ತನೆಯ ಮ್ಯಾಟ್ ಆಂಟಿಕ್ ನೆಕ್ಲೇಸ್ ಸೆಟ್.',
    retail_price: 2299.0,
    wholesale_price: 1150.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/matte-set-1150.jpg'
  },
  4: {
    id: 4,
    sku: 'MN-RG-700',
    name_en: 'Micro Gold Flat Mesh Mangalsutra Chain with Black Beads',
    name_kn: 'ಮೈಕ್ರೋ ಗೋಲ್ಡ್ ಫ್ಲ್ಯಾಟ್ ಮೆಶ್ ಮಾಂಗಲ್ಯ ಸರ ಕರಿಮಣಿ',
    category_slug: 'roldgold-guarantee-chains',
    description_en: 'Sleek and durable daily-wear micro-gold flat mesh link chain with alternating auspicious black bead stations.',
    description_kn: 'ನಿತ್ಯ ಧರಿಸಲು ಸೂಕ್ತವಾದ ಮೈಕ್ರೋ-ಗೋಲ್ಡ್ ಫ್ಲ್ಯಾಟ್ ಮೆಶ್ ಮಾಂಗಲ್ಯ ಸರ ಕರಿಮಣಿ.',
    retail_price: 1550.0,
    wholesale_price: 700.0,
    moq: 10,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-700.jpg',
    craft_image: '/assets/products/chain-700-craft.jpg'
  },
  5: {
    id: 5,
    sku: 'MN-RG-1050',
    name_en: 'Dual Strand Box Link Gold Chain with Black Bead Stations',
    name_kn: 'ಡಬಲ್ ಎಳೆ ಬಾಕ್ಸ್ ಲಿಂಕ್ ಗೋಲ್ಡ್ ಚೈನ್ ಕರಿಮಣಿ ಸರ',
    category_slug: 'roldgold-guarantee-chains',
    description_en: 'Double line box chain handcrafted with genuine 1-year guarantee roldgold finish and midnight black crystal beads.',
    description_kn: 'ಡಬಲ್ ಎಳೆ ಬಾಕ್ಸ್ ಲಿಂಕ್ ಗೋಲ್ಡ್ ಚೈನ್ ಕರಿಮಣಿ ಸರ.',
    retail_price: 2250.0,
    wholesale_price: 1050.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-1050.jpg',
    craft_image: '/assets/products/chain-1050-craft.jpg'
  },
  6: {
    id: 6,
    sku: 'MN-RG-1200',
    name_en: 'Traditional Double Strand 1-Gram Gold Chain with Clusters',
    name_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಡಬಲ್ ಎಳೆ 1-ಗ್ರಾಂ ಗೋಲ್ಡ್ ಚೈನ್',
    category_slug: 'roldgold-guarantee-chains',
    description_en: 'Rich double-strand micro-electroplated gold chain with spaced black bead cluster segments for festive grandeur.',
    description_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಡಬಲ್ ಎಳೆ 1-ಗ್ರಾಂ ಗೋಲ್ಡ್ ಚೈನ್.',
    retail_price: 2600.0,
    wholesale_price: 1200.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-1200.jpg',
    craft_image: '/assets/products/chain-1200-craft.jpg'
  },
  7: {
    id: 7,
    sku: 'MN-RG-1250',
    name_en: 'Heritage Double Strand Gold Box Chain with Black Crystals',
    name_kn: 'ಹೆರಿಟೇಜ್ ಡಬಲ್ ಎಳೆ ಗೋಲ್ಡ್ ಬಾಕ್ಸ್ ಚೈನ್',
    category_slug: 'roldgold-guarantee-chains',
    description_en: 'Heavy-gauge double strand box links interlocking with faceted black crystal beads for lasting bridal heirloom luster.',
    description_kn: 'ಹೆರಿಟೇಜ್ ಡಬಲ್ ಎಳೆ ಗೋಲ್ಡ್ ಬಾಕ್ಸ್ ಚೈನ್.',
    retail_price: 2750.0,
    wholesale_price: 1250.0,
    moq: 6,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-1250.jpg',
    craft_image: '/assets/products/chain-1250-craft.jpg'
  },
  8: {
    id: 8,
    sku: 'MN-RG-1500',
    name_en: 'Premium Double Flat Ribbon 1-Gram Gold Thali Chain',
    name_kn: 'ಪ್ರೀಮಿಯಂ ಡಬಲ್ ಫ್ಲ್ಯಾಟ್ ರಿಬ್ಬನ್ 1-ಗ್ರಾಂ ಗೋಲ್ಡ್ ತಾಳಿ ಚೈನ್',
    category_slug: 'roldgold-guarantee-chains',
    description_en: 'Wide double flat ribbon herringbone links with reinforced black bead segments, offering authentic sovereign gold appearance.',
    description_kn: 'ಪ್ರೀಮಿಯಂ ಡಬಲ್ ಫ್ಲ್ಯಾಟ್ ರಿಬ್ಬನ್ 1-ಗ್ರಾಂ ಗೋಲ್ಡ್ ತಾಳಿ ಚೈನ್.',
    retail_price: 3250.0,
    wholesale_price: 1500.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-1500.jpg',
    craft_image: '/assets/products/chain-1500-craft.jpg'
  },
  9: {
    id: 9,
    sku: 'MN-RG-1550',
    name_en: 'Royal Double Layered Thali Chain with Black Bead Motifs',
    name_kn: 'ರಾಯಲ್ ಡಬಲ್ ಲೇಯರ್ಡ್ ತಾಳಿ ಚೈನ್ ಕರಿಮಣಿ ವಿನ್ಯಾಸ',
    category_slug: 'roldgold-guarantee-chains',
    description_en: 'Dual layered heavy thali chain featuring intricate golden beads and polished black stone accents, designed for Karnataka brides.',
    description_kn: 'ರಾಯಲ್ ಡಬಲ್ ಲೇಯರ್ಡ್ ತಾಳಿ ಚೈನ್ ಕರಿಮಣಿ ವಿನ್ಯಾಸ.',
    retail_price: 3400.0,
    wholesale_price: 1550.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-1550.jpg',
    craft_image: '/assets/products/chain-1550-craft.jpg'
  },
  10: {
    id: 10,
    sku: 'MN-RG-1800',
    name_en: 'Broad Double Strand Fancy Link Gold Chain with Black Beads',
    name_kn: 'ಬ್ರಾಡ್ ಡಬಲ್ ಎಳೆ ಫ್ಯಾನ್ಸಿ ಲಿಂಕ್ ಗೋಲ್ಡ್ ಚೈನ್',
    category_slug: 'roldgold-guarantee-chains',
    description_en: 'Heavy weight broad double strand fancy interlocking links with twin-bead clusters for celebratory occasions.',
    description_kn: 'ಬ್ರಾಡ್ ಡಬಲ್ ಎಳೆ ಫ್ಯಾನ್ಸಿ ಲಿಂಕ್ ಗೋಲ್ಡ್ ಚೈನ್.',
    retail_price: 3950.0,
    wholesale_price: 1800.0,
    moq: 4,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-1800.jpg',
    craft_image: '/assets/products/chain-1800-craft.jpg'
  },
  11: {
    id: 11,
    sku: 'MN-RG-2500',
    name_en: 'Opulent Grand 36-Inch Double Strand Bridal Gold Chain',
    name_kn: 'ಭವ್ಯ ಗ್ರ್ಯಾಂಡ್ 36-ಇಂಚು ಡಬಲ್ ಎಳೆ ಬ್ರೈಡಲ್ ಗೋಲ್ಡ್ ಚೈನ್',
    category_slug: 'roldgold-guarantee-chains',
    description_en: 'Masterpiece 36-inch continuous double-strand bridal chain with supreme gold density, high-micron plating, and triple-knotted black beads.',
    description_kn: 'ಭವ್ಯ ಗ್ರ್ಯಾಂಡ್ 36-ಇಂಚು ಡಬಲ್ ಎಳೆ ಬ್ರೈಡಲ್ ಗೋಲ್ಡ್ ಚೈನ್.',
    retail_price: 5400.0,
    wholesale_price: 2500.0,
    moq: 2,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/chain-2500.jpg',
    craft_image: '/assets/products/chain-2500-craft.jpg'
  },
  24: {
    id: 24,
    sku: 'MN-FR-280',
    name_en: 'Adjustable Floral CZ Micro-Gold Plated Finger Ring',
    name_kn: 'ಅಡ್ಜಸ್ಟಬಲ್ ಹೂವಿನ ಸಿ.ಝಡ್. ಮೈಕ್ರೋ ಗೋಲ್ಡ್ ಉಂಗುರ',
    category_slug: 'finger-rings-lockets',
    description_en: 'Dazzling cubic zirconia floral cluster finger ring with adjustable shank in 24k micro-gold plating.',
    description_kn: 'ಹೊಳೆಯುವ ಸಿ.ಝಡ್. ಹೂವಿನ ಮಾದರಿಯ ಅಡ್ಜಸ್ಟಬಲ್ ಗೋಲ್ಡ್ ಉಂಗುರ.',
    retail_price: 599.0,
    wholesale_price: 280.0,
    moq: 12,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/ring-280.jpg'
  },
  25: {
    id: 25,
    sku: 'MN-LK-320',
    name_en: 'Auspicious Lord Ganesha Embossed 1-Gram Gold Temple Locket',
    name_kn: 'ಶುಭ ಗಣೇಶ ಕೆತ್ತನೆಯ 1-ಗ್ರಾಂ ಗೋಲ್ಡ್ ದೇವಸ್ಥಾನ ಲಾಕೆಟ್',
    category_slug: 'finger-rings-lockets',
    description_en: 'Sacred Vighnaharta Ganesha embossed temple locket with fine antique filigree border and ruby stone accent.',
    description_kn: 'ಗಣಪತಿ ಕೆತ್ತನೆಯ ಸಾಂಪ್ರದಾಯಿಕ 1-ಗ್ರಾಂ ಗೋಲ್ಡ್ ಲಾಕೆಟ್.',
    retail_price: 650.0,
    wholesale_price: 320.0,
    moq: 10,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/locket-320.jpg'
  },
  26: {
    id: 26,
    sku: 'MN-LK-380',
    name_en: 'Goddess Mahalakshmi Heritage Coin Pendant Locket',
    name_kn: 'ಮಹಾಲಕ್ಷ್ಮೀ ದೇವಿ ಹೆರಿಟೇಜ್ ಕಾಯಿನ್ ಪೆಂಡೆಂಟ್ ಲಾಕೆಟ್',
    category_slug: 'finger-rings-lockets',
    description_en: 'Auspicious Lakshmi Devi coin locket surrounded by micro-pearl beading and radiant gold electroplate for prosperity.',
    description_kn: 'ಮಹಾಲಕ್ಷ್ಮೀ ನಾವೆಲ್ಟೀಸ್ ಸಿಗ್ನೇಚರ್ ಲಕ್ಷ್ಮೀ ದೇವಿ ಕಾಯಿನ್ ಲಾಕೆಟ್.',
    retail_price: 799.0,
    wholesale_price: 380.0,
    moq: 10,
    stock_status: 'in_stock',
    available_stock: 100,
    primary_image: '/assets/products/locket-380.jpg'
  }
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(verifiedCatalog[id] || verifiedCatalog[1]);
  const [selectedImage, setSelectedImage] = useState(product.primary_image);
  const [buyMode, setBuyMode] = useState('wholesale');
  const [selectedFinish, setSelectedFinish] = useState(finishes[0]);
  const [selectedLength, setSelectedLength] = useState('30 Inch');
  const [quantity, setQuantity] = useState(product.moq || 4);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success && res.data.product) {
          const p = res.data.product;
          setProduct(p);
          setSelectedImage(p.primary_image || p.image_url || '/assets/products/chain-700.jpg');
          setQuantity(p.moq || p.min_order_qty || 4);
        } else if (verifiedCatalog[id]) {
          setProduct(verifiedCatalog[id]);
          setSelectedImage(verifiedCatalog[id].primary_image);
          setQuantity(verifiedCatalog[id].moq);
        }
      } catch (err) {
        if (verifiedCatalog[id]) {
          setProduct(verifiedCatalog[id]);
          setSelectedImage(verifiedCatalog[id].primary_image);
          setQuantity(verifiedCatalog[id].moq);
        }
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (buyMode === 'wholesale') {
      setQuantity(Math.max(product.moq || 4, 1));
    } else {
      setQuantity(1);
    }
  }, [buyMode, product]);

  const adjustQty = (delta) => {
    const step = buyMode === 'wholesale' ? 2 : 1;
    const min = buyMode === 'wholesale' ? (product.moq || 4) : 1;
    setQuantity(prev => Math.max(min, prev + delta * step));
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const res = await addToCart(
      product,
      quantity,
      buyMode === 'wholesale',
      selectedLength,
      selectedFinish
    );
    setAddingToCart(false);

    if (res.success) {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2200);
    }
  };

  const isWholesale = buyMode === 'wholesale';
  const unitPrice = isWholesale ? product.wholesale_price : product.retail_price;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="min-h-screen bg-[#280812] text-ivory pb-32 selection:bg-gold selection:text-wine-950">
      
      {/* ==================== 1. TOP SHOWCASE SECTION ==================== */}
      <section className="relative w-full overflow-hidden pb-8 pt-4 bg-gradient-to-b from-[#1D050D] via-wine-900 to-wine-950 border-b border-gold/25 shadow-deep-3d">
        
        {/* Subtle Lotus / Mandala Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
          <svg className="w-80 h-80 text-gold" fill="none" stroke="currentColor" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" strokeDasharray="3 3" strokeWidth="0.75" />
            <circle cx="100" cy="100" r="68" strokeWidth="0.5" />
            <path d="M100 20 C108 55 125 78 160 88 C125 98 108 122 100 158 C92 122 75 98 40 88 C75 78 92 55 100 20 Z" fill="none" strokeWidth="0.75" />
          </svg>
        </div>

        {/* Floating Top Header Buttons */}
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between relative z-10">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-gold/40 flex items-center justify-center text-gold-light shadow-md active:scale-95 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] tracking-widest uppercase text-gold-light px-3 py-1 rounded-full bg-wine-950/80 border border-gold/40 shadow-sm">
              KALABURAGI
            </span>
            <button
              onClick={() => setWishlisted(!wishlisted)}
              aria-label="Wishlist"
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-gold/40 flex items-center justify-center text-gold-light shadow-md active:scale-95 transition"
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-gold text-gold' : 'text-gold-light'}`} />
            </button>
          </div>
        </div>

        {/* Centerpiece: Floating Product Silhouette with Golden Radial Glow */}
        <div className="relative max-w-sm mx-auto flex flex-col items-center justify-center pt-2">
          <div className="absolute w-64 h-64 rounded-full bg-gold/20 blur-3xl pointer-events-none transform -translate-y-2"></div>
          
          <div className="relative z-10 w-72 sm:w-80 h-72 sm:h-80 flex items-center justify-center px-4 transition-transform duration-500 hover:scale-105">
            <img
              src={selectedImage}
              alt={product.name_en}
              className="w-full h-full object-contain filter drop-shadow-[0_20px_32px_rgba(0,0,0,0.9)] select-none rounded-2xl"
            />
          </div>

          {/* Studio View vs Artisan Craft Detail Switcher */}
          <div className="flex items-center space-x-2 mt-3 z-10">
            <button
              type="button"
              onClick={() => setSelectedImage(product.primary_image)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition active:scale-95 ${
                selectedImage === product.primary_image
                  ? 'bg-gold text-wine-950 font-bold shadow-[0_0_10px_#D4AF6A]'
                  : 'bg-black/50 text-gold-light border border-gold/30 hover:border-gold'
              }`}
            >
              <span>✨</span>
              <span>Studio View</span>
            </button>

            {product.craft_image && (
              <button
                type="button"
                onClick={() => setSelectedImage(product.craft_image)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition active:scale-95 ${
                  selectedImage === product.craft_image
                    ? 'bg-gold text-wine-950 font-bold shadow-[0_0_10px_#D4AF6A]'
                    : 'bg-black/50 text-gold-light border border-gold/30 hover:border-gold'
                }`}
              >
                <span>🔍</span>
                <span>Artisan Macro</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ==================== 2. DETAILS & SPECIFICATIONS CANVAS ==================== */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        
        {/* SKU & Stock Status Row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-outline">
            SKU: {product.sku}
          </span>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-wine-900/80 border border-gold/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_6px_#D4AF6A] animate-pulse"></span>
            <span className="text-xs font-semibold text-gold-light">
              In Stock · {product.available_stock || 100} Pcs Ready to Dispatch
            </span>
          </div>
        </div>

        {/* Regal Title */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory gold-text-glow leading-tight">
          {lang === 'kn' ? (product.name_kn || product.name_en) : product.name_en}
        </h1>

        {/* Price Section & Tier Pill */}
        <div className="p-4 rounded-2xl bg-[#37141e]/90 border border-gold/35 shadow-floating-card space-y-2">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div className="flex items-baseline space-x-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-gold gold-text-glow font-mono">
                ₹{Number(unitPrice).toFixed(0)}
              </span>
              <span className="text-xs text-ivory/70">
                {isWholesale ? '/ unit wholesale' : '/ unit retail'}
              </span>
              {isWholesale && (
                <span className="text-xs text-outline line-through ml-1 font-mono">
                  ₹{Number(product.retail_price).toFixed(0)} Retail
                </span>
              )}
            </div>

            <span className="font-mono text-[11px] bg-gold/20 border border-gold/40 text-gold-light px-2.5 py-1 rounded-md font-bold tracking-wider">
              SAVE ₹{Number(product.retail_price - product.wholesale_price).toFixed(0)} PER PIECE
            </span>
          </div>

          <div className="flex items-center space-x-2 pt-1 text-xs text-gold-light font-medium">
            <Sparkles className="w-4 h-4 text-gold shrink-0" />
            <span>{product.purity_finish || '24K Micro-Gold Electroplate · 1-Year Guarantee'}</span>
          </div>
        </div>

        {/* Mode Toggle Switch (Retail vs Wholesale) */}
        <div className="space-y-2">
          <div className="p-1 rounded-full bg-black/50 border border-gold/30 flex items-center shadow-inner">
            <button
              onClick={() => setBuyMode('retail')}
              className={`w-1/2 py-2.5 rounded-full text-xs font-semibold tracking-wider transition ${
                buyMode === 'retail'
                  ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 font-bold shadow-md'
                  : 'text-ivory/70 hover:text-gold-light'
              }`}
            >
              Retail Purchase (1+ pcs)
            </button>
            <button
              onClick={() => setBuyMode('wholesale')}
              className={`w-1/2 py-2.5 rounded-full text-xs font-semibold tracking-wider transition ${
                buyMode === 'wholesale'
                  ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 font-bold shadow-md'
                  : 'text-ivory/70 hover:text-gold-light'
              }`}
            >
              Wholesale Bulk Slab
            </button>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-wine-950/80 border border-gold/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-gold-light">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span className="font-medium">
                {isWholesale ? 'Verified Wholesale Tier Applied' : 'Retail Single Piece Order Mode'}
              </span>
            </div>
            <span className="font-mono font-bold text-gold bg-black/40 px-2 py-0.5 rounded border border-gold/20 text-[10px]">
              {isWholesale ? `Min. ${product.moq || 4} Pcs` : 'Single Piece'}
            </span>
          </div>
        </div>

        {/* Finish / Polish Selection */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-outline uppercase font-semibold tracking-wider">
              Select Finish
            </span>
            <span className="text-gold-light font-medium">{selectedFinish}</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {finishes.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFinish(f)}
                className={`py-2.5 px-2 rounded-xl text-xs font-semibold text-center transition border ${
                  selectedFinish === f
                    ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 border-gold font-bold shadow-floating-gold'
                    : 'bg-wine-900/60 text-ivory/80 border-gold/30 hover:border-gold hover:text-gold-light'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Length / Size Selection */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-outline uppercase font-semibold tracking-wider">
              Length / Size
            </span>
            <span className="text-gold underline cursor-pointer">Chain Size Chart</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {lengths.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLength(l)}
                className={`py-2.5 rounded-xl font-mono text-xs font-bold text-center transition border ${
                  selectedLength === l
                    ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 border-gold shadow-floating-gold'
                    : 'bg-wine-900/60 text-ivory/80 border-gold/30 hover:border-gold hover:text-gold-light'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Stepper & Estimator */}
        <div className="p-4 rounded-2xl bg-[#37141e]/80 border border-gold/30 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-ivory">
              {isWholesale ? 'Wholesale Quantity' : 'Order Quantity'}
            </div>
            <div className="text-[11px] text-ivory/60">
              {isWholesale ? `Dealer Lot Pack (Min ${product.moq || 4})` : 'Individual Velvet Pouch'}
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-black/50 border border-gold/30 p-1.5 rounded-full">
            <button
              onClick={() => adjustQty(-1)}
              className="w-8 h-8 rounded-full bg-wine-900 text-gold-light flex items-center justify-center font-bold text-lg active:scale-90 transition"
            >
              -
            </button>
            <span className="font-mono text-base font-bold text-gold w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => adjustQty(1)}
              className="w-8 h-8 rounded-full bg-gold text-wine-950 flex items-center justify-center font-bold text-lg active:scale-90 transition"
            >
              +
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="pt-2 text-xs sm:text-sm text-ivory/80 leading-relaxed space-y-2">
          <h4 className="font-serif text-base font-bold text-gold-light">
            Design &amp; Quality Notes
          </h4>
          <p>{product.description_en}</p>
        </div>

      </section>

      {/* ==================== 3. FLOATING BOTTOM ACTION BAR ==================== */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#1D050D]/95 backdrop-blur-2xl border-t border-gold/40 p-4 shadow-deep-3d">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-ivory/60 uppercase tracking-wider block">
              Total Payable ({quantity} pcs)
            </span>
            <span className="font-serif text-2xl font-bold text-gold gold-text-glow font-mono">
              ₹{Number(totalPrice).toFixed(0)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`https://wa.me/919481242188?text=Hello%20Mahalaxmi%20Novelties%2C%20I%20want%20to%20order%20SKU%3A%20${product.sku}%20(${product.name_en})%20Wholesale%20Price%3A%20Rs.${product.wholesale_price}%20Qty%3A%20${quantity}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-3 rounded-xl bg-black/50 border border-gold/40 text-gold-light hover:text-gold active:scale-95 transition"
              title="Enquire on WhatsApp"
            >
              <Phone className="w-5 h-5 text-gold" />
            </a>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-sans font-bold text-xs tracking-wider uppercase shadow-floating-gold active:scale-95 transition flex items-center space-x-2"
            >
              {addedToast ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isWholesale ? `Order Lot (${quantity}pcs)` : 'Add to Cart'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
