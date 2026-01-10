
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const PREDEFINED_USERS = [
  { id: 'admin-0', username: 'admin', password: 'Rabbi@198027', role: 'admin' as UserRole, fullName: 'System Admin' },
  { id: 'staff-0', username: 'rabbi98', password: 'rabbi1234', role: 'staff' as UserRole, fullName: 'Rabbi Staff' }
];

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const storedUsers = JSON.parse(localStorage.getItem('pasar_besar_users') || '[]');
    const allUsers = [...PREDEFINED_USERS, ...storedUsers];

    if (isLogin) {
      const user = allUsers.find(u => u.username === username.toLowerCase() && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid username or password');
      }
    } else {
      const exists = allUsers.some(u => u.username === username.toLowerCase());
      if (exists) {
        setError('Username already taken');
      } else {
        const newUser: User = {
          id: Date.now().toString(),
          username: username.toLowerCase(),
          password,
          fullName,
          role: 'staff'
        };
        const updated = [...storedUsers, newUser];
        localStorage.setItem('pasar_besar_users', JSON.stringify(updated));
        onLogin(newUser);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-emerald-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center justify-center w-32 h-32 bg-emerald-600 rounded-full shadow-2xl overflow-hidden border-4 border-white">
              <span className="text-4xl font-black text-white tracking-tighter">PB</span>
            </div>
          </div>
          <div className="mt-8">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Pasar Besar</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-3">Stock Accounting Portal</p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 outline-none transition-all"
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 outline-none transition-all"
                placeholder="Login ID"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 outline-none transition-all"
                placeholder="Passcode"
                required
              />
            </div>

            {error && <p className="text-red-500 text-xs font-bold text-center px-4 py-2 bg-red-50 rounded-xl">{error}</p>}

            <button
              type="submit"
              className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 active:scale-95 transition-all mt-4"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-8 text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors uppercase tracking-widest"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already registered? Log In'}
          </button>
        </div>

        <footer className="text-center pt-8">
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.4em]">Proprietary Software</p>
          <p className="text-xs text-gray-400 font-black mt-1 opacity-60">Mir Rabbi Hossain</p>
        </footer>
      </div>
    </div>
  );
};
