# Asisten Jadwal AI

Semua kode khusus asisten AI berada di folder ini. Mahasiswa login memakai Firebase Authentication; admin masuk lokal. Agenda, checklist, dan status pengingat disimpan di `localStorage`; aplikasi tidak membaca atau menulis ke Firestore. Untuk menjalankan AI di localhost, browser menghubungi Firebase Functions Emulator, lalu fungsi lokal mengirim prompt ke model gratis melalui OpenRouter. Tidak perlu menjalankan Firestore Emulator.

## Konfigurasi localhost

1. Buat API key OpenRouter, lalu isi `OPENROUTER_API_KEY` di `functions/.env`. Gunakan model `openrouter/free`; jangan tambahkan kredit jika ingin tetap menggunakan model gratis. File `.env` diabaikan Git; jangan menaruh kunci di frontend, chat, atau Git.
2. Aktifkan provider Email/Password di Firebase Authentication Console dan buat akun mahasiswa di sana.
3. Salin `.env.example` di akar proyek menjadi `.env.local`, lalu atur `VITE_ADMIN_EMAILS` dengan email admin yang dipisahkan koma. Admin lokal tidak memakai Firebase Authentication.
4. Pasang Firebase CLI jika belum tersedia:

   ```sh
   npm install -g firebase-tools
   ```

5. Pasang dependency fungsi dari akar proyek:

   ```sh
   npm --prefix ai/functions ci
   ```

6. Jalankan Functions Emulator di terminal pertama:

   ```sh
   npm run emulators
   ```

7. Jalankan aplikasi di terminal kedua:

   ```sh
   npm run dev
   ```

Saat Vite berjalan dalam mode development, aplikasi otomatis memakai emulator di `127.0.0.1:5001`. App Check tidak diperlukan untuk emulator lokal. Fungsi tidak perlu di-deploy; jangan jalankan `firebase deploy` jika ingin fungsi dan kunci tetap lokal.

OpenRouter tetap memerlukan internet dan menerima isi prompt untuk diteruskan ke model penyedia yang dipilih oleh router gratis. Kuota model gratis berlaku dan model dapat berubah. Pengiriman pengingat Gmail yang dipilih pengguna juga memakai EmailJS. Data agenda dan checklist tidak disinkronkan ke perangkat atau browser lain; menghapus data situs browser akan menghapus salinan lokalnya. Admin lokal dikenali dari daftar email di frontend, sehingga bukan autentikasi aman untuk data sensitif. Kalender aplikasi saat ini hanya berisi November 2026.
