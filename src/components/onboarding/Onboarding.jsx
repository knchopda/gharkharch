import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Home, KeyRound, UserPlus, LogIn, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const Onboarding = () => {
  const { user, loginWithEmail, signupWithEmail, createHousehold, joinHouseholdByCode, authError } = useAuth();

  const [authMode, setAuthMode] = useState('signup'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Onboarding Step 2: Household Setup Choice
  const [setupMode, setSetupMode] = useState('create'); // 'create' | 'join'
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Authentication submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const res = await loginWithEmail(email, password);
        if (!res.success) setErrorMsg(res.error || 'Failed to login');
      } else {
        const res = await signupWithEmail(email, password, fullName);
        if (!res.success) setErrorMsg(res.error || 'Failed to sign up');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Household Creation
  const handleCreateHousehold = async (e) => {
    e.preventDefault();
    if (!householdName.trim()) {
      setErrorMsg('Please enter a household name.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    const res = await createHousehold(householdName.trim());
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to create household.');
    }
    setLoading(false);
  };

  // Handle Joining Household via Code
  const handleJoinHousehold = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setErrorMsg('Please enter an invitation code.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    const res = await joinHouseholdByCode(inviteCode.trim());
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid invitation code.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center px-4 py-8 relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
        
        {/* App Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 shadow-xl shadow-brand-500/30 mb-2">
            <BookOpen className="w-8 h-8 text-white stroke-[2.2]" />
          </div>
          <h1 className="font-outfit text-3xl font-extrabold tracking-tight text-white">Gharkharch</h1>
          <p className="text-slate-400 text-sm font-medium">Digital Household Expense Register</p>
        </div>

        {/* Dynamic Step Container */}
        {!user ? (
          /* STEP 1: AUTHENTICATION (SIGNUP / LOGIN) */
          <div className="glass-panel rounded-2xl p-6 shadow-2xl space-y-5 border border-slate-800">
            <div className="flex bg-slate-800/80 rounded-xl p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 rounded-lg transition-all ${authMode === 'signup' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-lg transition-all ${authMode === 'login' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Log In
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Processing...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {!isSupabaseConfigured && (
              <div className="pt-2 text-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleAuthSubmit({ preventDefault: () => {} })}
                  className="text-xs text-brand-400 underline hover:text-brand-300 font-medium"
                >
                  ⚡ Click here for Instant Demo Mode Access
                </button>
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: HOUSEHOLD ONBOARDING (CREATE OR JOIN) */
          <div className="glass-panel rounded-2xl p-6 shadow-2xl space-y-5 border border-slate-800">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">Welcome, {user.full_name || 'Member'}!</h2>
              <p className="text-xs text-slate-400">Set up your household expense register to get started.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSetupMode('create')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  setupMode === 'create' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Create Household</span>
              </button>
              <button
                type="button"
                onClick={() => setSetupMode('join')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  setupMode === 'join' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Join with Code</span>
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
                {errorMsg}
              </div>
            )}

            {setupMode === 'create' ? (
              <form onSubmit={handleCreateHousehold} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Household Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma Family Household"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">You will be designated as the Household Owner.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>{loading ? 'Creating...' : 'Create Household & Continue'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinHousehold} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">6-Digit Invitation Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GK-9X2L"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase tracking-wider text-center placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 text-center">Ask your Household Owner for their invitation code.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{loading ? 'Verifying Code...' : 'Join Household'}</span>
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
