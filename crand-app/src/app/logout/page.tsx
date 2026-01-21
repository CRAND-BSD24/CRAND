export default function LogoutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0] flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-emerald-900 mb-2">Anda telah logout</h1>
        <p className="text-emerald-800/80 mb-6">Sesi Anda sudah berakhir. Silakan masuk kembali untuk mengakses CRAND.</p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="/login"
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
          >
            Masuk kembali
          </a>
          <a
            href="/"
            className="px-4 py-2 rounded-xl bg-white text-emerald-900 border border-emerald-900/20 hover:bg-emerald-50 transition-colors"
          >
            Beranda
          </a>
        </div>
      </div>
    </main>
  );
}