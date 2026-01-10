
import React, { useState, useEffect, useMemo } from 'react';
import { ProductCard } from './components/ProductCard';
import { HistoryView } from './components/HistoryView';
import { PRODUCTS } from './constants';
import { StockCounts, HistoryData, DailyRecord, StockEntry } from './types';

const App: React.FC = () => {
  // --- App State ---
  const [showHistory, setShowHistory] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [activeDate, setActiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentCounts, setCurrentCounts] = useState<Record<string, StockCounts>>({});
  const [history, setHistory] = useState<HistoryData>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving'>('idle');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Check if any modal is currently open
  const isAnyModalOpen = showHistory || showDownloadPopup;

  // --- Initial Data Load ---
  useEffect(() => {
    const savedHistory = localStorage.getItem('stock_history');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed);
      
      if (parsed[today]) {
        loadDataIntoView(parsed[today]);
      }
    }
  }, [today]);

  const loadDataIntoView = (record: DailyRecord) => {
    const initialCounts: Record<string, StockCounts> = {};
    record.entries.forEach((entry: StockEntry) => {
      initialCounts[entry.productId] = {
        boxCount: entry.boxCount,
        displayPcs: entry.displayPcs
      };
    });
    setCurrentCounts(initialCounts);
    setActiveDate(record.date);
    setSaveStatus('idle'); 
  };

  const resetForm = () => {
    setCurrentCounts({});
    setSaveStatus('idle');
    setActiveDate(today);
    setShowDownloadPopup(false);
  };

  // --- Handlers ---
  const handleCountChange = (productId: string, field: keyof StockCounts, value: number) => {
    setCurrentCounts(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { boxCount: 0, displayPcs: 0 }),
        [field]: value
      }
    }));
  };

  const calculateTotals = () => {
    let miloTotal = 0;
    let beyrelsTotal = 0;
    const entries: StockEntry[] = [];

    PRODUCTS.forEach(p => {
      const counts = currentCounts[p.id] || { boxCount: 0, displayPcs: 0 };
      const totalPcs = (counts.boxCount * p.pcsPerBox) + counts.displayPcs;
      
      if (p.brand === 'Milo') miloTotal += totalPcs;
      else if (p.brand === "Beyrel's") beyrelsTotal += totalPcs;

      entries.push({
        productId: p.id,
        ...counts,
        totalPcs
      });
    });

    return { miloTotal, beyrelsTotal, entries };
  };

  const totals = useMemo(() => calculateTotals(), [currentCounts]);

  const hasQuantities = useMemo(() => {
    return (Object.values(currentCounts) as StockCounts[]).some(c => c.boxCount > 0 || c.displayPcs > 0);
  }, [currentCounts]);

  const saveRecord = () => {
    setSaveStatus('saving');
    const record: DailyRecord = {
      date: activeDate,
      entries: totals.entries,
      totalMiloPcs: totals.miloTotal,
      totalBeyrelsPcs: totals.beyrelsTotal,
    };
    const newHistory = { ...history, [activeDate]: record };
    setHistory(newHistory);
    localStorage.setItem('stock_history', JSON.stringify(newHistory));
    
    setTimeout(() => {
      setSaveStatus('idle');
      setShowDownloadPopup(true);
    }, 600);
  };

  const prepareCaptureHTML = () => {
    const captureEl = document.getElementById('capture-area');
    if (!captureEl) return null;

    const reportTime = new Date().toLocaleString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });

    captureEl.innerHTML = `
      <div style="padding: 30px; font-family: 'Inter', sans-serif; background: #ffffff; width: 380px; color: #1e293b; margin: 0 auto; border: 1px solid #e2e8f0;">
        <div style="background: #059669; padding: 25px; border-radius: 24px; margin-bottom: 25px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.05em;">Pasar Besar</h1>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Stock Report: ${activeDate}</p>
        </div>
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 25px;">
          <thead>
            <tr>
              <th style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: left; color: #64748b; font-size: 9px; font-weight: 900; text-transform: uppercase;">Product</th>
              <th style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 9px; font-weight: 900; text-transform: uppercase;">Storage</th>
              <th style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #64748b; font-size: 9px; font-weight: 900; text-transform: uppercase;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${totals.entries.map((e, index) => {
              const p = PRODUCTS.find(prod => prod.id === e.productId);
              const bgColor = index % 2 === 0 ? '#ffffff' : '#fcfcfc';
              return `
                <tr style="background: ${bgColor};">
                  <td style="padding: 12px 8px; border-bottom: 1px solid #f8fafc; font-size: 12px; font-weight: 600;">${p?.name}</td>
                  <td style="padding: 12px 8px; border-bottom: 1px solid #f8fafc; text-align: center; font-size: 11px; color: #64748b; font-weight: 500;">${e.boxCount}B / ${e.displayPcs}P</td>
                  <td style="padding: 12px 8px; border-bottom: 1px solid #f8fafc; text-align: right; font-size: 13px; font-weight: 900; color: #0f172a;">${e.totalPcs}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="background: #f0fdf4; padding: 15px; border-radius: 16px; border: 1px solid #dcfce7; display: flex; justify-content: space-between; align-items: center;">
            <p style="margin: 0; font-size: 10px; font-weight: 900; color: #166534; text-transform: uppercase; letter-spacing: 0.1em;">Nestlé Milo</p>
            <p style="margin: 0; font-size: 20px; font-weight: 900; color: #166534;">${totals.miloTotal} <span style="font-size: 11px; opacity: 0.7;">PCS</span></p>
          </div>
          <div style="background: #eff6ff; padding: 15px; border-radius: 16px; border: 1px solid #dbeafe; display: flex; justify-content: space-between; align-items: center;">
            <p style="margin: 0; font-size: 10px; font-weight: 900; color: #1e40af; text-transform: uppercase; letter-spacing: 0.1em;">Beyrel's Codes</p>
            <p style="margin: 0; font-size: 20px; font-weight: 900; color: #1e40af;">${totals.beyrelsTotal} <span style="font-size: 11px; opacity: 0.7;">PCS</span></p>
          </div>
        </div>
        <div style="margin-top: 35px; padding-top: 15px; border-top: 1px dashed #e2e8f0; text-align: center;">
          <p style="margin: 0; font-size: 9px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Generated: ${reportTime}</p>
          <p style="margin: 4px 0 0; font-size: 9px; color: #cbd5e1; font-weight: 500;">Developed By Mir Rabbi Hossain</p>
        </div>
      </div>
    `;
    return captureEl;
  };

  const handleDownloadAndRedirect = async () => {
    const captureEl = prepareCaptureHTML();
    if (!captureEl) return;
    try {
      // @ts-ignore
      const canvas = await html2canvas(captureEl, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `Stock-${activeDate}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Redirect logic: Reset and go to main
      resetForm();
    } catch (err) {
      alert("Error generating report.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-60">
      <header className="px-6 pt-10 pb-8 sticky top-0 z-50 shadow-lg bg-emerald-600">
        <div className="max-w-md mx-auto flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                Pasar Besar
              </h1>
              <p className="text-[9px] text-emerald-100 font-bold uppercase tracking-widest mt-0.5 opacity-80">Inventory Counter</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowHistory(true)} className="bg-white/20 p-3 rounded-2xl active:scale-90 transition-all shadow-inner">📅</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        {activeDate !== today && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex justify-between items-center animate-in slide-in-from-top-4">
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase">Viewing Past Date</p>
              <p className="text-lg font-black text-amber-900">{activeDate}</p>
            </div>
            <button 
              onClick={() => {
                setActiveDate(today);
                if (history[today]) loadDataIntoView(history[today]);
                else {
                    setCurrentCounts({});
                    setSaveStatus('idle');
                }
              }}
              className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg active:scale-95"
            >
              Return Today
            </button>
          </div>
        )}

        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Nestlé Milo</h2>
          </div>
          <div className="space-y-4">
            {PRODUCTS.filter(p => p.brand === 'Milo').map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                counts={currentCounts[product.id] || { boxCount: 0, displayPcs: 0 }} 
                onChange={(f, v) => handleCountChange(product.id, f, v)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Beyrel's Codes</h2>
          </div>
          <div className="space-y-4">
            {PRODUCTS.filter(p => p.brand === "Beyrel's").map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                counts={currentCounts[product.id] || { boxCount: 0, displayPcs: 0 }} 
                onChange={(f, v) => handleCountChange(product.id, f, v)}
              />
            ))}
          </div>
        </section>

        <footer className="py-12 text-center">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-60">Developed By Mir Rabbi Hossain</p>
        </footer>
      </main>

      {/* DOWNLOAD POPUP MODAL */}
      {showDownloadPopup && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✅</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Stock Saved!</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Your counts are recorded. Would you like to download the report picture before finishing?</p>
            </div>
            <div className="p-6 space-y-3 bg-gray-50">
              <button 
                onClick={handleDownloadAndRedirect} 
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all"
              >
                📥 Download & Reset
              </button>
              <button 
                onClick={resetForm} 
                className="w-full py-4 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] hover:text-gray-600 transition-all"
              >
                Skip & Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED FOOTER */}
      {!isAnyModalOpen && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 p-4 pb-10 safe-area-inset-bottom z-40 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300">
          <div className="max-w-md mx-auto">
            {hasQuantities ? (
              <button 
                onClick={saveRecord} 
                disabled={saveStatus === 'saving'}
                className={`w-full py-5 rounded-[2rem] font-black text-lg text-white shadow-xl uppercase tracking-widest active:scale-95 transition-all ${
                  saveStatus === 'saving' ? 'bg-gray-400' : 'bg-emerald-600'
                }`}
              >
                {saveStatus === 'saving' ? 'Saving...' : '💾 Save & Finish'}
              </button>
            ) : (
              <div className="py-5 text-center text-gray-300 text-xs font-bold uppercase tracking-widest bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">Enter Quantities</div>
            )}
          </div>
        </footer>
      )}

      {showHistory && <HistoryView 
          history={history} 
          onLoadRecord={(date) => {
            loadDataIntoView(history[date]);
            setShowHistory(false);
          }}
          onClose={() => setShowHistory(false)} 
        />}
    </div>
  );
};

export default App;
