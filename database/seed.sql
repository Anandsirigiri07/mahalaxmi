-- ========================================================
-- Mahalaxmi Novelties (ಮಹಾಲಕ್ಷ್ಮೀ ನಾವೆಲ್ಟೀಸ್)
-- Production Seed Data (STRICT ZERO MOCK DATA)
-- Only System Essentials:
--   1. 6 Core Jewellery Categories (Bilingual English/Kannada)
--   2. Local Kalaburagi Delivery PIN Codes
--   3. Business Settings & Contact Details
--   4. Default Administrator Account
-- ========================================================

-- 1. Default Admin Account
-- Email: admin@mahalaxminovelties.com
-- Password: Admin@123
INSERT INTO users (id, full_name, email, phone, password_hash, role, account_type, is_active)
VALUES (
    1,
    'Manoharsingh P. Rathore (Admin)',
    'admin@mahalaxminovelties.com',
    '9481242188',
    '$2a$10$NJvZG2YOEzFe/EHfiWgfR.A0nG7IaONF1FO1h4V4VkdlRpHaxOAv6',
    'admin',
    'wholesale',
    TRUE
) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- 2. Six Core Jewellery Categories
INSERT INTO categories (id, name_en, name_kn, slug, description_en, description_kn, display_order, is_active)
VALUES
(1, 'Matte & C.Z. Jewellery', 'ಮ್ಯಾಟ್ & ಸಿ.ಝಡ್. ಜ್ಯುವೆಲ್ಲರಿ', 'matte-cz-jewellery', 'Premium matte finish and sparkling cubic zirconia bridal sets, choker sets, and temple jewellery.', 'ಪ್ರೀಮಿಯಂ ಮ್ಯಾಟ್ ಫಿನಿಶ್ ಮತ್ತು ಆಕರ್ಷಕ ಸಿ.ಝಡ್. ಬ್ರೈಡಲ್ ಸೆಟ್‌ಗಳು, ಚೋಕರ್‌ಗಳು ಮತ್ತು ದೇವಸ್ಥಾನ ಶೈಲಿಯ ಆಭರಣಗಳು.', 1, TRUE),
(2, 'Patli Bangles', 'ಪಟ್ಲಿ ಬಳೆಗಳು', 'patli-bangles', 'Traditional and contemporary micro-plated patli bangles, kadas, and daily-wear bangles.', 'ಸಾಂಪ್ರದಾಯಿಕ ಮತ್ತು ಆಧುನಿಕ ಮೈಕ್ರೋ-ಪ್ಲೇಟೆಡ್ ಪಟ್ಲಿ ಬಳೆಗಳು, ಕಡಾಗಳು ಹಾಗೂ ನಿತ್ಯೋಪಯೋಗಿ ಬಳೆಗಳು.', 2, TRUE),
(3, 'Necklaces', 'ಹಾರಗಳು / ನೆಕ್ಲೇಸ್', 'necklaces', 'Exquisite long harams, short necklaces, and ethnic designer necklace sets.', 'ಭವ್ಯವಾದ ಉದ್ದನೆಯ ಹಾರಗಳು, ಸಣ್ಣ ನೆಕ್ಲೇಸ್‌ಗಳು ಹಾಗೂ ಸಾಂಪ್ರದಾಯಿಕ ಡಿಸೈನರ್ ಹಾರಗಳು.', 3, TRUE),
(4, 'Roldgold & Guarantee Chains', 'ರೋಲ್ಡ್‌ಗೋಲ್ಡ್ & ಗ್ಯಾರಂಟಿ ಚೈನ್‌ಗಳು', 'roldgold-guarantee-chains', '1-year guarantee roldgold chains, thali chains, dokiya, and daily wear rope chains.', '1-ವರ್ಷದ ಗ್ಯಾರಂಟಿ ರೋಲ್ಡ್‌ಗೋಲ್ಡ್ ಚೈನ್‌ಗಳು, ತಾಳಿ ಚೈನ್‌ಗಳು, ಡೋಕಿಯಾ ಮತ್ತು ಹಗ್ಗದ ಮಾದರಿಯ ಸರಗಳು.', 4, TRUE),
(5, 'Agra Payal', 'ಆಗ್ರಾ ಕಾಲುಂಗುರ / ಪಾಯಲ್', 'agra-payal', 'Genuine Agra silver-plated anklets, traditional ghungroo payals, and bridal foot jewellery.', 'ಅಸಲಿ ಆಗ್ರಾ ಸಿಲ್ವರ್ ಕೋಟೆಡ್ ಕಾಲುಂಗುರಗಳು, ಗಂಟಿನ ಪಾಯಲ್‌ಗಳು ಮತ್ತು ವಧುವಿನ ಕಾಲು ಆಭರಣಗಳು.', 5, TRUE),
(6, 'Finger Rings & Lockets', 'ಉಂಗುರಗಳು & ಲಾಕೆಟ್‌ಗಳು', 'finger-rings-lockets', 'Adjustable CZ finger rings, deity pendants, and designer daily wear lockets.', 'ಹೊಂದಾಣಿಕೆ ಮಾಡಬಹುದಾದ ಸಿ.ಝಡ್. ಉಂಗುರಗಳು, ದೇವರ ಪೆಂಡೆಂಟ್‌ಗಳು ಮತ್ತು ಆಕರ್ಷಕ ಲಾಕೆಟ್‌ಗಳು.', 6, TRUE)
ON DUPLICATE KEY UPDATE name_en = VALUES(name_en), name_kn = VALUES(name_kn);

-- 3. Local Kalaburagi Delivery PIN Codes
INSERT INTO delivery_pincodes (pin_code, locality_name, delivery_fee, min_order_amount, estimated_delivery_hours, is_active)
VALUES
('585101', 'Sangam Talkies / S.B. Temple Road / Super Market', 30.00, 200.00, 12, TRUE),
('585102', 'Station Road / Nehru Gunj / Kirana Bazaar', 40.00, 300.00, 24, TRUE),
('585103', 'MSK Mill / Ring Road / Aland Road', 40.00, 300.00, 24, TRUE),
('585104', 'Jewargi Colony / Sedam Road / High Court Area', 50.00, 400.00, 24, TRUE),
('585105', 'Shahabazar / Fort / Gazipur', 40.00, 300.00, 24, TRUE)
ON DUPLICATE KEY UPDATE locality_name = VALUES(locality_name), delivery_fee = VALUES(delivery_fee);

-- 4. Business Settings
INSERT INTO business_settings (setting_key, setting_value, description)
VALUES
('store_name_en', 'Mahalaxmi Novelties', 'Store Name in English'),
('store_name_kn', 'ಮಹಾಲಕ್ಷ್ಮೀ ನಾವೆಲ್ಟೀಸ್', 'Store Name in Kannada'),
('store_proprietor', 'Manoharsingh P. Rathore', 'Proprietor Name'),
('store_address', 'Shop No. 8-713/13, Ground Floor, Sangam Talkies Complex, S.B. Temple Road, Kalaburagi - 585 101', 'Physical Store Address'),
('store_tagline_en', 'Wholesale Dealers — No Sales Representative', 'Store Tagline English'),
('store_tagline_kn', 'ಸಗಟು ವ್ಯಾಪಾರಿಗಳು — ಯಾವುದೇ ಮಾರಾಟ ಪ್ರತಿನಿಧಿಗಳಿಲ್ಲ', 'Store Tagline Kannada'),
('store_phone', '9481242188', 'Primary Phone Number'),
('store_whatsapp', '9880042188', 'WhatsApp Number for Inquiries & Orders'),
('store_email', 'contact@mahalaxminovelties.com', 'Store Contact Email'),
('upi_id', '9481242188@okbizaxis', 'Store UPI ID for direct QR payments'),
('upi_name', 'Mahalaxmi Novelties', 'Payee Name registered on UPI'),
('upi_qr_image', '/uploads/default-upi-qr.svg', 'Path to uploaded UPI QR Code Image'),
('default_delivery_fee', '40.00', 'Standard Kalaburagi Local Delivery Fee (₹)'),
('free_delivery_threshold', '1500.00', 'Order total above which local delivery is free (₹)'),
('wholesale_min_order_total', '2500.00', 'Minimum total cart value required for Wholesale Checkout (₹)'),
('google_maps_embed_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3810.158145229288!2d76.8262276!3d17.3323062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc8df57eb098eb3%3A0xb3554e8ffbbf1f2b!2sSangam%20Talkies%20Complex!5e0!3m2!1sen!2sin!4v1700000000000', 'Google Maps Embed iframe URL for S.B. Temple Road, Kalaburagi')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
