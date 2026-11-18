import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category = "Kurti / Top" }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'top' | 'bottom'>(
    category.toLowerCase().includes('bottom') || category.toLowerCase().includes('trouser') || category.toLowerCase().includes('pant') ? 'bottom' : 'top'
  );

  const kurtiChart = [
    { size: "S", bust: "34", waist: "28", hip: "36" },
    { size: "M", bust: "36", waist: "30", hip: "38" },
    { size: "L", bust: "38", waist: "32", hip: "40" },
    { size: "XL", bust: "40", waist: "34", hip: "42" },
    { size: "XXL", bust: "42", waist: "36", hip: "44" }
  ];

  const bottomChart = [
    { size: "S", waist: "28", hip: "36", length: "38" },
    { size: "M", waist: "30", hip: "38", length: "38.5" },
    { size: "L", waist: "32", hip: "40", length: "39" },
    { size: "XL", waist: "34", hip: "42", length: "39.5" },
    { size: "XXL", waist: "36", hip: "44", length: "40" }
  ];

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#E9DED5] space-y-4 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header matching Reference Screen 5 */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9DED5]">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#781C35]" />
            <h3 className="font-serif text-lg font-bold text-[#211A18]">
              Size Guide
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
            aria-label="Close size guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kurti/Top vs Bottom Pill Tabs matching Reference Screen 5 */}
        <div className="flex rounded-xl p-1 bg-[#FBF6F0] border border-[#E9DED5]">
          <button
            type="button"
            onClick={() => setActiveTab('top')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'top'
                ? 'bg-[#781C35] text-white shadow-xs'
                : 'text-[#746963] hover:text-[#211A18]'
            }`}
          >
            Kurti / Top
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bottom')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bottom'
                ? 'bg-[#781C35] text-white shadow-xs'
                : 'text-[#746963] hover:text-[#211A18]'
            }`}
          >
            Bottom
          </button>
        </div>

        {/* Measurement Table matching Reference Screen 5 */}
        <div className="overflow-x-auto rounded-xl border border-[#E9DED5]">
          <table className="w-full text-center text-xs">
            <thead className="bg-[#FAF0F2] text-[#781C35] font-bold text-[11px] uppercase tracking-wider">
              {activeTab === 'top' ? (
                <tr>
                  <th className="py-2.5 px-3 border-b border-[#E9DED5] text-left">Size</th>
                  <th className="py-2.5 px-3 border-b border-[#E9DED5]">Bust (In)</th>
                  <th className="py-2.5 px-3 border-b border-[#E9DED5]">Waist (In)</th>
                  <th className="py-2.5 px-3 border-b border-[#E9DED5]">Hip (In)</th>
                </tr>
              ) : (
                <tr>
                  <th className="py-2.5 px-3 border-b border-[#E9DED5] text-left">Size</th>
                  <th className="py-2.5 px-3 border-b border-[#E9DED5]">Waist (In)</th>
                  <th className="py-2.5 px-3 border-b border-[#E9DED5]">Hip (In)</th>
                  <th className="py-2.5 px-3 border-b border-[#E9DED5]">Length (In)</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-[#E9DED5] text-[#211A18]">
              {activeTab === 'top' ? (
                kurtiChart.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FBF6F0] transition-colors">
                    <td className="py-2 px-3 font-bold text-[#781C35] text-left">{row.size}</td>
                    <td className="py-2 px-3">{row.bust}</td>
                    <td className="py-2 px-3">{row.waist}</td>
                    <td className="py-2 px-3">{row.hip}</td>
                  </tr>
                ))
              ) : (
                bottomChart.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FBF6F0] transition-colors">
                    <td className="py-2 px-3 font-bold text-[#781C35] text-left">{row.size}</td>
                    <td className="py-2 px-3">{row.waist}</td>
                    <td className="py-2 px-3">{row.hip}</td>
                    <td className="py-2 px-3">{row.length}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Body Silhouette Measurement Diagram matching Reference Screen 5 */}
        <div className="bg-[#FBF6F0] p-4 rounded-2xl border border-[#E9DED5] flex items-center gap-4">
          {/* Stylized Body Silhouette SVG */}
          <div className="w-20 shrink-0 flex justify-center">
            <svg viewBox="0 0 80 140" className="w-16 h-28 text-[#781C35] stroke-current fill-none stroke-[1.5]">
              {/* Head */}
              <circle cx="40" cy="12" r="8" className="fill-[#FAF0F2]" />
              {/* Neck & Shoulders */}
              <path d="M36 20 C36 24 32 26 24 28 C20 30 18 36 18 42 L20 65 L24 65 L23 48 C26 48 30 50 30 56" />
              <path d="M44 20 C44 24 48 26 56 28 C60 30 62 36 62 42 L60 65 L56 65 L57 48 C54 48 50 50 50 56" />
              {/* Torso & Dress Silhouette */}
              <path d="M28 29 C32 30 48 30 52 29 C50 38 48 48 50 58 C52 68 56 85 58 115 L22 115 C24 85 28 68 30 58 C32 48 30 38 28 29 Z" className="fill-[#FAF0F2]/50" />
              {/* Bust Line */}
              <line x1="16" y1="42" x2="64" y2="42" strokeDasharray="2 2" className="stroke-[#781C35] stroke-[1]" />
              <circle cx="40" cy="42" r="2" className="fill-[#781C35]" />
              {/* Waist Line */}
              <line x1="20" y1="58" x2="60" y2="58" strokeDasharray="2 2" className="stroke-[#781C35] stroke-[1]" />
              <circle cx="40" cy="58" r="2" className="fill-[#781C35]" />
              {/* Hip Line */}
              <line x1="18" y1="76" x2="62" y2="76" strokeDasharray="2 2" className="stroke-[#781C35] stroke-[1]" />
              <circle cx="40" cy="76" r="2" className="fill-[#781C35]" />
            </svg>
          </div>

          {/* Guidelines Text from Reference */}
          <div className="space-y-2 text-[11px] text-[#746963] flex-1">
            <div>
              <strong className="text-[#211A18] block font-semibold">Bust:</strong>
              <span>Measure around the fullest part of your chest.</span>
            </div>
            <div>
              <strong className="text-[#211A18] block font-semibold">Waist:</strong>
              <span>Measure around your natural waistline.</span>
            </div>
            <div>
              <strong className="text-[#211A18] block font-semibold">Hip:</strong>
              <span>Measure around the widest part of your hips.</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#781C35] hover:bg-[#541326] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
        >
          Close Size Guide
        </button>
      </div>
    </div>
  );
};
