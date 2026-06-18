import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert, LogIn, Chrome } from 'lucide-react';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Prompt the user for an email to mock the Google OAuth account selection dialog
    const googleEmail = prompt("Simulating Google OAuth account selection:\n\nEnter email address:", "aspirant@gmail.com");
    if (!googleEmail) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      // Pick a mock name based on the email username
      const name = googleEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
      const formattedName = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || "Google User";
      
      await googleLogin(googleEmail, formattedName);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-[calc(100vh-76px)] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div class="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div class="glass-panel max-w-md w-full p-8 rounded-3xl relative z-10 shadow-2xl">
        <div class="text-center mb-8">
          <h2 class="font-heading text-3xl font-bold mb-2">Welcome Back</h2>
          <p class="text-sm text-slate-400">Login to manage your exam travel plans</p>
        </div>

        {errorMsg && (
          <div class="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm mb-6">
            <ShieldAlert class="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-5">
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail class="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                class="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock class="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                class="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            <LogIn class="w-5 h-5" />
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Separator */}
        <div class="flex items-center my-6">
          <div class="flex-grow border-t border-slate-800"></div>
          <span class="mx-3 text-xs text-slate-500 uppercase tracking-wider">Or</span>
          <div class="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          class="w-full py-3 bg-slate-900 border border-slate-800 text-slate-200 hover:text-white font-medium rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-850 hover:border-slate-700 transition-all duration-200"
        >
          <Chrome class="w-5 h-5 text-indigo-400" />
          <span>Continue with Google</span>
        </button>

        <p class="text-center text-sm text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" class="text-indigo-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
