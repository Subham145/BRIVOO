import React from 'react';
import { SiteSettings, Product } from '../types';
import { FeaturedFashionRampSection } from './FeaturedFashionRampSection';

interface HeroProps {
  settings?: SiteSettings;
  onShopCollection?: () => void;
  onExploreNewArrivals?: () => void;
  products?: Product[];
  onOpenModal?: (product: Product) => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  settings, 
  onShopCollection = () => {}, 
  onExploreNewArrivals = () => {},
  products = [],
  onOpenModal = () => {}
}) => {
  return (
    <FeaturedFashionRampSection
      products={products}
      onOpenModal={onOpenModal}
      onExploreCollection={onShopCollection}
      settings={settings}
    />
  );
};
