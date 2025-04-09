'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setError('Invalid email or password');
        return;
      }
      
      // Role-based redirect is handled by middleware
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e0e0] to-[#e6e6e6] p-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-black mb-2">Login to CRAND</h1>
          <p className="text-black mb-8">Masuk ke sistem manajemen pesantren.</p>
          
          {error && (
            <div className="mb-6 p-4 bg-black/5 border border-black/10 rounded-xl text-black">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl text-black placeholder:text-black/60 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                required
                placeholder="Masukkan email Anda"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl text-black placeholder:text-black/60 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                required
                placeholder="Masukkan password Anda"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 bg-black/80 hover:bg-black text-white rounded-xl font-medium transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                'Log In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

