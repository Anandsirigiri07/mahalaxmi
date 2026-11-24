import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    store_name: 'Mahalaxmi Novelties',
    tagline: 'Wholesale Dealers — No Sales Representative',
    location_short: 'Sangam Talkies Complex, Kalaburagi',
    full_address: 'Shop No. 8-713/13, Ground Floor, Sangam Talkies Complex, S.B. Temple Road, Kalaburagi - 585 101',
    proprietor: 'Proprietor: Manoharsingh P. Rathore',
    nav_home: 'Home',
    nav_catalogue: 'Jewellery Catalogue',
    nav_cart: 'Cart',
    nav_account: 'My Account',
    nav_admin: 'Admin Portal',
    nav_login: 'Sign In',
    nav_register: 'Create Account',
    nav_logout: 'Sign Out',
    wholesale_mode: 'Wholesale (B2B)',
    retail_mode: 'Retail (B2C)',
    retail_price: 'Retail Price',
    wholesale_price: 'Wholesale Price',
    moq_label: 'Min. Order Quantity (MOQ)',
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
    add_to_cart: 'Add to Cart',
    buy_wholesale: 'Buy Wholesale',
    buy_retail: 'Buy Retail',
    empty_catalogue_title: 'No Jewellery Items Added Yet',
    empty_catalogue_desc: 'Upload your first jewellery item from the Admin Dashboard to begin showcasing.',
    empty_cart_title: 'Your Jewellery Cart is Empty',
    empty_cart_desc: 'Browse our six exclusive jewellery collections and add exquisite pieces to your cart.',
    local_delivery_badge: 'Direct Kalaburagi Local Delivery (585101 - 585105)',
    search_placeholder: 'Search matte jewellery, patli bangles, payal, chains...',
    contact_phone: '9481242188',
    whatsapp_number: '9880042188',
    delivery_fee: 'Delivery Fee',
    free_delivery: 'FREE Delivery',
    upi_scan_pay: 'Scan UPI QR & Pay',
    upi_utr_placeholder: 'Enter 12-digit UPI UTR / Transaction ID',
    cod_label: 'Cash on Delivery (Local Kalaburagi)'
  },
  kn: {
    store_name: 'ಮಹಾಲಕ್ಷ್ಮೀ ನಾವೆಲ್ಟೀಸ್',
    tagline: 'ಸಗಟು ವ್ಯಾಪಾರಿಗಳು — ಯಾವುದೇ ಮಾರಾಟ ಪ್ರತಿನಿಧಿಗಳಿಲ್ಲ',
    location_short: 'ಸಂಗಮ್ ಟಾಕೀಸ್ ಕಾಂಪ್ಲೆಕ್ಸ್, ಕಲಬುರಗಿ',
    full_address: 'ಶಾಪ್ ನಂ. 8-713/13, ನೆಲ ಮಹಡಿ, ಸಂಗಮ್ ಟಾಕೀಸ್ ಕಾಂಪ್ಲೆಕ್ಸ್, ಎಸ್.ಬಿ. ಟೆಂಪಲ್ ರೋಡ್, ಕಲಬುರಗಿ - 585 101',
    proprietor: 'ಮಾಲೀಕರು: ಮನೋಹರ್‌ಸಿಂಗ್ ಪಿ. ರಾಥೋಡ್',
    nav_home: 'ಮುಖಪುಟ',
    nav_catalogue: 'ಆಭರಣಗಳ ಪಟ್ಟಿ',
    nav_cart: 'ಬುಟ್ಟಿ (ಕಾರ್ಟ್)',
    nav_account: 'ನನ್ನ ಖಾತೆ',
    nav_admin: 'ಅಡ್ಮಿನ್ ಪೋರ್ಟಲ್',
    nav_login: 'ಲಾಗಿನ್',
    nav_register: 'ಖಾತೆ ತೆರೆಯಿರಿ',
    nav_logout: 'ಲಾಗೌಟ್',
    wholesale_mode: 'ಸಗಟು (B2B)',
    retail_mode: 'ಚಿಲ್ಲರೆ (B2C)',
    retail_price: 'ಚಿಲ್ಲರೆ ಬೆಲೆ',
    wholesale_price: 'ಸಗಟು ಬೆಲೆ',
    moq_label: 'ಕನಿಷ್ಠ ಆರ್ಡರ್ ಪ್ರಮಾಣ (MOQ)',
    in_stock: 'ಲಭ್ಯವಿದೆ (ಸ್ಟಾಕ್ ಇದೆ)',
    low_stock: 'ಕಡಿಮೆ ಸ್ಟಾಕ್',
    out_of_stock: 'ಸ್ಟಾಕ್ ಮುಗಿದಿದೆ',
    add_to_cart: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ',
    buy_wholesale: 'ಸಗಟು ದರದಲ್ಲಿ ಖರೀದಿಸಿ',
    buy_retail: 'ಚಿಲ್ಲರೆ ದರದಲ್ಲಿ ಖರೀದಿಸಿ',
    empty_catalogue_title: 'ಇನ್ನೂ ಯಾವುದೇ ಆಭರಣಗಳನ್ನು ಸೇರಿಸಿಲ್ಲ',
    empty_catalogue_desc: 'ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಿಂದ ನಿಮ್ಮ ಮೊದಲ ಆಭರಣ ಉತ್ಪನ್ನವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    empty_cart_title: 'ನಿಮ್ಮ ಶಾಪಿಂಗ್ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ',
    empty_cart_desc: 'ನಮ್ಮ ಆರು ವಿಶಿಷ್ಟ ಆಭರಣ ಸಂಗ್ರಹಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಆಯ್ಕೆಯ ಆಭರಣಗಳನ್ನು ಸೇರಿಸಿ.',
    local_delivery_badge: 'ಕಲಬುರಗಿ ಸ್ಥಳೀಯ ತ್ವರಿತ ಡೆಲಿವರಿ (585101 - 585105)',
    search_placeholder: 'ಮ್ಯಾಟ್ ಆಭರಣಗಳು, ಪಟ್ಲಿ ಬಳೆಗಳು, ಪಾಯಲ್, ಚೈನ್‌ಗಳನ್ನು ಹುಡುಕಿ...',
    contact_phone: '9481242188',
    whatsapp_number: '9880042188',
    delivery_fee: 'ಡೆಲಿವರಿ ಶುಲ್ಕ',
    free_delivery: 'ಉಚಿತ ಡೆಲಿವರಿ',
    upi_scan_pay: 'ಯುಪಿಐ ಕ್ಯೂಆರ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಾವತಿಸಿ',
    upi_utr_placeholder: '12-ಅಂಕಿಯ ಯುಪಿಐ UTR / ಟ್ರಾನ್ಸಾಕ್ಷನ್ ಐಡಿ ನಮೂದಿಸಿ',
    cod_label: 'ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ (ಕಲಬುರಗಿ ಸ್ಥಳೀಯ)'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('mn_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('mn_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'kn' : 'en'));
  };

  const t = (key) => {
    return (translations[lang] && translations[lang][key]) || translations['en'][key] || key;
  };

  const getLocalizedField = (obj, fieldPrefix) => {
    if (!obj) return '';
    if (lang === 'kn' && obj[`${fieldPrefix}_kn`]) {
      return obj[`${fieldPrefix}_kn`];
    }
    return obj[`${fieldPrefix}_en`] || obj[`${fieldPrefix}`] || '';
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, getLocalizedField }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
