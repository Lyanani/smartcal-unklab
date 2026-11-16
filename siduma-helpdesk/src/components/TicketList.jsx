import React, { useState } from 'react';
import { Search, Clock, ChevronRight, AlertCircle } from 'lucide-react';

export default function TicketList() {
  const [searchTerm, setSearchTerm] = useState('');

  const tickets = [
    { id: 'T-1042', title: 'Kendala Akses Login ke Portal SIU S1', category: 'IT Support', unit: 'Departemen IT', date: 'Hari ini, 09:30', status: 'Baru' },
    { id: 'T-1041', title: 'Konfirmasi Verifikasi Pembayaran Cicilan Asrama', category: 'Keuangan', unit: 'Kantor Finance', date: 'Kemarin, 14:15', status: 'Sedang Diproses' },
    { id: 'T-1035', title: 'Perbaikan Pendingin Ruangan (AC) Asrama Bougenville', category: 'Fasilitas', unit: 'Maintenance', date: '12 Nov 2026', status: 'Selesai' },
  ];

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Daftar Tiket Laporan Anda</h3>
          <p className="text-xs text-slate-500">Pantau status penanganan dari unit terkait UNKLAB</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari tiket atau kendala..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
          />
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <div key={ticket.id} className="p-6 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer group">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">#{ticket.id}</span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    ticket.status === 'Baru' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'Sedang Diproses' ? 'bg-purple-100 text-purple-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• Ditujukan ke: {ticket.unit}</span>
                </div>

                <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {ticket.title}
                </h4>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="bg-slate-100 px-2.5 py-0.5 rounded-md font-medium text-slate-600">{ticket.category}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {ticket.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <span className="text-xs font-medium text-slate-400 group-hover:text-blue-600 transition">Lihat Detail</span>
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition flex items-center justify-center text-slate-400">
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400">
            <AlertCircle size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Tidak ada tiket yang cocok dengan pencarian.</p>
          </div>
        )}
      </div>
    </div>
  );
}