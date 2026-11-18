import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product, RampSliderConfig, SiteSettings } from '../types';
import { FashionRampSlider } from './FashionRampSlider';
import { api } from '../services/api';

interface FeaturedFashionRampSectionProps {
  products: Product[];
  onOpenModal: (product: Product) => void;
  onExploreCollection: () => void;
  settings?: SiteSettings;
  // Direct config override for live preview in Admin CMS
  configOverride?: RampSliderConfig;
}

export const FeaturedFashionRampSection: React.FC<FeaturedFashionRampSectionProps> = ({
  products,
  onOpenModal,
  onExploreCollection,
  settings: siteSettings,
  configOverride
}) => {
  const [cmsConfig, setCmsConfig] = useState<RampSliderConfig | null>(configOverride || null);
  const [isLoading, setIsLoading] = useState<boolean>(!configOverride);

  // Fetch published CMS configuration on mount if no override provided
  useEffect(() => {
    if (configOverride) {
      setCmsConfig(configOverride);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    api.getPublishedFashionRamp()
      .then(res => {
        if (isMounted && res.success && res.data) {
          setCmsConfig(res.data);
        }
      })
      .catch(err => {
        console.warn('Could not fetch published fashion ramp slider:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [configOverride]);

  // Active configuration values
  const section = cmsConfig?.sectionSettings || {
    enabled: true,
    eyebrow: 'THE FESTIVE EDIT',
    headline: 'Find Your Next',
    headlineItalic: 'Favourite Look',
    description: 'Discover timeless silhouettes, beautiful details and styles designed for every special moment.',
    ctaText: 'EXPLORE COLLECTION',
    ctaUrl: '/category/ethnic-wear',
    secondaryText: 'New season styles · Limited collections',
    showTrustBadges: true,
    badge1Number: '100%',
    badge1Label: 'Pure Fabrics',
    badge2Number: '7-Day',
    badge2Label: 'Easy Returns',
    badge3Number: '₹999+',
    badge3Label: 'Free Delivery',
    backgroundColor: '#F8F2EA',
    accentBurgundy: '#78152C',
    accentGold: '#C5A064',
    textColor: '#241D1A',
    mutedTextColor: '#82746A'
  };

  const sliderSettings = cmsConfig?.sliderSettings;
  const slides = cmsConfig?.slides;

  // If explicitly disabled in CMS or no slides and no products available, don't render section
  if (section.enabled === false || ((!slides || slides.length === 0) && (!products || products.length === 0))) {
    return null;
  }

  const handleCtaClick = () => {
    if (section.ctaUrl && section.ctaUrl.startsWith('http')) {
      window.open(section.ctaUrl, '_blank');
    } else {
      onExploreCollection();
    }
  };

  return (
    <section 
      aria-label="The Festive Edit - Fashion Ramp Runway"
      className="relative overflow-hidden border-b border-[#E8DFC8] py-10 sm:py-14 md:py-18 lg:py-20 transition-colors duration-500"
      style={{ backgroundColor: section.backgroundColor || '#F8F2EA' }}
    >
      {/* Background ambient lighting accents */}
      <div 
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${section.accentGold || '#C5A064'}1A` }}
      />
      <div 
        className="absolute bottom-0 left-10 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${section.accentBurgundy || '#78152C'}12` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Brand Editorial Typography & Call to Action */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 text-center lg:text-left">
            
            {/* Eyebrow badge */}
            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase shadow-xs"
              style={{ 
                borderColor: `${section.accentGold || '#C5A064'}66`,
                color: section.accentBurgundy || '#78152C'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: section.accentGold || '#C5A064' }} />
              <span>{section.eyebrow || 'THE FESTIVE EDIT'}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1 sm:space-y-2">
              <h1 
                className="font-serif text-3xl xs:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.12]"
                style={{ color: section.textColor || '#241D1A' }}
              >
                {section.headline || 'Find Your Next'}{' '}
                <span 
                  className="italic font-normal block"
                  style={{ color: section.accentBurgundy || '#78152C' }}
                >
                  {section.headlineItalic || 'Favourite Look'}
                </span>
              </h1>
            </div>

            {/* Description */}
            <p 
              className="text-sm sm:text-base max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal"
              style={{ color: section.mutedTextColor || '#82746A' }}
            >
              {section.description}
            </p>

            {/* CTA & Secondary Notice */}
            <div className="pt-2 sm:pt-3 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 max-w-sm sm:max-w-none mx-auto lg:mx-0">
                <button
                  type="button"
                  onClick={handleCtaClick}
                  style={{ backgroundColor: section.accentBurgundy || '#78152C' }}
                  className="w-full sm:w-auto text-white px-8 py-4 rounded-full font-semibold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2.5 group cursor-pointer active:scale-95 min-h-[48px] hover:brightness-110"
                >
                  <span>{section.ctaText || 'EXPLORE COLLECTION'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {section.secondaryText && (
                <p 
                  className="text-xs tracking-wider font-medium pt-1"
                  style={{ color: section.mutedTextColor || '#82746A' }}
                >
                  {section.secondaryText}
                </p>
              )}
            </div>

            {/* Atelier Highlights / Trust Badges */}
            {section.showTrustBadges !== false && (
              <div 
                className="pt-4 sm:pt-6 grid grid-cols-3 gap-2 xs:gap-4 text-xs font-medium border-t text-center lg:text-left"
                style={{ 
                  borderColor: '#E8DFC8',
                  color: section.mutedTextColor || '#82746A'
                }}
              >
                <div>
                  <span 
                    className="block font-serif text-base sm:text-lg font-bold"
                    style={{ color: section.accentBurgundy || '#78152C' }}
                  >
                    {section.badge1Number || '100%'}
                  </span>
                  <span className="text-[10px] sm:text-xs">{section.badge1Label || 'Pure Fabrics'}</span>
                </div>
                <div className="border-x border-[#E8DFC8]">
                  <span 
                    className="block font-serif text-base sm:text-lg font-bold"
                    style={{ color: section.accentBurgundy || '#78152C' }}
                  >
                    {section.badge2Number || '7-Day'}
                  </span>
                  <span className="text-[10px] sm:text-xs">{section.badge2Label || 'Easy Returns'}</span>
                </div>
                <div>
                  <span 
                    className="block font-serif text-base sm:text-lg font-bold"
                    style={{ color: section.accentBurgundy || '#78152C' }}
                  >
                    {section.badge3Number || '₹999+'}
                  </span>
                  <span className="text-[10px] sm:text-xs">{section.badge3Label || 'Free Delivery'}</span>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Animated Fashion Runway Ramp Slider */}
          <div className="lg:col-span-7 w-full">
            <FashionRampSlider
              slides={slides}
              products={products}
              settings={sliderSettings}
              onOpenProduct={onOpenModal}
            />
          </div>

        </div>
      </div>
    </section>
  );
};
