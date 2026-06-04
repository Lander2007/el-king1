import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Lock, User, Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, loading, error, login, verify } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(true);

  // Verify stored token on load
  useEffect(() => {
    const checkAuth = async () => {
      await verify();
      setVerifying(false);
    };
    checkAuth();
  }, [verify]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const success = await login(username, password);
    if (success) {
      toast.success('Logged in successfully as Admin');
    } else {
      toast.error('Invalid credentials or rate limited');
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 size={40} className="animate-spin text-[var(--ks-blue)] mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">Verifying Admin Session...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden px-4">
      {/* Background radial glows */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[var(--ks-blue)] blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--ks-gold)] blur-[120px] animate-pulse" />
      </div>

      <div 
        className="w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 transition-all duration-300"
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--ks-blue)] to-[var(--ks-blue-dark)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/10">
            <Lock size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Admin Portal</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Please authenticate to access the Control Center</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold flex items-center gap-2.5 animate-pulse">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1">Username</label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm font-semibold text-white placeholder-slate-600 outline-none transition-all focus:border-[var(--ks-blue)] focus:ring-1 focus:ring-[var(--ks-blue)]"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1">Password</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm font-semibold text-white placeholder-slate-600 outline-none transition-all focus:border-[var(--ks-blue)] focus:ring-1 focus:ring-[var(--ks-blue)]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-white font-extrabold text-sm transition-all duration-300 bg-[var(--ks-blue)] hover:shadow-lg hover:shadow-blue-500/20 active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
