import React, { useState } from 'react';

export default function SmartCalApp() {
  // State Autentikasi (Login)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('FILKOM');

  // Mode Tampilan setelah Login: 'faculty' (Khusus Fakultas) atau 'general' (Portal Lengkap)
  const [viewMode, setViewMode] = useState('faculty'); 
  
  // State untuk Portal General (seperti di foto sebelumnya)
  const [generalPage, setGeneralPage] = useState('dashboard'); // 'dashboard' | 'calendar' | 'reminders'
  const [calendarLayout, setCalendarLayout] = useState('grid'); // 'grid' | 'timeline'
  const [darkMode, setDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // State Checklist & Tugas Pribadi (Halaman Pengingat & Syarat)
  const [checklist, setChecklist] = useState([
    { id: 1, title: 'Selesaikan Pengisian EDOM 100% di SIAKAD', desc: 'Wajib sebelum pencetakan kartu UAS dan pembukaan akses Pra-KRS.', due: 'Batas: 23 Nov 2026', done: false },
    { id: 2, title: 'Verifikasi Status Bebas Tunggakan Keuangan', desc: 'Pastikan tagihan semester ganjil lunas agar validasi KRS tidak terkunci.', due: 'Batas: 24 Nov 2026', done: false },
    { id: 3, title: 'Susun Draf Rencana Mata Kuliah Semester Genap', desc: 'Cek mata kuliah prasyarat dan jumlah SKS maksimal berdasarkan IPS terakhir.', due: 'Batas: 25 Nov 2026', done: false },
    { id: 4, title: 'Konsultasi & Tanda Tangan Validasi Dosen PA', desc: 'Temui Dosen Pembimbing Akademik sesuai jadwal prodi masing-masing.', due: '25 – 27 Nov 2026', done: false },
    { id: 5, title: 'Kumpulkan Berkas / Laporan Praktikum Akhir', desc: 'Pastikan seluruh nilai praktikum laboratorium sudah terinput sebelum Minggu Tenang.', due: 'Sebelum 30 Nov 2026', done: false },
  ]);

  const [newTask, setNewTask] = useState({ title: '', date: '19', time: '14.00 WITA', location: 'Google Classroom / Lab' });

  // Data Agenda Khusus Fakultas
  const facultyOnlyEvents = {
    FILKOM: [
      { id: 'f1', date: '3 Nov 2026', title: 'Batas Pengumpulan Proposal Skripsi & Proyek Sistem', time: '16.00 WITA', loc: 'Portal SIAKAD / Lab FILKOM', category: 'Akademik' },
      { id: 'f2', date: '12 Nov 2026', title: 'Seminar Nasional AI & Rekayasa Perangkat Lunak', time: '09.00 WITA', loc: 'Auditorium Utama UNKLAB', category: 'Kegiatan' },
      { id: 'f3', date: '16–20 Nov 2026', title: 'Ujian Praktikum Laboratorium Terpadu', time: '08.00 WITA', loc: 'Gedung Laboratorium Terpadu', category: 'Ujian' },
    ],
    FEB: [
      { id: 'f4', date: '14 Nov 2026', title: 'Seminar Nasional Kewirausahaan & Pasar Modal', time: '09.00 WITA', loc: 'Aula FEB UNKLAB', category: 'Kegiatan' },
      { id: 'f5', date: '24 Nov 2026', title: 'Presentasi Studi Kasus Manajemen Strategis', time: '13.00 WITA', loc: 'Ruang Sidang FEB', category: 'Akademik' },
    ],
    FKEP: [
      { id: 'f6', date: '18 Nov 2026', title: 'Pembekalan Praktik Klinik Rumah Sakit', time: '08.00 WITA', loc: 'Lab Keperawatan', category: 'Praktik' },
    ]
  };

  // Data Agenda Portal General (Universitas)
  const generalAgendas = [
    { id: 1, day: 2, dateLabel: '2 Nov · Senin', title: 'Pekan Doa Mahasiswa Semester Ganjil', time: '07.00 WITA → s.d. 6 Nov', loc: 'Gedung Pniel UNKLAB', scope: 'Semua Fakultas', cat: 'Kegiatan Kampus', color: 'amber' },
    { id: 2, day: 3, dateLabel: '3 Nov · Selasa', title: 'Batas Pengumpulan Proposal Skripsi & Proyek Sistem', time: '16.00 WITA', loc: 'Portal SIAKAD / Lab FILKOM', scope: 'Fakultas Ilmu Komputer (FILKOM)', cat: 'Akademik & KRS', color: 'blue' },
    { id: 3, day: 6, dateLabel: '6 Nov · Jumat', title: 'Batas Input Nilai Mid-Semester oleh Dosen', time: '23.59 WITA', loc: 'Portal Akademik SIAKAD', scope: 'Semua Fakultas', cat: 'Akademik & KRS', color: 'blue' },
    { id: 4, day: 12, dateLabel: '12 Nov · Kamis', title: 'Seminar Nasional AI & Rekayasa Perangkat Lunak', time: '09.00 WITA', loc: 'Auditorium Utama UNKLAB', scope: 'Fakultas Ilmu Komputer (FILKOM)', cat: 'Kegiatan Kampus', color: 'amber' },
    { id: 5, day: 16, dateLabel: '16 Nov · Senin', title: 'Ujian Praktikum Laboratorium Terpadu', time: '08.00 WITA', loc: 'Gedung Laboratorium Terpadu', scope: 'Semua Fakultas', cat: 'Ujian UTS/UAS', color: 'rose' },
    { id: 6, day: 20, dateLabel: '20 Nov · Jumat', title: 'Dies Natalis & Libur Akademik Kampus', time: 'Seharian', loc: 'Kampus UNKLAB', scope: 'Semua Fakultas', cat: 'Hari Libur', color: 'emerald' },
    { id: 7, day: 23, dateLabel: '23 Nov · Senin', title: 'Batas Akhir Pengisian Evaluasi Kinerja Dosen (EDOM)', time: '23.59 WITA', loc: 'Portal SIAKAD', scope: 'Semua Fakultas', cat: 'Akademik & KRS', color: 'blue' },
    { id: 8, day: 25, dateLabel: '25 Nov · Rabu', title: 'Konsultasi & Pra-Pengisian KRS Semester Genap', time: '08.00 WITA', loc: 'Ruang Dosen PA & SIAKAD', scope: 'Semua Fakultas', cat: 'Akademik & KRS', color: 'blue' },
  ];

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (!userEmail.trim()) return;
    setIsLoggedIn(true);
  };

  // Toggle checklist
  const toggleChecklist = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  // Tambah tugas pribadi
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const newItem = {
      id: Date.now(),
      title: newTask.title,
      desc: `Jadwal pribadi pukul ${newTask.time} di ${newTask.location}`,
      due: `Tgl: ${newTask.date} Nov 2026`,
      done: false
    };
    setChecklist([newItem, ...checklist]);
    setNewTask({ ...newTask, title: '' });
  };

  const completedCount = checklist.filter(i => i.done).length;
  const readinessPercent = Math.round((completedCount / checklist.length) * 100);

  // Filter agenda di Portal General
  const filteredAgendas = generalAgendas.filter(item => {
    const matchCat = activeCategory === 'Semua' || item.cat === activeCategory;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // =========================================================================
  // HALAMAN 0: LOGIN SCREEN (Jika belum login)
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-cyan-400">SmartCal UNKLAB</h1>
            <p className="text-sm text-slate-400 mt-1">Silakan masuk menggunakan Email Gmail kamu</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email / Gmail Kampus</label>
              <input 
                type="email" 
                required
                placeholder="cth: lumintang@gmail.com" 
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Pilih Fakultas</label>
              <select 
                value={selectedFaculty} 
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="FILKOM">Fakultas Ilmu Komputer (FILKOM)</option>
                <option value="FEB">Fakultas Ekonomi & Bisnis (FEB)</option>
                <option value="FKEP">Fakultas Keperawatan (FKEP)</option>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2.5 rounded-xl transition-colors mt-2"
            >
              Masuk ke SmartCal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // HALAMAN 1: MODE FAKULTAS (Setelah Login)
  // =========================================================================
  if (viewMode === 'faculty') {
    const currentEvents = facultyOnlyEvents[selectedFaculty] || [];
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Top Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Login: {userEmail}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-2">Kalender Khusus {selectedFaculty}</h1>
              <p className="text-sm text-slate-400">Menampilkan jadwal akademik spesifik untuk fakultas pilihanmu.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Tombol ke Kalender General */}
              <button
                onClick={() => setViewMode('general')}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
              >
                🌐 Buka Kalender General
              </button>

              {/* Tombol Logout */}
              <button
                onClick={() => setIsLoggedIn(false)}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                Keluar (Logout)
              </button>
            </div>
          </div>

          {/* Daftar Agenda Fakultas */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Daftar Agenda Internal {selectedFaculty}
            </h2>
            {currentEvents.map((ev) => (
              <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyan-500/40 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/50">
                      {ev.date}
                    </span>
                    <span className="text-xs text-slate-400">• {ev.time}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{ev.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">📍 {ev.loc}</p>
                </div>
                <span className="text-xs font-medium text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full self-start sm:self-center">
                  {ev.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // HALAMAN 2: PORTAL GENERAL (SESUAI FOTO) DENGAN TOMBOL LOGOUT
  // =========================================================================
  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* NAVBAR ATAS */}
      <header className={`border-b sticky top-0 z-30 ${darkMode ? 'bg-[#0f172a]/95 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 font-bold text-base">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${darkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
                📅
              </div>
              <span>SmartCal <span className="font-normal text-slate-400 text-sm">UNKLAB</span></span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setGeneralPage('dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  generalPage === 'dashboard'
                    ? (darkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white')
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                ⊞ Dashboard
              </button>
              <button
                onClick={() => setGeneralPage('calendar')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  generalPage === 'calendar'
                    ? (darkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white')
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                📅 Kalender Akademik
              </button>
              <button
                onClick={() => setGeneralPage('reminders')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  generalPage === 'reminders'
                    ? (darkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white')
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                📋 Pengingat & Syarat
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Toggle Dark/Light Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg border text-xs ${darkMode ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Tombol Kembali ke Mode Fakultas */}
            <button
              onClick={() => setViewMode('faculty')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-700 text-cyan-400' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              ← Mode Fakultas
            </button>

            {/* Tombol Keluar (Logout) */}
            <button
              onClick={() => setIsLoggedIn(false)}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA PORTAL GENERAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* DASHBOARD */}
        {generalPage === 'dashboard' && (
          <div className="space-y-6">
            <div className={`rounded-2xl border p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${darkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-blue-500/10 text-blue-500 font-semibold px-2.5 py-0.5 rounded-full">● Agenda Krusial Terdekat</span>
                  <span className="text-slate-400">Akun: {userEmail} ({selectedFaculty})</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">Konsultasi & Pra-Pengisian KRS Semester Genap</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span>📅 Rabu, 25 November 2026</span>
                  <span>🕒 08.00 WITA</span>
                  <span>📍 Ruang Dosen PA & SIAKAD</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5 text-center">
                {[
                  { val: '06', label: 'HARI' },
                  { val: '09', label: 'JAM' },
                  { val: '54', label: 'MENIT' },
                  { val: '44', label: 'DETIK' },
                ].map((box, idx) => (
                  <div key={idx} className={`w-16 sm:w-20 py-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-xl sm:text-2xl font-bold">{box.val}</div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{box.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Kartu Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <p className="text-xs text-slate-400">Agenda Fakultas Aktif</p>
                <p className="text-2xl font-bold mt-1">9 Agenda</p>
                <p className="text-xs text-slate-400 mt-1">5 agenda mendatang mulai 15 Nov</p>
              </div>
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <p className="text-xs text-slate-400">Terkirim ke Gmail Saya</p>
                <p className="text-2xl font-bold mt-1">0 Jadwal</p>
                <p className="text-xs text-slate-400 mt-1">Tujuan: {userEmail}</p>
              </div>
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <p className="text-xs text-slate-400">Radar Pekan Padat</p>
                <p className="text-2xl font-bold mt-1">1 Periode</p>
                <p className="text-xs text-slate-400 mt-1">Tumpukan tenggat dalam 4 hari</p>
              </div>
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <p className="text-xs text-slate-400">Kesiapan Syarat KRS/UAS</p>
                <p className="text-2xl font-bold mt-1">{readinessPercent}%</p>
                <p className="text-xs text-slate-400 mt-1">{completedCount} dari {checklist.length} syarat selesai</p>
              </div>
            </div>
          </div>
        )}

        {/* KALENDER AKADEMIK */}
        {generalPage === 'calendar' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {['Semua', 'Akademik & KRS', 'Ujian UTS/UAS', 'Hari Libur', 'Kegiatan Kampus'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      activeCategory === cat
                        ? (darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-900 border-slate-900 text-white')
                        : (darkMode ? 'bg-[#0f172a] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600')
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCalendarLayout('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${calendarLayout === 'grid' ? 'bg-cyan-500 text-slate-950 font-bold' : ''}`}
                >
                  ⊞ Grid Kalender
                </button>
                <button
                  onClick={() => setCalendarLayout('timeline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${calendarLayout === 'timeline' ? 'bg-cyan-500 text-slate-950 font-bold' : ''}`}
                >
                  ☰ Daftar Timeline
                </button>
              </div>
            </div>

            {calendarLayout === 'grid' ? (
              <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h2 className="font-bold text-base mb-4">November 2026 <span className="text-xs font-normal text-slate-400">({filteredAgendas.length} agenda)</span></h2>
                <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                  {['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 border-l border-t border-slate-200 dark:border-slate-800 mt-2">
                  {[26, 27, 28, 29, 30, 31].map(prev => (
                    <div key={`prev-${prev}`} className="h-20 p-1.5 border-r border-b border-slate-200 dark:border-slate-800 text-xs text-slate-400/40">{prev}</div>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                    <div key={day} className="h-20 p-1.5 border-r border-b border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                      <span className={`font-semibold ${day === 15 ? 'bg-cyan-500 text-slate-950 w-5 h-5 rounded-full inline-flex items-center justify-center' : ''}`}>{day}</span>
                      <div className="space-y-0.5 mt-1">
                        {filteredAgendas.filter(a => a.day === day).map(ev => (
                          <div key={ev.id} className="text-[9px] truncate px-1 py-0.5 rounded bg-blue-500/15 text-blue-400 font-medium">
                            • {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="font-bold text-base mb-4">Timeline Agenda</h3>
                <div className="space-y-3">
                  {filteredAgendas.map(ev => (
                    <div key={ev.id} className={`p-4 rounded-xl border flex justify-between items-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <span className="text-xs text-cyan-400 font-semibold">{ev.dateLabel}</span>
                        <h4 className="font-bold text-sm mt-1">{ev.title}</h4>
                        <p className="text-xs text-slate-400">📍 {ev.loc}</p>
                      </div>
                      <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg">✉️ Kirim ke {userEmail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PENGINGAT & SYARAT */}
        {generalPage === 'reminders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className="font-bold text-base mb-1">Riwayat Pengingat Gmail Aktif</h3>
              <p className="text-xs text-slate-400 mb-4">Tujuan pengiriman: <span className="text-cyan-400 font-semibold">{userEmail}</span></p>
              <div className={`p-6 rounded-xl border border-dashed text-center text-xs text-slate-400 ${darkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                Belum ada pengingat yang dikirim ke Gmail Anda.
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className="font-bold text-base mb-1">Checklist Syarat Akademik Semester Ganjil</h3>
              <p className="text-xs text-slate-400 mb-4">Progres checklist otomatis tersimpan.</p>
              <div className="space-y-2.5">
                {checklist.map((item) => (
                  <label key={item.id} className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border cursor-pointer ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={item.done} onChange={() => toggleChecklist(item.id)} className="mt-1" />
                      <div>
                        <p className={`text-sm font-bold ${item.done ? 'line-through text-slate-400' : ''}`}>{item.title}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-1 rounded border whitespace-nowrap">{item.due}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}