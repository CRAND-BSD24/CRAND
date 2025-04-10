import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="flex-shrink-0">
                <span className="text-green-800 font-bold text-xl">Pesantren</span>
              </a>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <a href="#tentang" className="text-gray-700 hover:text-green-800 px-3 py-2 rounded-md text-sm font-medium">Tentang</a>
                <a href="#program" className="text-gray-700 hover:text-green-800 px-3 py-2 rounded-md text-sm font-medium">Program</a>
                <a href="#kontak" className="text-gray-700 hover:text-green-800 px-3 py-2 rounded-md text-sm font-medium">Kontak</a>
                <a href="/login" className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium ml-2">Masuk ke Sistem</a>
              </div>
            </div>
            <div className="md:hidden">
              <button className="text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-green-600 to-green-800 text-white pt-16">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Selamat Datang di Pesantren</h1>
          <p className="text-xl md:text-2xl mb-8">Membentuk Generasi Berakhlak Mulia dan Berilmu</p>
          <a 
            href="/login" 
            className="bg-white text-green-800 px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-100 transition-colors"
          >
            Masuk ke Sistem
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-green-800">Tentang Pesantren</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 mb-6">
                Pesantren kami adalah lembaga pendidikan Islam yang berkomitmen untuk membentuk generasi muda yang berakhlak mulia, berilmu, dan bermanfaat bagi masyarakat.
              </p>
              <p className="text-lg text-gray-700">
                Dengan kurikulum yang seimbang antara ilmu agama dan ilmu umum, kami berusaha mencetak santri-santri yang siap menghadapi tantangan zaman.
              </p>
            </div>
            <div className="h-96 rounded-lg overflow-hidden">
              <img 
                src="https://risetcdn.jatimtimes.com/images/2020/03/13/3-Pondok-Pesantren-Modern-di-Malang-Favorit-Orang-Tua-Siswa-Tahun-Ini3a53975ba3a568b99.jpg" 
                alt="Foto Pesantren" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="program" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-green-800">Program Unggulan</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-green-800">Tahfidz Al-Qur'an</h3>
              <p className="text-gray-600">Program menghafal Al-Qur'an dengan metode yang efektif dan terstruktur.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-green-800">Pendidikan Formal</h3>
              <p className="text-gray-600">Kurikulum pendidikan formal yang terintegrasi dengan nilai-nilai Islam.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-green-800">Pengembangan Diri</h3>
              <p className="text-gray-600">Program pengembangan karakter dan keterampilan untuk santri.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-green-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Pesantren</h3>
              <p className="text-green-100">Membentuk generasi berakhlak mulia dan berilmu pengetahuan.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Tautan Cepat</h3>
              <ul className="space-y-2">
                <li><a href="#tentang" className="text-green-100 hover:text-white">Tentang Kami</a></li>
                <li><a href="#program" className="text-green-100 hover:text-white">Program Unggulan</a></li>
                <li><a href="#kontak" className="text-green-100 hover:text-white">Hubungi Kami</a></li>
                <li><a href="/login" className="text-green-100 hover:text-white">Login</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Sosial Media</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-green-100 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12.07c0-5.525-4.475-10-10-10s-10 4.475-10 10c0 4.991 3.657 9.128 8.438 9.879v-6.988h-2.54v-2.891h2.54V9.796c0-2.506 1.492-3.896 3.777-3.896 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.891h-2.33v6.988C18.343 21.198 22 17.061 22 12.07z" />
                  </svg>
                </a>
                <a href="#" className="text-green-100 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-green-100 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-green-800 mt-8 pt-6 text-center text-green-100">
            <p>&copy; {new Date().getFullYear()} Pesantren. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
