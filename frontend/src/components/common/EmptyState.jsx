import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, PackageOpen, PlusCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function EmptyState({
  title,
  description,
  icon: Icon = PackageOpen,
  actionText,
  actionLink,
  isAdminAction = false
}) {
  const { lang, t } = useLanguage();
  const { isAdmin } = useAuth();

  const defaultTitle = title || (lang === 'kn' ? 'ಇನ್ನೂ ಯಾವುದೇ ಆಭರಣಗಳನ್ನು ಸೇರಿಸಿಲ್ಲ' : 'No Jewellery Items Added Yet');
  const defaultDesc = description || (lang === 'kn'
    ? 'ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಿಂದ ನಿಮ್ಮ ಮೊದಲ ಆಭರಣ ಉತ್ಪನ್ನ ಮತ್ತು ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.'
    : 'No products added yet — upload your first jewellery item and real photos from the Admin Dashboard.');

  return (
    <div className="bg-gradient-to-b from-amber-50/50 to-stone-50 border border-amber-200/60 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-300/50 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-purple-950 mb-2">
        {defaultTitle}
      </h3>

      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
        {defaultDesc}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {isAdmin ? (
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-emerald-300 font-semibold text-xs sm:text-sm shadow-md transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>Upload First Product</span>
          </Link>
        ) : (
          actionLink && (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-md transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{actionText || 'Browse Catalogue'}</span>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
