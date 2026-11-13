import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category = "Kurtis & Sets" }) => {
  if (!isOpen) return null;

  const sizeChart = [
    { size: "XS", bust: "34", waist: "30", hip: "36", length: "42" },
    { size: "S", bust: "36", waist: "32", hip: "38", length: "43" },
    { size: "M", bust: "38", waist: "34", hip: "40", length: "44" },
    { size: "L", bust: "40", waist: "36", hip: "42", length: "45" },
    { size: "XL", bust: "42", waist: "38", hip: "44", length: "46" },
    { size: "XXL", bust: "44", waist: "40", hip: "46", length: "46" }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E9DED5] space-y-5 animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E9DED5]">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#781C35]" />
            <h3 className="font-serif text-lg font-bold text-[#211A18]">
              Size Guide – {category}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#746963]">
          All measurements are in inches. For a relaxed fit, choose one size up.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#E9DED5] rounded-xl overflow-hidden">
            <thead className="bg-[#FAF0F2] text-[#781C35] font-bold">
              <tr>
                <th className="p-2.5 border-b border-[#E9DED5]">Size</th>
                <th className="p-2.5 border-b border-[#E9DED5]">Bust</th>
                <th className="p-2.5 border-b border-[#E9DED5]">Waist</th>
                <th className="p-2.5 border-b border-[#E9DED5]">Hip</th>
                <th className="p-2.5 border-b border-[#E9DED5]">Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DED5] text-[#211A18]">
              {sizeChart.map((row, i) => (
                <tr key={i} className="hover:bg-[#FBF6F0]">
                  <td className="p-2.5 font-bold text-[#781C35]">{row.size}</td>
                  <td className="p-2.5">{row.bust}"</td>
                  <td className="p-2.5">{row.waist}"</td>
                  <td className="p-2.5">{row.hip}"</td>
                  <td className="p-2.5">{row.length}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#FBF6F0] p-3.5 rounded-2xl text-[11px] text-[#746963] space-y-1">
          <p className="font-bold text-[#211A18]">How to Measure:</p>
          <p>• <strong>Bust:</strong> Measure around the fullest part of your chest.</p>
          <p>• <strong>Waist:</strong> Measure around your natural waistline.</p>
          <p>• <strong>Hips:</strong> Measure around the fullest part of your hips.</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#781C35] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#541326] transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
};

