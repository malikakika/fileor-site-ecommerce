import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="relative">
      <select
        value={i18n.language}
        onChange={handleChange}
        className="
          appearance-none
          pl-8 pr-4 py-2
          rounded-md border border-white/30
          bg-white/10 text-white text-sm font-medium
          hover:bg-white/20 hover:border-white
          focus:outline-none focus:ring-2 focus:ring-yellow-300
          transition-all duration-200
          cursor-pointer
        "
      >
        <option value="fr" className="text-black">
          Français
        </option>
        <option value="en" className="text-black">
          English
        </option>
        {/* <option value="ar" className="text-black">
          العربية
        </option> */}
      </select>
      <Globe
        size={18}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-white pointer-events-none"
      />
    </div>
  );
}
