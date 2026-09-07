import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import { Users, UserPlus, Copy, Check, MessageSquareShare, KeyRound, Share2 } from 'lucide-react';

export const InviteModal = () => {
  const { members, isOwner } = useAuth();
  const { createFamilyInvitation } = useExpenses();

  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateCode = async () => {
    setLoading(true);
    const res = await createFamilyInvitation();
    setLoading(false);
    if (res.success) {
      setGeneratedCode(res.inviteCode);
    }
  };

  const directLink = generatedCode 
    ? `${window.location.origin}/?invite=${generatedCode}` 
    : '';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Hi! Join our family household expense register on Gharkharch. Click this link to join automatically: ${directLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Users className="w-4 h-4 text-brand-400" />
            Household Members ({members.length})
          </h3>
          <p className="text-[11px] text-slate-400">People authorized to log household expenses</p>
        </div>

        {isOwner && (
          <button
            onClick={handleGenerateCode}
            disabled={loading}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{loading ? 'Creating...' : 'Invite Member'}</span>
          </button>
        )}
      </div>

      {/* GENERATED INVITATION CODE & WHATSAPP SHARE CARD */}
      {generatedCode && (
        <div className="glass-panel rounded-2xl p-4 border border-brand-500/40 bg-brand-600/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-300 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              1-Click WhatsApp Invite Ready
            </span>
            <span className="text-[10px] text-slate-400">Valid 7 Days</span>
          </div>

          {/* 1-Click WhatsApp Share Button */}
          <button
            onClick={shareViaWhatsApp}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <MessageSquareShare className="w-4 h-4 text-emerald-100" />
            <span>Share Invite via WhatsApp</span>
          </button>

          {/* Code & Direct Link */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="font-mono text-sm font-bold tracking-widest text-white">{generatedCode}</span>
              <button
                onClick={() => copyToClipboard(directLink)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-brand-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              When clicked on WhatsApp, the invited person will automatically join your household upon signup!
            </p>
          </div>
        </div>
      )}

      {/* MEMBERS LIST */}
      <div className="space-y-2">
        {members.map(m => (
          <div
            key={m.id}
            className="glass-panel rounded-xl p-3 border border-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-bold text-xs uppercase overflow-hidden">
                {m.profile?.avatar_url ? (
                  <img src={m.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{m.profile?.full_name?.charAt(0) || 'M'}</span>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-white leading-tight">
                  {m.profile?.full_name || 'Member'}
                </p>
                <p className="text-[10px] text-slate-400">{m.profile?.email}</p>
              </div>
            </div>

            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
              m.role === 'owner'
                ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            }`}>
              {m.role}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};
