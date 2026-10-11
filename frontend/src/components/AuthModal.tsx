import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User as UserIcon, CheckCircle2, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { GoogleAuthModal } from './GoogleAuthModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
  initialMode?: 'login' | 'signup';
  promptMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  promptMessage
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  
  // Login / Signup State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.login(email, password);
      if (res.success && res.user && res.token) {
        onLoginSuccess(res.user, res.token);
        onClose();
      } else {
        setErrorMsg(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMsg('Login failed. Please check network.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.register(name, email, password);
      if (res.success && res.user && res.token) {
        onLoginSuccess(res.user, res.token);
        onClose();
      } else {
        setErrorMsg(res.message || 'Signup failed');
      }
    } catch (err) {
      setErrorMsg('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setIsGoogleModalOpen(true);
  };

  const handleSendForgotPasswordOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.forgotPassword(email);
      if (res.success) {
        setForgotStep(2);
        setDemoOtp(res.otp || '123456');
        setSuccessMsg(`OTP sent to ${email} (Demo Code: ${res.otp})`);
      } else {
        setErrorMsg(res.message || 'Email not found');
      }
    } catch (err) {
      setErrorMsg('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.resetPassword(email, otp, newPassword);
      if (res.success && res.user && res.token) {
        onLoginSuccess(res.user, res.token);
        onClose();
      } else {
        setErrorMsg(res.message || 'Reset failed');
      }
    } catch (err) {
      setErrorMsg('Password reset error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md overflow-y-auto p-2 sm:p-4 md:p-6 flex justify-center items-start"
    >
      <div className="bg-[#FAF7F2] w-full max-w-md rounded-2xl shadow-2xl border border-[#C5A059]/40 relative overflow-hidden my-2 sm:my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 text-gray-400 hover:text-white sm:hover:text-black transition-colors p-1.5 rounded-full min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label="Close auth dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Banner */}
        <div className="bg-[#141414] text-white p-4 sm:p-6 text-center space-y-2">
          <div className="flex justify-center items-center space-x-2.5">
            <img src="/logo.png" alt="BRIVOO" className="w-8 h-8 rounded-full object-contain border border-[#C5A059]/40 bg-white/5" />
            <span className="font-sans text-xl tracking-[0.25em] font-extrabold text-white">BRIVOO</span>
          </div>
          <p className="text-xs text-[#C5A059] uppercase font-bold tracking-widest">
            {promptMessage || "Authentication Required for Shopping"}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-[#E6DFC5] text-xs font-bold uppercase tracking-wider bg-[#F7F3EE]">
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-3 text-center transition-colors min-h-[44px] ${
                mode === 'login' ? 'border-b-2 border-[#C5A059] text-[#C5A059] bg-[#FAF7F2]' : 'text-gray-500 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`flex-1 py-3 text-center transition-colors min-h-[44px] ${
                mode === 'signup' ? 'border-b-2 border-[#C5A059] text-[#C5A059] bg-[#FAF7F2]' : 'text-gray-500 hover:text-black'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs text-[#1A1A1A]">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 font-semibold rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 text-green-700 font-semibold rounded-lg border border-green-200">
              {successMsg}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Email Address *</label>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="customer@brivoo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 pl-9 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required
                  />
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold">Password *</label>
                  <button 
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[#C5A059] font-bold hover:underline text-[11px]"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 pl-9 pr-10 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required
                  />
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                  
                  {/* Password Eye Toggle Button */}
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
                className="w-full bg-[#141414] hover:bg-[#C5A059] text-white py-3.5 rounded-lg font-bold uppercase tracking-wider transition-colors shadow-md"
              >
                {loading ? 'Signing In...' : 'Sign In & Shopping'}
              </button>

              {/* Google Auth Option */}
              <div className="pt-2 text-center space-y-3">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#E6DFC5]"></div>
                  <span className="flex-shrink mx-3 text-gray-400 uppercase text-[10px] font-bold">OR</span>
                  <div className="flex-grow border-t border-[#E6DFC5]"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 text-[#1A1A1A] border border-[#E6DFC5] py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Full Name *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Hanuman Jogi"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-3 pl-9 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required
                  />
                  <UserIcon className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Email Address *</label>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="user@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 pl-9 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required
                  />
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 pl-9 pr-10 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required
                  />
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                  
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

              <div>
                <label className="block font-bold mb-1">Confirm Password *</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full p-3 pl-9 pr-10 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required
                  />
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                  
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-black focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#141414] hover:bg-[#C5A059] text-white py-3.5 rounded-lg font-bold uppercase tracking-wider transition-colors shadow-md"
              >
                {loading ? 'Creating Account...' : 'Create Account & Continue'}
              </button>

              {/* Google Auth Option for Signup */}
              <div className="pt-2 text-center space-y-3">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#E6DFC5]"></div>
                  <span className="flex-shrink mx-3 text-gray-400 uppercase text-[10px] font-bold">OR</span>
                  <div className="flex-grow border-t border-[#E6DFC5]"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 text-[#1A1A1A] border border-[#E6DFC5] py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FLOW */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <h3 className="font-sans text-base font-bold text-stone-900 tracking-tight">
                Reset Your Password
              </h3>

              {forgotStep === 1 ? (
                <form onSubmit={handleSendForgotPasswordOTP} className="space-y-4">
                  <p className="text-gray-500 text-[11px]">
                    Enter your registered email address below. We will send a 6-digit OTP verification code to reset your password.
                  </p>

                  <div>
                    <label className="block font-bold mb-1">Registered Email *</label>
                    <input 
                      type="email" 
                      placeholder="customer@brivoo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full p-3 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#141414] hover:bg-[#C5A059] text-white py-3.5 rounded-lg font-bold uppercase tracking-wider transition-colors shadow-md"
                  >
                    {loading ? 'Sending Code...' : 'Send OTP Reset Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-gray-500 text-[11px]">
                    OTP code has been generated. Enter the code and your new password.
                  </p>

                  <div>
                    <label className="block font-bold mb-1">6-Digit Verification OTP *</label>
                    <input 
                      type="text" 
                      placeholder={demoOtp || "123456"}
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      className="w-full p-3 bg-white border border-[#E6DFC5] rounded-lg font-bold uppercase tracking-widest text-center text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">New Password *</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full p-3 pl-9 pr-10 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                        required
                      />
                      <Lock className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                      
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-black focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#141414] hover:bg-[#C5A059] text-white py-3.5 rounded-lg font-bold uppercase tracking-wider transition-colors shadow-md"
                  >
                    {loading ? 'Updating...' : 'Set New Password & Sign In'}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => { setMode('login'); setForgotStep(1); setErrorMsg(''); setSuccessMsg(''); }}
                className="w-full text-center text-xs font-bold text-[#66625D] hover:underline pt-2"
              >
                ← Back to Login
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Interactive Google Sign-In Modal */}
      <GoogleAuthModal 
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={(googleUser, googleToken) => {
          onLoginSuccess(googleUser, googleToken);
          onClose();
        }}
      />
    </div>
  );
};
