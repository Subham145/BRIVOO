import React, { useState } from 'react';
import { X, User as UserIcon, Plus, Check, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
  role?: 'customer' | 'admin';
  title?: string;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  role = 'customer',
  title = 'Continue to BRIVOO'
}) => {
  if (!isOpen) return null;

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const defaultAccounts = role === 'admin' ? [
    {
      name: 'Sujal Rathore (Super Admin)',
      email: 'sujalrathore970@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Verified Admin'
    },
    {
      name: 'Hanuman Jogi (Owner)',
      email: 'hanuman.jogi@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Staff SSO'
    }
  ] : [
    {
      name: 'Hanuman Jogi',
      email: 'hanuman.jogi@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Active Profile'
    },
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      badge: 'Personal Google'
    },
    {
      name: 'BRIVOO Luxe Member',
      email: 'customer@brivoo.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      badge: 'VIP Shopper'
    }
  ];

  const handleSelectAccount = async (name: string, email: string, avatar?: string) => {
    setSelectedEmail(email);
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.googleLogin(name, email, avatar, role);
      if (res.success && res.user && res.token) {
        onSuccess(res.user, res.token);
        onClose();
      } else {
        setErrorMsg(res.message || 'Google authentication was declined');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to Google Auth service');
    } finally {
      setLoading(false);
      setSelectedEmail(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const finalName = customName.trim() || customEmail.split('@')[0];
    const generatedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(finalName)}`;
    await handleSelectAccount(finalName, customEmail, generatedAvatar);
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative text-[#1A1A1A] font-sans">
        
        {/* Close Button */}
        {!loading && (
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Google Header */}
        <div className="p-6 pb-4 border-b border-gray-100 text-center">
          <div className="flex justify-center items-center mb-3">
            {/* Google G SVG */}
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900">
            Sign in with Google
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Choose an account to continue to <span className="font-semibold text-gray-700">BRIVOO Atelier</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          
          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Accounts List */}
          {!isCustomMode ? (
            <div className="space-y-1.5">
              {defaultAccounts.map((acc) => {
                const isItemLoading = loading && selectedEmail === acc.email;
                return (
                  <button
                    key={acc.email}
                    disabled={loading}
                    onClick={() => handleSelectAccount(acc.name, acc.email, acc.avatar)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 text-left group"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <img 
                        src={acc.avatar} 
                        alt={acc.name} 
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0" 
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 truncate">
                          {acc.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {acc.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 pl-2 flex-shrink-0">
                      {isItemLoading ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : (
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {acc.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Use Another Account Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsCustomMode(true)}
                className="w-full flex items-center space-x-3 p-2.5 rounded-xl hover:bg-gray-50 text-left border border-dashed border-gray-200 hover:border-gray-400 transition-colors mt-2"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Use another Google account</p>
                  <p className="text-[10px] text-gray-500">Enter custom Gmail or Workspace ID</p>
                </div>
              </button>
            </div>
          ) : (
            /* Custom Google Account Input */
            <form onSubmit={handleCustomSubmit} className="space-y-3 pt-1">
              <div className="text-xs font-bold text-gray-700">
                Enter your Google Account details:
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Your Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Subham Roy"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Google Email *</label>
                <input 
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  disabled={loading}
                  className="flex-1 py-2 text-xs font-semibold border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center justify-center space-x-1"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Notice */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 text-center leading-relaxed">
          To continue, Google shares your name, email address, and profile picture with BRIVOO Atelier.
        </div>

      </div>
    </div>
  );
};
