import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="bg-[#1D050D] text-ivory/80 border-t border-gold/30 pt-12 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Store Bio */}
          <div>
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-10 h-10 rounded-full bg-wine-950 border border-gold/60 flex items-center justify-center text-gold-light shadow-floating-gold">
                <span className="font-serif text-base font-bold">MN</span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ivory tracking-wide gold-text-glow">
                  {lang === 'kn' ? 'ಮಹಾಲಕ್ಷ್ಮೀ ನಾವೆಲ್ಟೀಸ್' : 'MAHALAXMI NOVELTIES'}
                </h3>
                <p className="text-[10px] text-gold tracking-widest uppercase font-semibold">
                  Wholesale Dealers · Kalaburagi
                </p>
              </div>
            </div>

            <p className="text-xs text-ivory/70 leading-relaxed mb-4">
              {lang === 'kn'
                ? 'ಕಲಬುರಗಿಯ ಪ್ರಮುಖ ಮ್ಯಾಟ್, ಸಿ.ಝಡ್. ಆಭರಣಗಳು, ಪಟ್ಲಿ ಬಳೆಗಳು ಮತ್ತು ರೋಲ್ಡ್‌ಗೋಲ್ಡ್ ಚೈನ್ ಸಗಟು ಡೀಲರ್ಸ್.'
                : 'Premier imitation jewellery atelier specializing in 1-Gram gold finish Patli bangles, antique temple kadas, and Agra payal with wholesale MOQ slabs.'}
            </p>

            <div className="bg-[#280812] border border-gold/30 p-3 rounded-2xl text-xs space-y-1">
              <p className="text-gold-light font-bold">Proprietor: Manoharsingh P. Rathore</p>
              <p className="text-[11px] text-ivory/60 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>Wholesale Dealers — No Sales Representative</span>
              </p>
            </div>
          </div>

          {/* Col 2: Six Core Categories */}
          <div>
            <h4 className="text-xs font-mono font-bold text-gold uppercase tracking-widest mb-4 border-b border-gold/20 pb-2">
              Core Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/catalogue?category=patli-bangles" className="hover:text-gold-light transition flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                  <span>Patli Bangles (Filigree &amp; Floral Kadas)</span>
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=matte-cz-jewellery" className="hover:text-gold-light transition flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                  <span>Matte &amp; C.Z. Temple Sets</span>
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=necklaces" className="hover:text-gold-light transition flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                  <span>Rajwadi Chokers &amp; Long Harams</span>
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=roldgold-guarantee-chains" className="hover:text-gold-light transition flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                  <span>Roldgold Guarantee Chains</span>
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=agra-payal" className="hover:text-gold-light transition flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                  <span>Agra Silver Finish Payal &amp; Anklets</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Direct Wholesale */}
          <div>
            <h4 className="text-xs font-mono font-bold text-gold uppercase tracking-widest mb-4 border-b border-gold/20 pb-2">
              Showroom &amp; Dispatch Hub
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <p className="text-ivory/80 leading-relaxed">
                  Shop No. 8-713/13, Ground Floor, Sangam Talkies Complex, S.B. Temple Road, Kalaburagi - 585 101, Karnataka
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-mono text-gold-light">+91 94812 42188 (Calls &amp; Orders)</p>
                  <p className="font-mono text-gold-light">+91 98800 42188 (WhatsApp Direct)</p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-gold shrink-0" />
                <p className="text-ivory/70">Mon – Sat: 10:00 AM – 9:00 PM</p>
              </div>
            </div>
          </div>

          {/* Col 4: Google Maps Hub Embed */}
          <div>
            <h4 className="text-xs font-mono font-bold text-gold uppercase tracking-widest mb-4 border-b border-gold/20 pb-2">
              Location Map
            </h4>
            <div className="w-full h-36 rounded-2xl overflow-hidden border border-gold/30 shadow-md">
              <iframe
                title="Mahalaxmi Novelties Kalaburagi Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3810.965876008168!2d76.8288!3d17.3325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc9b5314787d5ef%3A0x86b0931215170d10!2sSangam%20Talkies%20Complex!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full border-0 grayscale contrast-125 opacity-80 hover:opacity-100 transition"
                loading="lazy"
              ></iframe>
            </div>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="pt-6 border-t border-gold/15 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory/60 gap-3">
          <p>
            © {new Date().getFullYear()} Mahalaxmi Novelties, Kalaburagi. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="hover:text-gold transition">Admin Access</Link>
            <span>•</span>
            <Link to="/catalogue" className="hover:text-gold transition">Wholesale B2B</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
