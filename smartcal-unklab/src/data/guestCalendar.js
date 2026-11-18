/* =====================================================================
   Data Dashboard Tamu (tanpa login)
   ---------------------------------------------------------------------
   Sumber: Kalender Akademik Universitas Klabat
   - Kalender Akademik 2026 (publish, Internal Updated 8 September 2026)
   - Kalender Akademik 2027 (P5 11/26)
   Resmi: https://www.unklab.ac.id/kalender-akademik/

   Format tanggal 'YYYY-MM-DD'. `start: null` = jadwal belum diumumkan.
   Kolom opsional untuk penerimaan mahasiswa baru (PMB):
     intake : periode penerimaan, mis. 'Semester I 2027/2028'
     step   : 'pendaftaran' | 'tes' | 'orientasi' | 'kuliah'
     wave   : nomor gelombang tes masuk (khusus step 'tes')

   Baris administrasi internal (perubahan nilai IC→F, posting grade ke SIU,
   perhitungan GPA, SPT senior, dsb.) sengaja tidak ditampilkan.
   Catatan: pada PDF 2027, UAS 29 Nov – 3 Des tertulis "Semester I
   2026/2027"; di sini ditulis 2027/2028 sesuai judul semesternya.

   Array GUEST_EVENTS sengaja berupa literal murni, sehingga hasil
   "Salin JSON" dari fitur sementara Edit Kalender bisa langsung ditempel
   menggantikan isinya.
   ===================================================================== */

export const GUEST_SOURCES = [
  'Kalender Akademik 2026 (Internal Updated 8 September 2026)',
  'Kalender Akademik 2027 (P5 11/26)',
]

export const OFFICIAL_LINKS = [
  {
    label: 'Kalender Akademik Resmi',
    desc: 'Sumber utama seluruh tanggal di dashboard ini.',
    href: 'https://www.unklab.ac.id/kalender-akademik/',
  },
  {
    label: 'Daftar Ujian Masuk',
    desc: 'Formulir pendaftaran tes masuk calon mahasiswa.',
    href: 'https://www.unklab.ac.id/daftar-ujian-masuk/',
  },
  {
    label: 'Prosedur Pendaftaran S1',
    desc: 'Alur dan persyaratan pendaftaran program sarjana.',
    href: 'https://www.unklab.ac.id/prosedur-s1/',
  },
  {
    label: 'Biaya Perkuliahan',
    desc: 'Rincian biaya studi di Universitas Klabat.',
    href: 'https://www.unklab.ac.id/biaya-perkuliahan/',
  },
  {
    label: 'Pengumuman Resmi',
    desc: 'Hasil tes masuk dan informasi terbaru kampus.',
    href: 'https://www.unklab.ac.id/category/pengumuman/',
  },
]

/* Kategori. Kelas Tailwind ditulis utuh agar ikut ter-generate. */
export const GUEST_CATEGORIES = {
  pendaftaran: {
    label: 'Pendaftaran',
    dot: 'bg-emerald-500',
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  tes: {
    label: 'Tes Masuk',
    dot: 'bg-rose-500',
    badge:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300',
  },
  akademik: {
    label: 'Akademik',
    dot: 'bg-indigo-500',
    badge:
      'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300',
  },
  ujian: {
    label: 'Ujian',
    dot: 'bg-orange-500',
    badge:
      'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/60 dark:text-orange-300',
  },
  libur: {
    label: 'Libur',
    dot: 'bg-teal-500',
    badge:
      'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/60 dark:text-teal-300',
  },
  cuti: {
    label: 'Cuti Bersama / Kelas Daring',
    dot: 'bg-sky-500',
    badge: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300',
  },
  kegiatan: {
    label: 'Kegiatan Kampus',
    dot: 'bg-amber-500',
    badge:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300',
  },
}

export const GUEST_CATEGORY_KEYS = Object.keys(GUEST_CATEGORIES)

/* Tahap penerimaan mahasiswa baru dalam satu periode (intake). */
export const PMB_STEPS = [
  { key: 'pendaftaran', label: 'Masa Pendaftaran', short: 'Pendaftaran Kuliah' },
  { key: 'tes', label: 'Tes Masuk', short: 'Tes Masuk' },
  { key: 'orientasi', label: 'Orientasi PKKMB', short: 'Orientasi PKKMB' },
  { key: 'kuliah', label: 'Perkuliahan Dimulai', short: 'Masa Perkuliahan' },
]

export const GUEST_EVENTS = [
  {"id":"k26-001","category":"libur","title":"Libur Tahun Baru 2026","start":"2026-01-01","end":"2026-01-01","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-002","category":"pendaftaran","title":"Pendaftaran Kuliah Semester II 2025/2026","intake":"Semester II 2025/2026","step":"pendaftaran","start":"2026-01-05","end":"2026-01-08","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-003","category":"tes","title":"Tes Masuk Mahasiswa Baru Program Diploma, Sarjana dan Pascasarjana (Semester II, 2025/2026)","intake":"Semester II 2025/2026","step":"tes","start":"2026-01-06","end":"2026-01-06","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-004","category":"akademik","title":"Masa Perkuliahan Semester II 2025/2026","intake":"Semester II 2025/2026","step":"kuliah","start":"2026-01-09","end":"2026-05-08","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-005","category":"akademik","title":"Add & Drop Matakuliah Mahasiswa yang Sudah Terdaftar, Semester II 2025/2026","start":"2026-01-09","end":"2026-01-15","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-006","category":"akademik","title":"Drop Matakuliah Nilai WP","start":"2026-01-16","end":"2026-04-15","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-007","category":"libur","title":"Libur Isra Mikraj Nabi Muhammad S.A.W","start":"2026-01-16","end":"2026-01-16","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-008","category":"libur","title":"Long Week End (mahasiswa pulang setelah kelas hari Kamis)","start":"2026-01-16","end":"2026-01-18","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-009","category":"kegiatan","title":"Wisuda Senior Summer 2025 & Semester I 2025/2026","start":"2026-01-23","end":"2026-01-25","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-010","category":"kegiatan","title":"Faculty Sabbath","start":"2026-02-07","end":"2026-02-07","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-011","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 1)","intake":"Semester I 2026/2027","step":"tes","wave":1,"start":"2026-02-10","end":"2026-02-10","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-012","category":"cuti","title":"Kelas Daring / Belajar Terbimbing, Penugasan Terstruktur, Mandiri (Cuti Bersama Tahun Baru Imlek)","start":"2026-02-16","end":"2026-02-16","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-013","category":"libur","title":"Libur Tahun Baru Imlek 2577 Kongzili","start":"2026-02-17","end":"2026-02-17","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-014","category":"kegiatan","title":"Faculty Week, Health Week & English Week","start":"2026-02-23","end":"2026-02-27","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-015","category":"kegiatan","title":"Pekan Doa (Week of Prayer) Unklab","start":"2026-03-02","end":"2026-03-07","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-016","category":"ujian","title":"Ujian Tengah Semester II 2025/2026","start":"2026-03-09","end":"2026-03-13","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-017","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 2)","intake":"Semester I 2026/2027","step":"tes","wave":2,"start":"2026-03-10","end":"2026-03-10","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-018","category":"cuti","title":"Kelas Daring / Belajar Terbimbing, Penugasan Terstruktur, Mandiri (Cuti Bersama Hari Suci Nyepi)","start":"2026-03-18","end":"2026-03-18","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-019","category":"libur","title":"Libur Hari Suci Nyepi (Tahun Baru Saka 1948)","start":"2026-03-19","end":"2026-03-19","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-020","category":"cuti","title":"Kelas Daring / Belajar Terbimbing, Penugasan Terstruktur, Mandiri (Cuti Bersama Idul Fitri 1447 H: 20, 23 & 24 Maret)","start":"2026-03-20","end":"2026-03-24","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-021","category":"libur","title":"Libur Hari Raya Idul Fitri 1447 Hijriah","start":"2026-03-21","end":"2026-03-22","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-022","category":"kegiatan","title":"Kegiatan SA Unklab","start":"2026-04-02","end":"2026-04-02","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-023","category":"libur","title":"Libur Wafat Yesus Kristus","start":"2026-04-03","end":"2026-04-03","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-024","category":"libur","title":"Long Week End","start":"2026-04-03","end":"2026-04-05","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-025","category":"libur","title":"Libur Kebangkitan Yesus Kristus (Hari Paskah)","start":"2026-04-05","end":"2026-04-05","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-026","category":"kegiatan","title":"Faculty Sabbath","start":"2026-04-11","end":"2026-04-11","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-027","category":"akademik","title":"Drop Mata Kuliah Nilai WF","start":"2026-04-16","end":"2026-05-01","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-028","category":"kegiatan","title":"Hari Terakhir Kegiatan Ekstrakurikuler","start":"2026-04-17","end":"2026-04-17","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-029","category":"akademik","title":"Evaluasi Dosen oleh Mahasiswa di SIU","start":"2026-04-20","end":"2026-05-01","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-030","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 3)","intake":"Semester I 2026/2027","step":"tes","wave":3,"start":"2026-04-21","end":"2026-04-21","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-031","category":"akademik","title":"Hari Terakhir Ujian Skripsi/Thesis","start":"2026-04-30","end":"2026-04-30","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-032","category":"libur","title":"Libur Hari Buruh Internasional","start":"2026-05-01","end":"2026-05-01","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-033","category":"ujian","title":"Ujian Akhir Semester II 2025/2026","start":"2026-05-04","end":"2026-05-08","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-034","category":"libur","title":"Libur Kenaikan Yesus Kristus","start":"2026-05-14","end":"2026-05-14","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-035","category":"cuti","title":"Cuti Bersama Kenaikan Yesus Kristus","start":"2026-05-15","end":"2026-05-15","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-036","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 4)","intake":"Semester I 2026/2027","step":"tes","wave":4,"start":"2026-05-19","end":"2026-05-19","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-037","category":"akademik","title":"Rapat Yudisium Kelulusan Semester II 2025/2026","start":"2026-05-20","end":"2026-05-20","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-038","category":"pendaftaran","title":"Pendaftaran Semester Padat 2026 (25, 26 & 29 Mei)","intake":"Semester Padat 2026","step":"pendaftaran","start":"2026-05-25","end":"2026-05-29","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-039","category":"libur","title":"Libur Idul Adha 1447 Hijriah","start":"2026-05-27","end":"2026-05-27","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-040","category":"cuti","title":"Cuti Bersama Idul Adha 1447 Hijriah","start":"2026-05-28","end":"2026-05-28","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-041","category":"libur","title":"Libur Hari Raya Waisak 2570 BE","start":"2026-05-31","end":"2026-05-31","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-042","category":"libur","title":"Libur Hari Lahir Pancasila","start":"2026-06-01","end":"2026-06-01","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-043","category":"akademik","title":"Masa Perkuliahan Semester Padat 2026","intake":"Semester Padat 2026","step":"kuliah","start":"2026-06-02","end":"2026-07-03","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-044","category":"akademik","title":"Add & Drop Mata Kuliah Mahasiswa yang Sudah Mendaftar Semester Padat 2026","start":"2026-06-02","end":"2026-06-03","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-045","category":"akademik","title":"Drop Mata Kuliah Nilai WP (2 SKS)","start":"2026-06-04","end":"2026-06-25","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-046","category":"akademik","title":"Drop Mata Kuliah Nilai WP (3 SKS)","start":"2026-06-04","end":"2026-06-26","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-047","category":"libur","title":"Libur 1 Muharam Tahun Baru Islam 1448 Hijriah","start":"2026-06-16","end":"2026-06-16","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-048","category":"ujian","title":"Ujian Tengah Semester Padat 2026","start":"2026-06-17","end":"2026-06-18","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-049","category":"kegiatan","title":"Wisuda Semester II 2025/2026","start":"2026-06-19","end":"2026-06-21","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-050","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 5)","intake":"Semester I 2026/2027","step":"tes","wave":5,"start":"2026-06-23","end":"2026-06-23","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-051","category":"akademik","title":"Drop Mata Kuliah Nilai WF (2 SKS)","start":"2026-06-25","end":"2026-06-30","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-052","category":"akademik","title":"Drop Mata Kuliah Nilai WF (3 SKS)","start":"2026-06-26","end":"2026-07-02","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-053","category":"ujian","title":"Ujian Akhir Semester Padat 2026 (2 SKS)","start":"2026-07-01","end":"2026-07-01","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-054","category":"ujian","title":"Ujian Akhir Semester Padat 2026 (3 SKS)","start":"2026-07-03","end":"2026-07-03","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-055","category":"kegiatan","title":"Seminar dan Retreat Dosen/Staff Tahun 2026","start":"2026-07-08","end":"2026-07-09","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-056","category":"tes","title":"Ujian Masuk Mahasiswa Baru Profesi Ners","start":"2026-07-20","end":"2026-07-21","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-057","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 6)","intake":"Semester I 2026/2027","step":"tes","wave":6,"start":"2026-07-21","end":"2026-07-21","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-058","category":"pendaftaran","title":"Pendaftaran Kuliah Semester I 2026/2027","intake":"Semester I 2026/2027","step":"pendaftaran","start":"2026-08-03","end":"2026-08-07","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-059","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 7)","intake":"Semester I 2026/2027","step":"tes","wave":7,"start":"2026-08-04","end":"2026-08-04","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-060","category":"akademik","title":"Rapat Yudisium Kelulusan Semester Padat 2026","start":"2026-08-05","end":"2026-08-05","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-061","category":"kegiatan","title":"Orientasi PKKMB Mahasiswa Baru","intake":"Semester I 2026/2027","step":"orientasi","start":"2026-08-06","end":"2026-08-07","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-062","category":"akademik","title":"Masa Perkuliahan Semester I 2026/2027","intake":"Semester I 2026/2027","step":"kuliah","start":"2026-08-10","end":"2026-11-27","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-063","category":"akademik","title":"Add & Drop Matakuliah Mahasiswa yang Sudah Terdaftar, Semester I 2026/2027","start":"2026-08-10","end":"2026-08-14","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-064","category":"akademik","title":"Drop Matakuliah Nilai WP","start":"2026-08-15","end":"2026-11-06","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-065","category":"libur","title":"Long Weekend (mahasiswa pulang setelah kelas hari Jumat)","start":"2026-08-15","end":"2026-08-17","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-066","category":"libur","title":"Libur Hari Kemerdekaan Republik Indonesia","start":"2026-08-17","end":"2026-08-17","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-067","category":"libur","title":"Libur Maulid Nabi Muhammad S.A.W","start":"2026-08-25","end":"2026-08-25","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-068","category":"kegiatan","title":"Faculty Sabbath","start":"2026-09-05","end":"2026-09-05","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-069","category":"kegiatan","title":"Faculty Week, English Week and Health Week","start":"2026-09-14","end":"2026-09-19","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-070","category":"ujian","title":"Ujian Tengah Semester I 2026/2027","start":"2026-09-28","end":"2026-10-02","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-071","category":"kegiatan","title":"Pekan Doa (Week of Prayer) Unklab","start":"2026-10-19","end":"2026-10-24","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-072","category":"akademik","title":"Evaluasi Dosen oleh Mahasiswa di SIU","start":"2026-11-02","end":"2026-11-23","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-073","category":"kegiatan","title":"Faculty Day","start":"2026-11-05","end":"2026-11-05","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-074","category":"kegiatan","title":"Hari Terakhir Kegiatan Ekstrakurikuler","start":"2026-11-06","end":"2026-11-06","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-075","category":"akademik","title":"Drop Mata Kuliah Nilai WF","start":"2026-11-07","end":"2026-11-23","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-076","category":"akademik","title":"Hari Terakhir Ujian Skripsi/Thesis","start":"2026-11-20","end":"2026-11-20","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-077","category":"ujian","title":"Ujian Akhir Semester I 2026/2027","start":"2026-11-23","end":"2026-11-27","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-078","category":"kegiatan","title":"Pelatihan/Workshop Dosen/Staff","start":"2026-12-02","end":"2026-12-03","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-079","category":"akademik","title":"Rapat Yudisium Kelulusan Semester I 2026/2027","start":"2026-12-09","end":"2026-12-09","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-080","category":"tes","title":"Test Masuk Profesi Ners","start":"2026-12-21","end":"2026-12-21","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-081","category":"cuti","title":"Cuti Bersama Kelahiran Yesus Kristus","start":"2026-12-24","end":"2026-12-24","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k26-082","category":"libur","title":"Libur Kelahiran Yesus Kristus","start":"2026-12-25","end":"2026-12-25","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-083","category":"libur","title":"Libur Tahun Baru 2027","start":"2027-01-01","end":"2027-01-01","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-084","category":"pendaftaran","title":"Pendaftaran Kuliah Semester II 2026/2027","intake":"Semester II 2026/2027","step":"pendaftaran","start":"2027-01-04","end":"2027-01-08","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-085","category":"libur","title":"Libur Isra Mikraj Nabi Muhammad S.A.W 1448 Hijriah","start":"2027-01-05","end":"2027-01-05","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-086","category":"tes","title":"Tes Masuk Mahasiswa Baru Program Diploma, Sarjana dan Pascasarjana (Semester II, 2026/2027)","intake":"Semester II 2026/2027","step":"tes","start":"2027-01-06","end":"2027-01-06","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-087","category":"akademik","title":"Masa Perkuliahan Semester II 2026/2027","intake":"Semester II 2026/2027","step":"kuliah","start":"2027-01-11","end":"2027-05-10","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-088","category":"akademik","title":"Add & Drop Matakuliah Mahasiswa yang Sudah Terdaftar, Semester II 2026/2027","start":"2027-01-11","end":"2027-01-15","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-089","category":"akademik","title":"Drop Matakuliah Nilai WP","start":"2027-01-16","end":"2027-04-15","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-090","category":"kegiatan","title":"Wisuda Senior Summer 2026 & Semester I 2026/2027","start":"2027-01-22","end":"2027-01-24","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-091","category":"cuti","title":"Kelas Daring / Belajar Terbimbing, Penugasan Terstruktur, Mandiri (Cuti Bersama Tahun Baru Imlek)","start":"2027-02-05","end":"2027-02-05","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-092","category":"libur","title":"Libur Tahun Baru Imlek 2578 Kongzili","start":"2027-02-06","end":"2027-02-06","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-093","category":"kegiatan","title":"Faculty Sabbath","start":"2027-02-13","end":"2027-02-13","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-094","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 1)","intake":"Semester I 2027/2028","step":"tes","wave":1,"start":"2027-02-16","end":"2027-02-16","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-095","category":"kegiatan","title":"Faculty Week, Health Week & English Week","start":"2027-02-22","end":"2027-02-27","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-096","category":"kegiatan","title":"Kegiatan SA Unklab","start":"2027-03-04","end":"2027-03-04","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-097","category":"libur","title":"Libur Hari Suci Nyepi (Tahun Baru Saka 1949)","start":"2027-03-08","end":"2027-03-08","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-098","category":"cuti","title":"Kelas Daring / Belajar Terbimbing, Penugasan Terstruktur, Mandiri (Cuti Bersama Idulfitri 1448 H: 9, 12 & 15 Maret)","start":"2027-03-09","end":"2027-03-15","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-099","category":"libur","title":"Libur Hari Raya Idul Fitri 1448 Hijriah","start":"2027-03-10","end":"2027-03-11","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-100","category":"ujian","title":"Ujian Tengah Semester II 2026/2027","start":"2027-03-16","end":"2027-03-22","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-101","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 2)","intake":"Semester I 2027/2028","step":"tes","wave":2,"start":"2027-03-23","end":"2027-03-23","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-102","category":"cuti","title":"Kelas Daring / Belajar Terbimbing, Penugasan Terstruktur, Mandiri (Cuti Bersama Wafat Yesus Kristus)","start":"2027-03-25","end":"2027-03-25","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-103","category":"libur","title":"Libur Wafat Yesus Kristus","start":"2027-03-26","end":"2027-03-26","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-104","category":"libur","title":"Libur Kebangkitan Yesus Kristus (Hari Paskah)","start":"2027-03-28","end":"2027-03-28","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-105","category":"kegiatan","title":"Pekan Doa (Week of Prayer) Unklab","start":"2027-04-05","end":"2027-04-10","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-106","category":"akademik","title":"Drop Mata Kuliah Nilai WF","start":"2027-04-16","end":"2027-04-30","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-107","category":"kegiatan","title":"Hari Terakhir Kegiatan Ekstrakurikuler","start":"2027-04-16","end":"2027-04-16","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-108","category":"akademik","title":"Evaluasi Dosen oleh Mahasiswa di SIU","start":"2027-04-19","end":"2027-04-30","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-109","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 3)","intake":"Semester I 2027/2028","step":"tes","wave":3,"start":"2027-04-20","end":"2027-04-20","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-110","category":"akademik","title":"Hari Terakhir Ujian Skripsi/Thesis","start":"2027-04-30","end":"2027-04-30","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-111","category":"libur","title":"Libur Hari Buruh Internasional","start":"2027-05-01","end":"2027-05-01","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-112","category":"ujian","title":"Ujian Akhir Semester II 2026/2027","start":"2027-05-03","end":"2027-05-10","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-113","category":"libur","title":"Libur Kenaikan Yesus Kristus","start":"2027-05-06","end":"2027-05-06","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-114","category":"akademik","title":"Evaluasi Kurikulum dan Proses Pembelajaran","start":"2027-05-11","end":"2027-05-12","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-115","category":"akademik","title":"Banding Nilai","start":"2027-05-14","end":"2027-06-14","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-116","category":"libur","title":"Libur Idul Adha 1448 Hijriah","start":"2027-05-17","end":"2027-05-17","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-117","category":"cuti","title":"Cuti Bersama Idul Adha 1448 Hijriah","start":"2027-05-18","end":"2027-05-18","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-118","category":"cuti","title":"Cuti Bersama Hari Raya Waisak 2571 BE","start":"2027-05-19","end":"2027-05-19","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-119","category":"libur","title":"Libur Hari Raya Waisak 2571 BE","start":"2027-05-20","end":"2027-05-20","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-120","category":"akademik","title":"Rapat Yudisium Kelulusan Semester II 2026/2027","start":"2027-05-21","end":"2027-05-21","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-121","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 4)","intake":"Semester I 2027/2028","step":"tes","wave":4,"start":"2027-05-25","end":"2027-05-25","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-122","category":"pendaftaran","title":"Pendaftaran Semester Padat 2027","intake":"Semester Padat 2027","step":"pendaftaran","start":"2027-05-25","end":"2027-05-27","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-123","category":"akademik","title":"Masa Perkuliahan Semester Padat 2027","intake":"Semester Padat 2027","step":"kuliah","start":"2027-05-28","end":"2027-06-30","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-124","category":"akademik","title":"Add & Drop Mata Kuliah Mahasiswa yang Sudah Mendaftar Semester Padat 2027","start":"2027-05-28","end":"2027-05-31","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-125","category":"libur","title":"Libur Hari Lahir Pancasila","start":"2027-06-01","end":"2027-06-01","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-126","category":"akademik","title":"Drop Mata Kuliah Nilai WP (2 SKS)","start":"2027-06-02","end":"2027-06-22","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-127","category":"akademik","title":"Drop Mata Kuliah Nilai WP (3 SKS)","start":"2027-06-02","end":"2027-06-23","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-128","category":"libur","title":"Libur 1 Muharam Tahun Baru Islam 1449 Hijriah","start":"2027-06-06","end":"2027-06-06","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-129","category":"ujian","title":"Ujian Tengah Semester Padat 2027","start":"2027-06-15","end":"2027-06-16","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-130","category":"kegiatan","title":"Wisuda Semester II 2026/2027","start":"2027-06-18","end":"2027-06-20","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-131","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 5)","intake":"Semester I 2027/2028","step":"tes","wave":5,"start":"2027-06-22","end":"2027-06-22","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-132","category":"akademik","title":"Drop Mata Kuliah Nilai WF (2 SKS)","start":"2027-06-23","end":"2027-06-27","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-133","category":"akademik","title":"Drop Mata Kuliah Nilai WF (3 SKS)","start":"2027-06-24","end":"2027-06-29","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-134","category":"ujian","title":"Ujian Akhir Semester Padat 2027 (2 SKS)","start":"2027-06-28","end":"2027-06-28","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-135","category":"ujian","title":"Ujian Akhir Semester Padat 2027 (3 SKS)","start":"2027-06-30","end":"2027-06-30","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-136","category":"kegiatan","title":"Seminar dan Retreat Dosen/Staff Tahun 2027","start":"2027-07-06","end":"2027-07-07","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-137","category":"akademik","title":"Evaluasi Kurikulum dan Proses Pembelajaran","start":"2027-07-06","end":"2027-07-07","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-138","category":"akademik","title":"Banding Nilai","start":"2027-07-06","end":"2027-08-06","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-139","category":"tes","title":"Ujian Masuk Mahasiswa Baru Profesi Ners","start":"2027-07-19","end":"2027-07-20","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-140","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 6)","intake":"Semester I 2027/2028","step":"tes","wave":6,"start":"2027-07-20","end":"2027-07-20","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-141","category":"pendaftaran","title":"Pendaftaran Kuliah Semester I 2027/2028","intake":"Semester I 2027/2028","step":"pendaftaran","start":"2027-08-02","end":"2027-08-06","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-142","category":"tes","title":"Tes Masuk Mahasiswa Baru (Gelombang 7)","intake":"Semester I 2027/2028","step":"tes","wave":7,"start":"2027-08-03","end":"2027-08-03","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-143","category":"akademik","title":"Rapat Yudisium Kelulusan Semester Padat 2027","start":"2027-08-04","end":"2027-08-04","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-144","category":"kegiatan","title":"Orientasi PKKMB Mahasiswa Baru","intake":"Semester I 2027/2028","step":"orientasi","start":"2027-08-09","end":"2027-08-10","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-145","category":"akademik","title":"Masa Perkuliahan Semester I 2027/2028","intake":"Semester I 2027/2028","step":"kuliah","start":"2027-08-11","end":"2027-12-03","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-146","category":"akademik","title":"Add & Drop Matakuliah Mahasiswa yang Sudah Terdaftar, Semester I 2027/2028","start":"2027-08-11","end":"2027-08-16","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-147","category":"libur","title":"Libur Maulid Nabi Muhammad S.A.W","start":"2027-08-15","end":"2027-08-15","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-148","category":"akademik","title":"Drop Matakuliah Nilai WP","start":"2027-08-17","end":"2027-11-11","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-149","category":"libur","title":"Libur Hari Kemerdekaan Republik Indonesia","start":"2027-08-17","end":"2027-08-17","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-150","category":"kegiatan","title":"Faculty Week, English Week and Health Week","start":"2027-09-13","end":"2027-09-17","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-151","category":"kegiatan","title":"Faculty Sabbath","start":"2027-09-18","end":"2027-09-18","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-152","category":"akademik","title":"Hari Rabu Kelas Hari Selasa","start":"2027-09-29","end":"2027-09-29","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-153","category":"ujian","title":"Ujian Tengah Semester I 2027/2028","start":"2027-10-04","end":"2027-10-08","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-154","category":"kegiatan","title":"Pekan Doa (Week of Prayer) Unklab","start":"2027-10-18","end":"2027-10-23","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-155","category":"kegiatan","title":"Capping Day","start":"2027-10-29","end":"2027-10-29","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-156","category":"kegiatan","title":"Faculty Day","start":"2027-11-04","end":"2027-11-04","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-157","category":"akademik","title":"Evaluasi Dosen oleh Mahasiswa di SIU","start":"2027-11-08","end":"2027-11-25","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-158","category":"kegiatan","title":"Hari Terakhir Kegiatan Ekstrakurikuler","start":"2027-11-12","end":"2027-11-12","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-159","category":"akademik","title":"Drop Mata Kuliah Nilai WF","start":"2027-11-12","end":"2027-11-25","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-160","category":"akademik","title":"Hari Terakhir Ujian Skripsi/Thesis","start":"2027-11-25","end":"2027-11-25","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-161","category":"ujian","title":"Ujian Akhir Semester I 2027/2028","start":"2027-11-29","end":"2027-12-03","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-162","category":"akademik","title":"Banding Nilai","start":"2027-12-09","end":"2028-01-09","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-163","category":"akademik","title":"Evaluasi Kurikulum dan Proses Pembelajaran","start":"2027-12-09","end":"2027-12-10","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-164","category":"kegiatan","title":"Pelatihan/Workshop Dosen/Staff","start":"2027-12-09","end":"2027-12-10","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-165","category":"akademik","title":"Rapat Yudisium Kelulusan Semester I 2027/2028","start":"2027-12-14","end":"2027-12-14","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-166","category":"tes","title":"Test Masuk Profesi Ners","start":"2027-12-20","end":"2027-12-22","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-167","category":"cuti","title":"Cuti Bersama Kelahiran Yesus Kristus","start":"2027-12-24","end":"2027-12-24","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
  {"id":"k27-168","category":"libur","title":"Libur Kelahiran Yesus Kristus","start":"2027-12-25","end":"2027-12-25","time":"","location":"","note":"","faculty":"Semua Fakultas","verified":true},
]
