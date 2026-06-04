import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function HeroSection() {
  const { language, isRTL, t } = useApp();
  const navigate = useNavigate();

  const phrasesEn = ["iPhone 16 Pro Max", "Samsung S26 Ultra", "Your Premium Lifestyle"];
  const phrasesAr = ["آيفون 16 برو ماكس", "سامسونج S26 الترا", "أسلوب حياتك الفاخر"];
  
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    const phrases = language === 'ar' ? phrasesAr : phrasesEn;
    const i = loopNum % phrases.length;
    const fullText = phrases[i];

    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setText(fullText.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setLoopNum(loopNum + 1);
        }
      }, 50);
    } else {
      timer = setTimeout(() => {
        setText(fullText.substring(0, text.length + 1));
        if (text.length === fullText.length) {
          timer = setTimeout(() => setIsDeleting(true), 2000);
        }
      }, 100);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, language]);

  const handleShopNow = () => {
    navigate('/samsung'); // Can be updated to a general catalog route
  };

  return (
    <section className="relative overflow-hidden min-h-[580px] flex items-center bg-[var(--ks-bg)] py-12 lg:py-20">
      {/* Background Unsplash image with premium overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1600')" }}
      />
      {/* Sleek mesh gradient backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-[#0b1329] to-[#1e2a58] opacity-98"
      />
      {/* Radial glows */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[var(--ks-blue)] blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-[var(--ks-gold)] blur-[120px] animate-pulse" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Headline and Copy Column */}
          <div className="lg:col-span-7 max-w-2xl text-center lg:text-left">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6 shadow-sm uppercase tracking-wider"
              style={{ 
                background: 'rgba(59,111,232,0.15)', 
                border: '1px solid rgba(59,111,232,0.3)', 
                color: '#7AAFFF' 
              }}
            >
              {language === 'ar' ? 'فخامة لا تضاهى' : 'Uncompromising Luxury'}
            </span>
            <h1 className="mb-6 text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight min-h-[140px] sm:min-h-[160px] lg:min-h-[180px]">
              {language === 'ar' ? (
                <>درع حماية فاخر من أجل<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--ks-blue)] to-[var(--ks-gold)]">{text}</span><span className="animate-pulse font-light text-[var(--ks-blue)]">|</span></>
              ) : (
                <>Premium Armor For<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--ks-blue)] to-[var(--ks-gold)]">{text}</span><span className="animate-pulse font-light text-[var(--ks-blue)]">|</span></>
              )}
            </h1>
            <p className="mb-10 text-base sm:text-lg leading-relaxed text-slate-300 font-medium max-w-xl mx-auto lg:mx-0">
              {language === 'ar' 
                ? 'اكتشف التوازن المثالي بين الأناقة المينيمالية والحماية العسكرية. استكشف مجموعتنا الحصرية من الكفرات، الشواحن، والملحقات المصممة لأرقى الأجهزة الذكية.'
                : 'Discover the perfect balance of minimalist elegance and military-grade defense. Explore our exclusive collection of cases, chargers, and premium accessories crafted for elite devices.'}
            </p>
            <div className="flex items-center gap-4 justify-center lg:justify-start flex-wrap">
              <button
                onClick={handleShopNow}
                className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-white font-extrabold transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,111,232,0.4)] hover:scale-105 active:scale-98"
                style={{ background: 'var(--ks-blue)' }}
              >
                {language === 'ar' ? 'تسوق التشكيلة' : 'Shop The Collection'}
                <ChevronRight size={18} className={`transition-transform duration-300 ${isRTL ? 'rotate-180 hover:-translate-x-1' : 'hover:translate-x-1'}`} />
              </button>
              <button
                onClick={() => navigate('/iphone')}
                className="flex items-center gap-2 px-8 py-4 rounded-xl transition-all duration-300 hover:bg-white/5 text-white active:scale-98"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {language === 'ar' ? 'تسوق آيفون' : 'Shop iPhone'}
              </button>
            </div>
          </div>

          {/* Product Image Display Column */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative group max-w-[320px] sm:max-w-[380px] transition-all duration-500 hover:scale-105">
              {/* Backlight Glow */}
              <div className="absolute -inset-2 rounded-[40px] bg-gradient-to-tr from-[var(--ks-blue)] to-[var(--ks-gold)] opacity-40 blur-2xl group-hover:opacity-60 transition-opacity duration-500" />
              <img 
                src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800" 
                alt="Samsung Galaxy S26 Ultra" 
                className="relative rounded-[36px] border-4 border-slate-800 shadow-2xl object-cover aspect-[4/5] w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
