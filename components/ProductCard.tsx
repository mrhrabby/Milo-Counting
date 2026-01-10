
import React from 'react';
import { Product, StockCounts } from '../types';
import { WARNING_THRESHOLD } from '../constants';

interface ProductCardProps {
  product: Product;
  counts: StockCounts;
  onChange: (field: keyof StockCounts, value: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, counts, onChange }) => {
  const totalStorePcs = (counts.boxCount * product.pcsPerBox);
  const grandTotal = totalStorePcs + (counts.displayPcs || 0);
  
  const isLowStock = grandTotal < WARNING_THRESHOLD && grandTotal > 0;

  const handleInputChange = (field: keyof StockCounts, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    onChange(field, val);
  };

  return (
    <div className={`relative overflow-hidden p-5 rounded-3xl shadow-sm border transition-all duration-300 ${
      isLowStock ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100 hover:shadow-md'
    }`}>
      {/* Optimized Background Decoration for Mobile */}
      {product.imageUrl && (
        <div 
          className="absolute right-[-10px] top-[-10px] bottom-[-10px] w-28 opacity-10 pointer-events-none transition-transform hover:scale-110"
          style={{
            backgroundImage: `url(${product.imageUrl})`,
            backgroundSize: 'contain',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight">{product.name}</h3>
            <div className="flex gap-2 mt-1">
              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-tighter">
                {product.pcsPerBox} Pcs / Box
              </span>
              {isLowStock && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-100 text-red-600 uppercase">
                  Low Stock
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-600 leading-none">
              {grandTotal}
            </div>
            <div className="text-[9px] text-gray-300 font-black uppercase tracking-widest mt-1">
              Total Pcs
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">📦 Box (Store)</label>
            <input
              type="number"
              inputMode="numeric"
              value={counts.boxCount || ''}
              onChange={(e) => handleInputChange('boxCount', e)}
              placeholder="0"
              className="w-full p-4 bg-gray-50/60 backdrop-blur-md border border-transparent rounded-2xl text-center text-xl font-black focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 focus:bg-white transition-all outline-none placeholder-gray-300"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">🪟 Display Pcs</label>
            <input
              type="number"
              inputMode="numeric"
              value={counts.displayPcs || ''}
              onChange={(e) => handleInputChange('displayPcs', e)}
              placeholder="0"
              className="w-full p-4 bg-gray-50/60 backdrop-blur-md border border-transparent rounded-2xl text-center text-xl font-black focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 focus:bg-white transition-all outline-none placeholder-gray-300"
            />
          </div>
        </div>

        {isLowStock && (
          <p className="mt-4 text-[11px] text-red-500 font-bold italic">
            Warning: Inventory levels below threshold!
          </p>
        )}
      </div>
    </div>
  );
};
