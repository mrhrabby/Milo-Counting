
import React, { useState, useEffect, useMemo } from 'react';
import { ProductCard } from './components/ProductCard';
import { HistoryView } from './components/HistoryView';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { AdminStats } from './components/AdminStats';
import { PRODUCTS } from './constants';
import { StockCounts, HistoryData, DailyRecord, StockEntry, User } from './types';

const App: React.FC = () => {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const [showAdminStats, setShowAdminStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // --- App State ---
  const [currentCounts, setCurrentCounts] = useState<Record<string, StockCounts>>({});
  const [history, setHistory] = useState<HistoryData>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // --- Initial Auth Check & Data Load ---
  useEffect(() => {
    const session = localStorage.getItem('pasar_besar_session');
    if (session) {
      try {
        const user = JSON.parse(session);
        setCurrentUser(user);
      } catch (e) {
        localStorage.removeItem('pasar_besar_session');
      }
    }
    setIsLoadingAuth(false);

    const savedHistory = localStorage.getItem('stock_history');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed);
      
      if (parsed[today]) {
        const initialCounts: Record<string, StockCounts> = {};
        parsed[today].entries.forEach((entry: StockEntry) => {
          initialCounts[entry.productId] = {
            boxCount: entry.boxCount,
            displayPcs: entry.displayPcs
          };
        });
        setCurrentCounts(initialCounts);
      }
    }
  }, [today]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('pasar_besar_session', JSON.stringify(user));
  };

  const confirmLogout = () => {
    localStorage.removeItem('pasar_besar_session');
    setCurrentUser(null);
    setShowLogoutConfirm(false);
    setShowUserMgmt(false);
    setShowAdminStats(false);
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
      date: today,
      entries: totals.entries,
      totalMiloPcs: totals.miloTotal,
      totalBeyrelsPcs: totals.beyrelsTotal,
      recordedBy: currentUser?.fullName || currentUser?.username
    };
    const newHistory = { ...history, [today]: record };
    setHistory(newHistory);
    localStorage.setItem('stock_history', JSON.stringify(newHistory));
    setTimeout(() => setSaveStatus('saved'), 600);
  };

  // Helper to prepare the capture area HTML
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
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Daily Inventory Record</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <p style="margin: 0; font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Timestamp</p>
            <p style="margin: 0; font-size: 13px; font-weight: 700;">${reportTime}</p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <p style="margin: 0; font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Verifier</p>
            <p style="margin: 0; font-size: 13px; font-weight: 700;">${currentUser?.fullName || currentUser?.username}</p>
          </div>
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
          <p style="margin: 0; font-size: 9px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">System Generated Output</p>
          <p style="margin: 4px 0 0; font-size: 9px; color: #cbd5e1; font-weight: 500;">Mir Rabbi Hossain</p>
        </div>
      </div>
    `;
    return captureEl;
  };

  const handleDownload = async () => {
    const captureEl = prepareCaptureHTML();
    if (!captureEl) return;

    try {
      await new Promise(r => setTimeout(r, 300));
      // @ts-ignore
      const canvas = await html2canvas(captureEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `Stock-${today}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Error generating stock record.");
      console.error(err);
    }
  };

  const handleShareWhatsApp = async () => {
    const captureEl = prepareCaptureHTML();
    if (!captureEl) return;

    try {
      await new Promise(r => setTimeout(r, 300));
      // @ts-ignore
      const canvas = await html2canvas(captureEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Check if browser supports sharing files
      if (navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `Stock-${today}.png`, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'Pasar Besar Stock Report',
                text: `Stock Report for ${today}`
              });
            } catch (shareErr) {
              // User cancelled or share failed, fallback to text
              console.warn("Native share failed, falling back to URL scheme", shareErr);
              fallbackShareText();
            }
          } else {
            fallbackShareText();
          }
        }, 'image/png');
      } else {
        fallbackShareText();
      }
    } catch (err) {
      console.error("Error preparing share image", err);
      fallbackShareText();
    }
  };

  const fallbackShareText = () => {
    const text = `*Pasar Besar Stock*\n${today}\n\n🟢 *Milo:* ${totals.miloTotal} PCS\n🔵 *Beyrel's:* ${totals.beyrelsTotal} PCS\n\n_Verified by: ${currentUser?.fullName}_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (isLoadingAuth) return null;
  if (!currentUser) return <Login onLogin={handleLogin} />;

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-44">
      <header className="px-6 pt-10 pb-8 sticky top-0 z-50 shadow-lg bg-emerald-600">
        <div className="max-w-md mx-auto flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowLogoutConfirm(true)} className="bg-white/10 p-2.5 rounded-xl text-[10px] font-black hover:bg-white/20 uppercase tracking-widest border border-white/20 shadow-sm">Logout</button>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                Pasar Besar
                {isAdmin && <span className="text-[8px] bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-md uppercase font-black shadow-sm">Admin</span>}
              </h1>
              <p className="text-[9px] text-emerald-100 font-bold uppercase tracking-widest mt-0.5 opacity-80">{currentUser.fullName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <button onClick={() => setShowAdminStats(true)} className="bg-white/20 p-3 rounded-2xl active:scale-90 transition-all shadow-inner">📊</button>
                <button onClick={() => setShowUserMgmt(true)} className="bg-white/20 p-3 rounded-2xl active:scale-90 transition-all shadow-inner">👥</button>
              </>
            )}
            <button onClick={() => setShowHistory(true)} className="bg-white/20 p-3 rounded-2xl active:scale-90 transition-all shadow-inner">📅</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Nestlé Milo</h2>
          </div>
          <div className="space-y-4">
            {PRODUCTS.filter(p => p.brand === 'Milo').map(product => (
              <ProductCard key={product.id} product={product} counts={currentCounts[product.id] || { boxCount: 0, displayPcs: 0 }} onChange={(f, v) => handleCountChange(product.id, f, v)} />
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
              <ProductCard key={product.id} product={product} counts={currentCounts[product.id] || { boxCount: 0, displayPcs: 0 }} onChange={(f, v) => handleCountChange(product.id, f, v)} />
            ))}
          </div>
        </section>

        <footer className="py-12 text-center">
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Developer: Mir Rabbi Hossain</p>
        </footer>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 p-4 pb-10 safe-area-inset-bottom z-40 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto space-y-3">
          {saveStatus === 'saved' ? (
            <div className="flex gap-2 animate-in slide-in-from-bottom-2">
              <button onClick={handleDownload} className="flex-1 py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-black text-sm uppercase active:scale-95 transition-all">📥 Record Image</button>
              <button onClick={handleShareWhatsApp} className="flex-1 py-4 bg-[#25D366] text-white rounded-2xl font-black text-sm uppercase active:scale-95 transition-all">💬 WhatsApp</button>
            </div>
          ) : hasQuantities ? (
            <button onClick={saveRecord} className="w-full py-5 rounded-[2rem] font-black text-lg bg-emerald-600 text-white shadow-xl uppercase tracking-widest active:scale-95 transition-all">💾 Save Counts</button>
          ) : (
            <div className="py-5 text-center text-gray-300 text-xs font-bold uppercase tracking-widest bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">Awaiting Input</div>
          )}
        </div>
      </footer>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] overflow-hidden">
            <div className="p-8 text-center">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Log Out?</h3>
              <p className="text-sm text-gray-400">Return to login screen?</p>
            </div>
            <div className="flex border-t">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-6 text-gray-500 font-black uppercase text-[10px]">Cancel</button>
              <button onClick={confirmLogout} className="flex-1 py-6 text-red-500 font-black uppercase text-[10px]">Log Out</button>
            </div>
          </div>
        </div>
      )}

      {showHistory && <HistoryView history={history} onClose={() => setShowHistory(false)} />}
      {showUserMgmt && <UserManagement onClose={() => setShowUserMgmt(false)} />}
      {showAdminStats && <AdminStats history={history} onClose={() => setShowAdminStats(false)} />}
    </div>
  );
};

export default App;
