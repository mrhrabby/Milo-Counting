
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface UserManagementProps {
  onClose: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('staff');
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pasar_besar_users');
    if (saved) {
      setUsers(JSON.parse(saved));
    }
  }, []);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updated: User[];
    if (editingId) {
      updated = users.map(u => u.id === editingId ? {
        ...u,
        username: newUsername.trim().toLowerCase(),
        password: newPassword,
        role: newRole,
        fullName: newFullName.trim()
      } : u);
      setEditingId(null);
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        username: newUsername.trim().toLowerCase(),
        password: newPassword,
        role: newRole,
        fullName: newFullName.trim()
      };
      updated = [...users, newUser];
    }
    
    setUsers(updated);
    localStorage.setItem('pasar_besar_users', JSON.stringify(updated));
    
    // Reset Form
    setNewUsername('');
    setNewPassword('');
    setNewFullName('');
    setNewRole('staff');
    setActiveTab('list');
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setNewUsername(user.username);
    setNewPassword(user.password || '');
    setNewFullName(user.fullName);
    setNewRole(user.role);
    setActiveTab('add');
  };

  const deleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;
    
    if (confirm(`Delete account for ${userToDelete.fullName}?`)) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      localStorage.setItem('pasar_besar_users', JSON.stringify(updated));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-lg">
      <div className="bg-white w-full max-w-md max-h-[95vh] rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-20 duration-500 ease-out">
        
        {/* Dashboard Header */}
        <div className="px-8 pt-10 pb-6 bg-gray-50/80 border-b border-gray-100">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Manage Personnel</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 flex items-center justify-center bg-white shadow-lg border border-gray-50 text-gray-400 rounded-full active:scale-90 transition-all text-xl"
            >
              ✕
            </button>
          </div>

          <div className="flex bg-gray-200/50 p-1 rounded-2xl">
            <button 
              onClick={() => { setActiveTab('list'); setEditingId(null); }}
              className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-400'}`}
            >
              Staff List ({users.length})
            </button>
            <button 
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'add' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-400'}`}
            >
              {editingId ? 'Edit User' : 'Add New'}
            </button>
          </div>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 bg-white">
          {activeTab === 'add' ? (
            <form onSubmit={handleSaveUser} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Full Name</label>
                <input
                  placeholder="Full Name"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 outline-none transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Username</label>
                  <input
                    placeholder="Username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Password</label>
                  <input
                    type="text"
                    placeholder="Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Access Level</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 outline-none appearance-none transition-all cursor-pointer"
                >
                  <option value="staff">Standard Staff</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
              <button className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 active:scale-95 transition-all mt-6">
                {editingId ? 'Update Account' : 'Create Account'}
              </button>
              {editingId && (
                <button 
                  type="button"
                  onClick={() => { setEditingId(null); setActiveTab('list'); }}
                  className="w-full py-3 text-gray-400 font-bold uppercase text-[10px] tracking-widest"
                >
                  Cancel Editing
                </button>
              )}
            </form>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {users.map(u => (
                <div key={u.id} className="flex justify-between items-center p-6 bg-white border border-gray-100 rounded-[2.5rem] hover:shadow-lg hover:border-emerald-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[10px] shadow-sm ${u.role === 'admin' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {u.role === 'admin' ? 'ADM' : 'STF'}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 leading-tight">{u.fullName}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 tracking-[0.1em]">@{u.username} • {u.password}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEdit(u)} 
                      className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all active:scale-90"
                      title="Edit User"
                    >
                      <span className="text-lg">✏️</span>
                    </button>
                    {u.username !== 'admin' && (
                      <button 
                        onClick={() => deleteUser(u.id)} 
                        className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                        title="Delete User"
                      >
                        <span className="text-lg">✕</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-4xl opacity-20 mb-4">👥</div>
                  <p className="text-gray-300 font-bold uppercase text-[10px] tracking-widest">No Active Personnel</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-10 pt-0 text-center bg-white border-t border-gray-50">
           <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.4em] mt-4">Pasar Besar Staff Portal</p>
        </div>
      </div>
    </div>
  );
};
