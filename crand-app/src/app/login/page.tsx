'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession, useSession } from 'next-auth/react';
import Image from 'next/image';
import logo from '@/assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { status, data: session } = useSession();

  // Catatan: Tidak redirect otomatis dari /login meskipun sudah authenticated.
  // Pengguna wajib memasukkan email & password dulu untuk diarahkan sesuai role.

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
        setLoading(false);
        return;
      }
      
      // Ambil session terbaru dan redirect sesuai role
      const updated = await getSession();
      const userRole = updated?.user?.role;
      if (userRole === 'admin') {
        router.push('/admin');
      } else if (userRole === 'teacher') {
        router.push('/teacher');
      } else if (userRole === 'student') {
        router.push('/student');
      } else if (userRole === 'hrd') {
        router.push('/hrd');
      } else if (userRole === 'educator') {
        router.push('/educator');
      } else if (userRole === 'manager') {
        router.push('/manager');
      } else {
        router.push('/');
      }
      setLoading(false);
      
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-700 to-green-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-full bg-[#e2f6f4] p-3 mb-6 shadow-sm">
              <Image 
                src={logo} 
                alt="CRAND Logo" 
                width={100} 
                height={100} 
                priority
                className="bg-[#e2f6f4]" 
              />
            </div>
            <h1 className="text-2xl font-bold text-black">Welcome</h1>
            <p className="text-black text-sm">Please Login to continue.</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
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
                className="w-full px-4 py-3 border border-emerald-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
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
                className="w-full px-4 py-3 border border-emerald-100 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
                placeholder="Masukkan password Anda"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-medium transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-emerald-200 border-t-white rounded-full animate-spin"></div>
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

