# Edit Kalender (fitur sementara)

Fitur ini membantu mengisi/menyesuaikan tanggal di Dashboard Tamu sebelum data
final dimasukkan ke `src/data/guestCalendar.js`. Seluruh kodenya ada di folder ini.

## Cara memakai

- **Mode dev** (`npm run dev`): tombol **Edit Kalender** (kuning) muncul di header dashboard tamu.
- **Produksi**: buka `https://<domain-anda>/?edit=1` sekali. Mode edit diingat di browser itu.
  Matikan dengan `?edit=0` atau tombol "Matikan mode edit".
- Pengunjung biasa tidak melihat tombol apa pun.
- Hasil edit hanya tersimpan di `localStorage` browser Anda (kunci `smartcal-temp-calendar-v1`),
  tidak dikirim ke server dan tidak terlihat oleh pengunjung lain.
- Agar permanen untuk semua orang: klik **Salin JSON**, lalu tempel menggantikan isi
  array `GUEST_EVENTS` di `src/data/guestCalendar.js`, dan commit.

## Cara menghapus fitur ini

1. Hapus folder `src/temp-edit-calendar/`.
2. Di `src/App.jsx`, cari penanda `TEMP-EDIT-CALENDAR` (ada 2 tempat):
   - hapus baris `import TempEditCalendar ...`;
   - ganti blok `<TempEditCalendar> ... </TempEditCalendar>` dengan
     `<GuestDashboard events={GUEST_EVENTS} onLogin={() => setGuestMode(false)} dark=... onToggleTheme=... />`
     (blok tersebut sudah memuat contoh versi tanpa fitur sementara dalam komentar).
3. Selesai. `GuestDashboard` tidak mengimpor apa pun dari folder ini.

Opsional: bersihkan data lama di browser dengan menjalankan
`localStorage.removeItem('smartcal-temp-calendar-v1'); localStorage.removeItem('smartcal-temp-edit-enabled')`.
