import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';

interface AdminLoginProps {
  onAdminLoginSuccess: (user: User, token: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onAdminLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('admin@brivoo.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.login(email, password);
      if (res.success && res.user && res.token) {
        if (res.user.role !== 'admin') {
          setErrorMsg('Access denied. Account is not an Admin user.');
          return;
        }
        onAdminLoginSuccess(res.user, res.token);
      } else {
        setErrorMsg(res.message || 'Invalid admin credentials');
      }
    } catch (err) {
      setErrorMsg('Login failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#FAF7F2]">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E6DFC5] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#141414] text-white p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#C5A059] text-white flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold tracking-wide">
            BRIVOO Command Portal
          </h2>
          <p className="text-xs text-[#C5A059] uppercase font-bold tracking-widest">
            Restricted Admin Authentication
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 text-xs">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 font-semibold rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Preset Demo Credentials helper */}
          <div className="p-3 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 text-[11px] space-y-1">
            <p className="font-bold flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-[#C5A059]" /> Demo Credentials:</p>
            <p>Email: <code className="font-bold">admin@brivoo.com</code></p>
            <p>Password: <code className="font-bold">admin123</code></p>
          </div>

          <div>
            <label className="block font-bold mb-1 text-[#1A1A1A]">Admin Email *</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 pl-9 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                required 
              />
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-[#1A1A1A]">Admin Password *</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 pl-9 pr-10 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                required 
              />
              <Lock className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
              
              {/* Eye icon password toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-black focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#141414] hover:bg-[#C5A059] text-white py-3.5 rounded-lg font-bold uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Access Admin Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-gray-500 hover:underline"
            >
              ← Return to Customer Storefront
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
