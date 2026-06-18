import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, CheckCircle, AlertCircle, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setErrorMsg("Name cannot be empty");
      return;
    }
    if (password && password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await updateProfile(name, password || undefined);
      setSuccessMsg("Profile updated successfully!");
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-2xl mx-auto px-6 py-12 relative overflow-hidden">
      <div class="absolute top-1/4 left-1/10 w-64 h-64 bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none"></div>

      <div class="glass-panel p-8 rounded-3xl relative z-10 shadow-xl">
        <h2 class="font-heading text-3xl font-bold mb-2">Student Profile</h2>
        <p class="text-sm text-slate-400 mb-8">Update your profile info and security settings</p>

        {successMsg && (
          <div class="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm mb-6">
            <CheckCircle class="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div class="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm mb-6">
            <AlertCircle class="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-6">
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address (Cannot change)</label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              class="w-full px-4 py-3 bg-slate-900/40 border border-slate-800/80 rounded-xl text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Aspirant Name</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User class="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                class="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div class="border-t border-slate-900 my-6 pt-6">
            <h3 class="text-sm font-semibold text-slate-300 mb-4">Change Password (Leave blank to keep current)</h3>
            
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock class="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    class="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock class="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    class="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            <Save class="w-5 h-5" />
            <span>{loading ? 'Saving Updates...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
