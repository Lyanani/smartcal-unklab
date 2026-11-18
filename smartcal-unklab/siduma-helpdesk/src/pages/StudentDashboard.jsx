import React from 'react';
import { PlusCircle, Search, LayoutDashboard, LifeBuoy } from 'lucide-react';
import TicketCard from '../components/TicketList'; // Memanggil kartu yang baru kamu buat

// Data sementara (dummy) agar layarnya tidak kosong
const dummyTickets = [
  { id: 'T-1042', title: 'Tidak bisa login ke Portal S1', category: 'IT Support', date: 'Hari ini, 09:30', status: 'Baru' },
  { id: 'T-1041', title: 'Konfirmasi Pembayaran Cicilan Asrama', category: 'Keuangan', date: 'Kemarin, 14:15', status: 'Sedang Diproses' },
  { id: 'T-1035', title: 'AC Kamar Asrama Bougenville Rusak', category: 'Fasilitas', date: '12 Nov 2026', status: 'Selesai' },
];

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block">
        <div className="text-2xl font-bold text-blue-800 mb-8 tracking-tight">SIDUMA.</div>
        <nav className="space-y-2">
          <a href="#" className="flex items-center gap-3 text-blue-700 bg-blue-50 px-4 py-3 rounded-lg font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-lg font-medium transition">
            <LifeBuoy size={20} /> Pusat Panduan
          </a>
        </nav>
      </aside>

      {/* Konten Kanan */}
      <main className="flex-1 p-8">
        {/* Header Sapaan */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Halo, Mahasiswa! 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Ada yang bisa kami bantu di kampus hari ini?</p>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition">
            <PlusCircle size={20} />
            Buat Tiket Bantuan
          </button>
        </header>

        {/* Kolom Pencarian */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nomor tiket atau masalah..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
            />
          </div>
          <select className="border border-gray-200 text-gray-600 py-2 px-4 rounded-lg focus:outline-none">
            <option>Semua Status</option>
            <option>Aktif</option>
            <option>Selesai</option>
          </select>
        </div>

        {/* Daftar Tiket Loop */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tiket Laporan Aktif</h2>
          <div className="space-y-4">
            {dummyTickets.map((ticket) => (
              <div key={ticket.id}>Tes Tiket Muncul</div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;