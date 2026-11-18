import React from 'react';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    'Baru': 'bg-blue-100 text-blue-700',
    'Ditinjau': 'bg-indigo-100 text-indigo-700',
    'Sedang Diproses': 'bg-purple-100 text-purple-700',
    'Menunggu Informasi': 'bg-orange-100 text-orange-700',
    'Selesai': 'bg-green-100 text-green-700',
    'Ditutup': 'bg-gray-100 text-gray-700',
  };

  const currentStyle = statusStyles[status] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${currentStyle}`}>
      {status}
    </span>
  );
};

export default StatusBadge;