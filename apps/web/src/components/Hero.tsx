import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  actionText: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Relax & Unwind',
    subtitle: 'Discover our stunning pool and spa facilities',
    description: 'Take a dip in our infinity pool or rejuvenate with a relaxing spa treatment designed to soothe your soul and mind.',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1920&q=80',
    actionText: 'Explore Pools & Spa'
  },
  {
    id: 2,
    title: 'Premium Coastal Living',
    subtitle: 'Waking up to the calming sound of ocean waves',
    description: 'Experience beachfront villas with custom panoramic floor-to-ceiling windows, private decks, and seamless beach access.',
    image: 'https://images.unsplash.com/photo-1540548149366-8a998d7806f3?auto=format&fit=crop&w=1920&q=80',
    actionText: 'View Beachfront Villas'
  },
  {
    id: 3,
    title: 'Serene Highland Retreats',
    subtitle: 'Elevate your senses high above the green valleys',
    description: 'Cozy up in luxury eco-villas with wood-burning fireplaces, mountain mist balconies, and private therapeutic herbal hot springs.',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1920&q=80',
    actionText: 'Discover Cloud Retreats'
  }
];

export default function Hero() {
  const [slides, setSlides] = useState<Slide[]>(() => {
    const saved = localStorage.getItem('gs_home_slides');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return SLIDES;
  });

  const [current, setCurrent] = useState(0);

  // Sync state in real time across events or storage updates
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('gs_home_slides');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(parsed);
            setCurrent((prev) => (prev >= parsed.length ? 0 : prev));
          }
        } catch (e) {
          // Fallback
        }
      } else {
        setSlides(SLIDES);
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('home_slides_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('home_slides_updated', handleSync);
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    if (slides.length <= 1) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length <= 1) return;
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[current] || slides[0] || SLIDES[0];

  return (
    <section id="hero-slider" className="relative w-full h-[580px] sm:h-[650px] overflow-hidden bg-slate-900">
      
      {/* Background Images Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Cover image with elegant gradient overlay to ensure perfect text contrast */}
          <img
            src={currentSlide.image}
            alt="Luxury resort stay"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-slate-900/35 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        
        {/* Floating Glassmorphic Promo Card */}
        <motion.div
          key={`card-${current}`}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="w-full max-w-md sm:max-w-lg p-8 sm:p-10 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md bg-slate-950/45 text-white"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block text-brand-gold text-sm sm:text-base font-semibold tracking-widest uppercase mb-3.5"
          >
            {currentSlide.title}
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight"
          >
            {currentSlide.subtitle}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-slate-200/90 text-sm sm:text-base leading-relaxed mb-8 font-light"
          >
            {currentSlide.description}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <a
              href="#search-panel"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-50 hover:shadow-lg transition-all duration-300 group"
            >
              <span>{currentSlide.actionText}</span>
              <ArrowRight className="w-4 h-4 text-brand-blue group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </motion.div>

      </div>

      {/* Manual Slide Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Progress Dots Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {slides.map((slide, idx) => (
            <button
              key={slide.id || idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                current === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/65'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

    </section>
  );
}
