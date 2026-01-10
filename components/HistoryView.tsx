
import React from 'react';
import { HistoryData, DailyRecord } from '../types';
import { PRODUCTS } from '../constants';

interface HistoryViewProps {
  history: HistoryData;
  onClose: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onClose }) => {
  const dates = Object.keys(history).sort((a, b) => b.localeCompare(a));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md max-h-[85vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
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
            dates.map(date => (
              <div key={date} className="border border-white bg-white/80 backdrop-blur-sm rounded-[2rem] p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-emerald-600 text-lg">{date}</span>
                  <div className="flex gap-2">
                    <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase">
                      Milo: {history[date].totalMiloPcs}
                    </span>
                    <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase">
                      Beyrel's: {history[date].totalBeyrelsPcs}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  {history[date].entries.map(entry => {
                    const product = PRODUCTS.find(p => p.id === entry.productId);
                    return (
                      <div key={entry.productId} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">{product?.name}</span>
                        <div className="flex gap-4 items-center">
                          <span className="text-[10px] text-gray-300 font-bold uppercase">{entry.boxCount} B | {entry.displayPcs} D</span>
                          <span className="font-black text-gray-800 text-sm">{entry.totalPcs} pcs</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div className="pt-6 pb-10 text-center">
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Pasar Besar Inventory</p>
            <p className="text-[11px] text-gray-400 font-black">Mir Rabbi Hossain</p>
          </div>
        </div>
      </div>
    </div>
  );
};
