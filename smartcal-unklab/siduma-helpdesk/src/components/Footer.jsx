import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
      <p>© 2026 Universitas Klabat — Student Support Portal (SIDUMA)</p>
      <div className="flex items-center gap-2 text-emerald-600 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        AI Triase Engine: Online
      </div>
    </footer>
  );
}