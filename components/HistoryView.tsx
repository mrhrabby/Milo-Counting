
import React, { useState } from 'react';
import { HistoryData, DailyRecord, VerificationStatus, VerificationData } from '../types';
import { PRODUCTS } from '../constants';

interface HistoryViewProps {
  history: HistoryData;
  onLoadRecord: (date: string) => void;
  onVerifyRecord: (date: string, verification: VerificationData) => void;
  onClose: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onLoadRecord, onVerifyRecord, onClose }) => {
  const [verifyingDate, setVerifyingDate] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus>('Pending');
  const [discrepancy, setDiscrepancy] = useState<number>(0);
  const [adminNote, setAdminNote] = useState<string>('');

  const dates = Object.keys(history).sort((a, b) => b.localeCompare(a));

  const handleVerifySubmit = (date: string) => {
    onVerifyRecord(date, {
      status: selectedStatus,
      discrepancyQuantity: (selectedStatus === 'Short' || selectedStatus === 'Extra') ? discrepancy : undefined,
      note: adminNote.trim()
    });
    setVerifyingDate(null);
    setSelectedStatus('Pending');
    setDiscrepancy(0);
    setAdminNote('');
  };

  const startVerifying = (date: string, existing?: VerificationData) => {
    setVerifyingDate(date);
    setSelectedStatus(existing?.status || 'Ok');
    setDiscrepancy(existing?.discrepancyQuantity || 0);
    setAdminNote(existing?.note || '');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md max-h-[85vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50 backdrop-blur-md">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">History</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase">All Records</p>
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
              const isVerified = !!record.verification && record.verification.status !== 'Pending';
              
              return (
                <div key={date} className="border border-white bg-white/80 backdrop-blur-sm rounded-[2rem] p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-black text-emerald-600 text-lg">{date}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isVerified ? (
                        <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border text-center ${
                          record.verification?.status === 'Ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                          record.verification?.status === 'Short' ? 'bg-red-50 border-red-200 text-red-600' :
                          'bg-amber-50 border-amber-200 text-amber-600'
                        }`}>
                          {record.verification?.status}
                          {record.verification?.discrepancyQuantity ? ` (${record.verification.discrepancyQuantity})` : ''}
                        </div>
                      ) : (
                        <div className="text-[8px] font-black uppercase px-2 py-1 rounded-md bg-gray-100 text-gray-400 border border-gray-200">
                          Unverified
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 border-t border-gray-100 pt-4 mb-4">
                    {record.entries.map(entry => {
                      const product = PRODUCTS.find(p => p.id === entry.productId);
                      return (
                        <div key={entry.productId} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">{product?.name}</span>
                          <span className="font-black text-gray-800 text-sm">{entry.totalPcs} pcs</span>
                        </div>
                      );
                    })}
                  </div>

                  {record.verification?.note && (
                      <div className="mb-4 p-3 bg-gray-50/50 rounded-xl text-[10px] text-gray-500 italic border border-gray-100">
                          <span className="font-black uppercase text-[8px] block mb-1">Admin Note:</span>
                          {record.verification.note}
                      </div>
                  )}

                  {verifyingDate === date ? (
                    <div className="bg-gray-50 p-4 rounded-2xl space-y-4 animate-in slide-in-from-top-2 border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase text-center tracking-widest">Mark Record Status</p>
                      <div className="flex gap-2">
                        {['Ok', 'Short', 'Extra'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedStatus(s as VerificationStatus)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                              selectedStatus === s 
                                ? 'bg-gray-900 text-white shadow-lg scale-105' 
                                : 'bg-white text-gray-400 border border-gray-100'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                          {(selectedStatus === 'Short' || selectedStatus === 'Extra') && (
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Quantity {selectedStatus}</label>
                              <input
                                type="number"
                                value={discrepancy || ''}
                                onChange={(e) => setDiscrepancy(parseInt(e.target.value) || 0)}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl font-black text-center text-lg outline-none focus:border-emerald-500"
                                placeholder="0"
                              />
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Notes</label>
                            <textarea
                              value={adminNote}
                              onChange={(e) => setAdminNote(e.target.value)}
                              className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-xs outline-none focus:border-emerald-500 resize-none h-20"
                              placeholder="Write details about the counting or any problems found..."
                            />
                          </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button onClick={() => setVerifyingDate(null)} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400">Cancel</button>
                        <button onClick={() => handleVerifySubmit(date)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100">Confirm Verification</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => onLoadRecord(date)}
                        className="py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-gray-900 text-white shadow-md active:scale-95"
                      >
                        ✏️ View & Edit
                      </button>
                      
                      <button 
                        onClick={() => startVerifying(date, record.verification)}
                        className="py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95"
                      >
                        {isVerified ? '🔄 Re-verify' : '⚖️ Verify'}
                      </button>
                    </div>
                  )}
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
