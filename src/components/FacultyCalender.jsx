import React, { useState } from 'react';

export default function FacultyCalendar() {
  const [selectedFaculty, setSelectedFaculty] = useState('Fasilkom');

  const academicEvents = {
    Fasilkom: [
      { id: 1, date: '10 November 2026', title: 'Batas Akhir Pendaftaran Proposal Skripsi', category: 'Akademik' },
      { id: 2, date: '24 November 2026', title: 'Ujian Praktikum Pemrograman Web', category: 'Ujian' },
    ],
    FEB: [
      { id: 3, date: '12 November 2026', title: 'Seminar Nasional Kewirausahaan', category: 'Event' },
      { id: 4, date: '25 November 2026', title: 'Presentasi Studi Kasus Manajemen', category: 'Akademik' },
    ],
    Keperawatan: [
      { id: 5, date: '15 November 2026', title: 'Pembekalan Praktik Klinik Rumah Sakit', category: 'Praktik' },
    ],
  };

  const currentEvents = academicEvents[selectedFaculty] || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-cyan-400">Kalender Akademik Fakultas</h1>
            <p className="text-sm text-slate-400">Pilih fakultas untuk melihat jadwal khusus</p>
          </div>

          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="Fasilkom">Fakultas Ilmu Komputer (Fasilkom)</option>
            <option value="FEB">Fakultas Ekonomi & Bisnis (FEB)</option>
            <option value="Keperawatan">Fakultas Keperawatan</option>
          </select>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Jadwal untuk {selectedFaculty}
          </h2>

          {currentEvents.map((event) => (
            <div 
              key={event.id} 
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="text-xs font-medium text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/50">
                  {event.date}
                </span>
                <h3 className="text-base font-semibold text-white mt-2">{event.title}</h3>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full self-start sm:self-center">
                {event.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}