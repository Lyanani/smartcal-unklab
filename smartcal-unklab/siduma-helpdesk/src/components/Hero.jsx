import React from 'react';
import { Sparkles, PlusCircle } from 'lucide-react';

export default function Hero() {
  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-blue-700/60 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-3 tracking-wide text-blue-200">
          <Sparkles size={14} className="text-amber-300" /> Universitas Klabat HelpDesk System
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Selamat Datang di Portal Layanan Terpadu</h2>
        <p className="text-blue-100 text-sm mt-1 max-w-xl">
          Ajukan kendala akademik, keuangan, maupun fasilitas kampus. Sistem AI kami siap membantu mengarahkan tiketmu secara cepat.
        </p>
      </div>

      <button className="relative z-10 bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer">
        <PlusCircle size={18} className="text-blue-600" />
        Buat Tiket Bantuan Baru
      </button>
    </div>
  );
}