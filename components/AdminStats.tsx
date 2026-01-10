
import React from 'react';
import { HistoryData } from '../types';

interface AdminStatsProps {
  history: HistoryData;
  onClose: () => void;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ history, onClose }) => {
  const dates = Object.keys(history).sort((a, b) => b.localeCompare(a));
  
  const stats = React.useMemo(() => {
    if (dates.length === 0) return null;
    let totalMilo = 0;
    let totalBeyrels = 0;
    let maxInv = 0;
    let peakDay = '';
    
    dates.forEach(date => {
      const record = history[date];
      totalMilo += record.totalMiloPcs;
      totalBeyrels += record.totalBeyrelsPcs;
      const combined = record.totalMiloPcs + record.totalBeyrelsPcs;
      if (combined > maxInv) {
        maxInv = combined;
        peakDay = date;
      }
    });
    
    return {
      avgMilo: Math.round(totalMilo / dates.length),
      avgBeyrels: Math.round(totalBeyrels / dates.length),
      peakTotal: maxInv,
      peakDay,
      totalRecords: dates.length
    };
  }, [history, dates]);

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-lg">
      <div className="bg-white w-full max-w-md max-h-[95vh] rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-20 duration-500">
        <div className="px-8 pt-10 pb-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Stats</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Global Analytics</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white shadow-lg border border-slate-50 text-slate-400 rounded-full active:scale-90 transition-all text-xl">✕</button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 bg-white">
          {!stats ? (
            <div className="text-center py-20 border border-dashed rounded-[2rem]">
              <p className="text-slate-300 font-bold uppercase text-[10px]">No Data Available</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-emerald-50 rounded-[2.5rem]">
                  <p className="text-[10px] font-black text-emerald-600 uppercase">Avg Milo</p>
                  <p className="text-4xl font-black text-emerald-800">{stats.avgMilo}</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-[2.5rem]">
                  <p className="text-[10px] font-black text-blue-600 uppercase">Avg Beyrel's</p>
                  <p className="text-4xl font-black text-blue-800">{stats.avgBeyrels}</p>
                </div>
              </div>
              <div className="p-8 bg-slate-50 rounded-[3rem]">
                <p className="text-[10px] font-black text-slate-400 uppercase">Peak Activity</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{stats.peakDay}</p>
                <p className="text-3xl font-black text-emerald-600 mt-2">{stats.peakTotal} PCS</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
