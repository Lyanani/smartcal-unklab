import React from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';

const AITriageAlert = ({ suggestedCategory, suggestedUnit, urgency }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-4 mb-6">
      <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600">
        <Sparkles size={20} />
      </div>
      <div className="flex-1">
        <h4 className="text-indigo-900 font-bold text-sm mb-1">
          Rekomendasi AI Triase
        </h4>
        <p className="text-indigo-800 text-sm mb-3">
          Berdasarkan analisis deskripsi laporan, AI menyarankan rute tiket sebagai berikut:
        </p>
        <div className="flex gap-4 mb-3">
          <div className="bg-white px-3 py-1.5 rounded-md text-xs font-medium border border-indigo-50">
            Kategori: <span className="font-bold">{suggestedCategory}</span>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-md text-xs font-medium border border-indigo-50">
            Tujuan: <span className="font-bold">{suggestedUnit}</span>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-md text-xs text-red-600 font-bold border border-red-50">
            Urgensi: {urgency}
          </div>
        </div>
        <button className="flex items-center gap-2 text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          <CheckCircle size={14} /> Terapkan Saran AI
        </button>
      </div>
    </div>
  );
};

export default AITriageAlert;