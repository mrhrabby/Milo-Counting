
import React from 'react';
import { HistoryData } from '../types';
import { PRODUCTS } from '../constants';

interface HistoryViewProps {
  history: HistoryData;
  onLoadRecord: (date: string) => void;
  onClose: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onLoadRecord, onClose }) => {
  const dates = Object.keys(history).sort((a, b) => b.localeCompare(a));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md max-h-[85vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50 backdrop-blur-md">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">History</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Stored Records</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-gray-900 rounded-full transition-all active:scale-90"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4 bg-gray-50/30">
          {dates.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-2 opacity-20">📭</div>
              <p className="text-gray-400 font-bold text-sm">No records found yet</p>
            </div>
          ) : (
            dates.map(date => {
              const record = history[date];
              
              return (
                <div key={date} className="border border-white bg-white/80 backdrop-blur-sm rounded-[2rem] p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-black text-emerald-600 text-lg">{date}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-1">
                      {record.totalMiloPcs + record.totalBeyrelsPcs} Total Pcs
                    </span>
                  </div>
                  
                  <div className="space-y-2 border-t border-gray-100 pt-4 mb-4">
                    {record.entries.filter(e => e.totalPcs > 0).map(entry => {
                      const product = PRODUCTS.find(p => p.id === entry.productId);
                      return (
                        <div key={entry.productId} className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-600">{product?.name}</span>
                          <span className="font-black text-gray-800 text-xs">{entry.totalPcs} pcs</span>
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => onLoadRecord(date)}
                    className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-gray-900 text-white shadow-md active:scale-95"
                  >
                    ✏️ Load & Edit
                  </button>
                </div>
              );
            })
          )}
          <div className="pt-8 pb-12 text-center border-t border-gray-50 bg-white/50">
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-60">Developed By Mir Rabbi Hossain</p>
          </div>
        </div>
      </div>
    </div>
  );
};
