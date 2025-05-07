# Sistem Manajemen Layanan Pembersihan Salju 

[![License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](LICENSE.md)
[![Framework](https://img.shields.io/badge/framework-React-blue.svg?style=flat-square)](https://reactjs.org/)
[![Database](https://img.shields.io/badge/database-Firebase-yellow.svg?style=flat-square)](https://firebase.google.com/)
[![Deployment](https://img.shields.io/badge/deployment-Firebase_Hosting-FFA000.svg?style=flat-square)](https://firebase.google.com/docs/hosting)

## Ringkasan Proyek

Sistem Manajemen Layanan Pembersihan Salju adalah solusi software terintegrasi yang dirancang untuk membantu perusahaan jasa pembersihan salju dalam mengelola operasional mereka secara efisien. Aplikasi ini menyediakan manajemen kontrak, penjadwalan pekerjaan berbasis cuaca, pelacakan lokasi tim, verifikasi penyelesaian pekerjaan dengan foto, dan portal untuk pelanggan.

Sistem ini menggunakan pendekatan SaaS (Software as a Service) berbasis cloud dengan frontend responsif yang dapat diakses melalui perangkat mobile maupun desktop.

## Fitur Utama

- **Manajemen Pengguna & Autentikasi**
  - Sistem peran (Admin, Tim Lapangan, Pelanggan)
  - Login/registrasi berbasis email

- **Manajemen Kontrak**
  - Penyimpanan informasi kontrak dan properti
  - Pengaturan ambang batas salju untuk memicu layanan
  - Prioritisasi pelanggan

- **Integrasi Data Cuaca**
  - Pemantauan kondisi cuaca
  - Pembuatan pekerjaan otomatis berdasarkan ambang batas salju

- **Manajemen Pekerjaan**
  - Penjadwalan dan penugasan pekerjaan ke tim
  - Pelacakan status pekerjaan (menunggu, sedang dikerjakan, selesai)
  - Verifikasi penyelesaian dengan unggah foto

- **Pelacakan Lokasi**
  - Pelacakan lokasi tim secara real-time
  - Tampilan peta untuk admin
  - Estimasi waktu kedatangan untuk pelanggan

- **Portal Pelanggan**
  - Pelanggan dapat melihat status layanan
  - Akses ke riwayat layanan
  - Pemberitahuan layanan yang akan datang

## Teknologi yang Digunakan

### Frontend
- **React** - Kerangka UI JavaScript
- **Material UI** - Komponen UI siap pakai
- **React Router** - Navigasi SPA
- **Google Maps API** - Integrasi peta dan pelacakan lokasi

### Backend & Penyimpanan Data
- **Firebase**
  - Authentication - Untuk manajemen pengguna
  - Firestore - Database NoSQL
  - Storage - Penyimpanan foto
  - Hosting - Deployment aplikasi

### APIs Eksternal
- **OpenWeatherMap** - Data cuaca real-time (disimulasikan dalam implementasi ini)

## Memulai

### Prasyarat
- Node.js dan NPM
- Akun Firebase
- Google Maps API Key (untuk fitur peta)

### Instalasi

1. **Clone repositori**
   ```
   git clone https://github.com/username/snow-removal-system.git
   cd snow-removal-system
   ```

2. **Instal dependensi**
   ```
   npm install
   ```

3. **Konfigurasi Firebase**
   - Buat proyek di Firebase Console
   - Aktifkan Authentication, Firestore, dan Storage
   - Salin konfigurasi proyek Anda ke `src/firebase.js`

4. **Konfigurasi Google Maps API**
   - Dapatkan API key dari Google Cloud Console
   - Tambahkan kunci ke file `.env` atau `src/components/MapView.js`

5. **Jalankan aplikasi secara lokal**
   ```
   npm start
   ```

6. **Build untuk produksi**
   ```
   npm run build
   ```

7. **Deploy ke Firebase Hosting**
   ```
   firebase deploy
   ```

## Struktur Proyek

```
snow-removal-system/
├── public/              # Aset publik dan HTML utama
├── src/                 # Source code aplikasi
│   ├── components/      # Komponen React
│   │   ├── Login.js     # Komponen autentikasi
│   │   ├── Dashboard.js # Dasbor berdasarkan peran
│   │   ├── Contracts.js # Manajemen kontrak
│   │   ├── Jobs.js      # Manajemen pekerjaan
│   │   └── ...          # Komponen lainnya
│   ├── services/        # Layanan dan utilitas
│   │   └── weatherService.js # Integrasi API cuaca
│   ├── firebase.js      # Konfigurasi Firebase
│   ├── App.js           # Komponen utama dan routing
│   └── index.js         # Entry point aplikasi
├── package.json         # Dependensi dan skrip npm
└── firebase.json        # Konfigurasi Firebase
```

## Peran Pengguna

### Admin
- Mengelola pengguna, kontrak, dan pekerjaan
- Melihat seluruh operasi di peta
- Memeriksa data cuaca dan membuat pekerjaan berdasarkan kondisi salju
- Melihat laporan dan metrik

### Tim Lapangan
- Melihat pekerjaan yang ditugaskan
- Memperbarui status pekerjaan
- Mengunggah foto verifikasi
- Berbagi lokasi real-time

### Pelanggan
- Melihat jadwal layanan
- Melacak tim yang ditugaskan
- Mengakses riwayat layanan
- Melihat foto verifikasi

## Alur Kerja Khas

1. **Admin** membuat kontrak dengan parameter spesifik, termasuk ambang batas salju
2. Sistem secara otomatis memeriksa data cuaca dan membuat pekerjaan jika ambang batas terpenuhi
3. **Admin** menugaskan pekerjaan ke **Tim Lapangan**
4. **Tim Lapangan** mengupdate status saat menuju lokasi dan menyelesaikan pekerjaan
5. **Tim Lapangan** mengunggah foto sebagai bukti penyelesaian
6. **Pelanggan** dapat melacak status dan melihat foto verifikasi

## Tujuan Pengembangan

Sistem ini dikembangkan dengan tujuan:

1. **Efisiensi Operasional** - Otomatisasi penjadwalan berdasarkan data cuaca
2. **Transparansi** - Memberikan visibilitas real-time kepada pelanggan
3. **Akuntabilitas** - Verifikasi penyelesaian pekerjaan dengan bukti foto
4. **Skalabilitas** - Arsitektur berbasis cloud untuk mengakomodasi pertumbuhan bisnis

## Pengembangan Lebih Lanjut

Beberapa area potensial untuk pengembangan di masa depan:

- Integrasi pembayaran
- Sistem komunikasi internal
- Aplikasi mobile native
- Analitik dan laporan lanjutan
- Integrasi dengan perangkat IoT untuk pemantauan kondisi salju

## Lisensi

Proyek ini dilisensikan di bawah lisensi MIT. Lihat file [LICENSE.md](LICENSE.md) untuk detail lebih lanjut.

## Kontak

Untuk pertanyaan dan dukungan, hubungi:
Hilmaninda | 1192001009
