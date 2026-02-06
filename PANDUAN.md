# Panduan Penggunaan MediConnect

## Cara Menjalankan Aplikasi

### Metode 1: Menggunakan Script (Recommended)

```bash
cd telemedicine-app
./start.sh
```

### Metode 2: Manual

```bash
cd telemedicine-app/server
go mod download
go run main.go
```

Server akan berjalan di `http://localhost:8080`

---

## Cara Menggunakan Aplikasi

### 1. Persiapan

**Hardware yang Dibutuhkan:**
- Komputer/laptop dengan webcam
- Mikrofon (bisa built-in atau eksternal)
- Koneksi internet stabil

**Browser yang Didukung:**
- ✓ Google Chrome (Recommended)
- ✓ Mozilla Firefox
- ✓ Microsoft Edge
- ✓ Safari
- ✗ Internet Explorer (Tidak didukung)

### 2. Memulai Konsultasi

#### Sebagai Dokter/Tenaga Kesehatan:

1. Buka browser dan akses `http://localhost:8080`
2. Isi form:
   - **Nama**: Masukkan nama lengkap Anda (contoh: "Dr. Budi Santoso")
   - **ID Ruang**: Buat ID ruang unik (contoh: "konsul-12345")
   - **Saya adalah**: Pilih "Dokter / Tenaga Kesehatan"
3. Klik **"Mulai Konsultasi"**
4. Browser akan meminta izin akses kamera dan mikrofon → Klik **"Allow"**
5. Anda akan masuk ke ruang konsultasi
6. Bagikan **ID Ruang** kepada pasien

#### Sebagai Pasien:

1. Buka browser dan akses `http://localhost:8080`
2. Isi form:
   - **Nama**: Masukkan nama lengkap Anda (contoh: "Ahmad Ibrahim")
   - **ID Ruang**: Masukkan ID ruang yang diberikan dokter (contoh: "konsul-12345")
   - **Saya adalah**: Pilih "Pasien"
3. Klik **"Mulai Konsultasi"**
4. Browser akan meminta izin akses kamera dan mikrofon → Klik **"Allow"**
5. Koneksi video akan terhubung otomatis dengan dokter

### 3. Selama Konsultasi

#### Kontrol Media

**Matikan/Nyalakan Mikrofon:**
- Klik ikon mikrofon 🎤
- Ikon berubah merah = mikrofon mati
- Ikon normal = mikrofon aktif

**Matikan/Nyalakan Kamera:**
- Klik ikon kamera 📹
- Ikon berubah merah = kamera mati
- Ikon normal = kamera aktif

**Menggunakan Chat:**
- Klik ikon chat 💬
- Panel chat akan muncul di kanan bawah
- Ketik pesan dan klik "Kirim" atau tekan Enter
- Notifikasi muncul jika ada pesan baru saat panel chat tertutup

**Mengakhiri Konsultasi:**
- Klik ikon telepon merah 📞
- Konfirmasi untuk mengakhiri
- Anda akan kembali ke halaman login

### 4. Tips Penggunaan

#### Untuk Hasil Terbaik:

✓ **Pencahayaan:**
- Pastikan wajah Anda terlihat jelas
- Hindari pencahayaan dari belakang (backlight)
- Gunakan pencahayaan dari depan/samping

✓ **Audio:**
- Gunakan headset untuk menghindari echo
- Pilih ruangan yang tenang
- Matikan TV atau sumber suara lain

✓ **Koneksi:**
- Gunakan koneksi WiFi atau kabel LAN
- Minimum 1 Mbps untuk video call stabil
- Tutup aplikasi lain yang menggunakan bandwidth

✓ **Privasi:**
- Pilih lokasi yang private
- Pastikan tidak ada orang lain di belakang
- Gunakan headset untuk privasi percakapan

#### Troubleshooting:

**Video/Audio Tidak Muncul:**
1. Refresh halaman browser
2. Check izin kamera/mikrofon di browser settings
3. Pastikan tidak ada aplikasi lain yang menggunakan kamera
4. Coba restart browser

**Koneksi Terputus:**
1. Check koneksi internet
2. Refresh halaman dan join kembali dengan ID ruang yang sama
3. Pastikan firewall tidak memblokir WebRTC

**Video Lag/Tersendat:**
1. Tutup aplikasi lain yang menggunakan internet
2. Kurangi kualitas video (otomatis adjusted)
3. Matikan video dan gunakan audio only

---

## Testing Aplikasi (Untuk Development)

### Testing Solo (1 Komputer)

1. Buka browser (Chrome)
2. Akses `http://localhost:8080`
3. Join sebagai "Dokter" dengan ID ruang "test123"
4. Buka **tab baru** atau **window baru**
5. Akses `http://localhost:8080` di tab/window baru
6. Join sebagai "Pasien" dengan ID ruang "test123"
7. Video call akan terhubung antara 2 tab

### Testing dengan 2 Komputer (Same Network)

**Komputer 1 (Server):**
1. Jalankan server: `./start.sh`
2. Cek IP address: `ipconfig` (Windows) atau `ifconfig` (Mac/Linux)
   - Contoh: `192.168.1.100`

**Komputer 2 (Client):**
1. Buka browser
2. Akses `http://192.168.1.100:8080`
3. Join dengan ID ruang yang sama

---

## Fitur-Fitur Aplikasi

### 1. Video Conference
- ✓ HD video quality
- ✓ Clear audio dengan echo cancellation
- ✓ Auto camera switching
- ✓ Picture-in-Picture untuk local video

### 2. Audio Controls
- ✓ Mute/unmute mikrofon
- ✓ Visual indicator saat mute
- ✓ Audio level adjustment (otomatis)

### 3. Video Controls
- ✓ Enable/disable kamera
- ✓ Video quality adaptation
- ✓ Freeze frame saat bandwidth rendah

### 4. Chat
- ✓ Real-time text messaging
- ✓ Notification badge untuk pesan baru
- ✓ Chat history selama sesi
- ✓ Timestamp otomatis

### 5. Connection Monitoring
- ✓ Status koneksi real-time
- ✓ Participant counter
- ✓ Auto-reconnection attempt

---

## Keamanan dan Privasi

### Data yang Dikumpulkan:
- ❌ Video/audio TIDAK disimpan di server
- ❌ Chat history TIDAK disimpan
- ✓ Koneksi P2P langsung antar browser
- ✓ Enkripsi end-to-end untuk media

### Best Practices:
1. Gunakan ID ruang yang unik dan susah ditebak
2. Jangan bagikan ID ruang di public
3. Akhiri sesi setelah konsultasi selesai
4. Gunakan koneksi internet yang aman

---

## FAQ (Frequently Asked Questions)

**Q: Apakah percakapan direkam?**
A: Tidak. Semua komunikasi bersifat real-time dan tidak disimpan.

**Q: Berapa banyak orang yang bisa join dalam 1 room?**
A: Saat ini maksimal 2 orang (1 dokter, 1 pasien). Untuk group call, perlu pengembangan lebih lanjut.

**Q: Apakah bisa digunakan di smartphone?**
A: Ya, bisa. Buka browser di smartphone dan akses URL server.

**Q: Apakah perlu install aplikasi?**
A: Tidak. Cukup gunakan browser modern yang mendukung WebRTC.

**Q: Koneksi saya lambat, bagaimana?**
A: WebRTC akan otomatis menyesuaikan kualitas. Anda juga bisa matikan video dan hanya menggunakan audio.

**Q: Bagaimana jika ID ruang sudah digunakan orang lain?**
A: Pilih ID ruang yang unik. Gunakan kombinasi huruf, angka, dan simbol.

**Q: Apakah data saya aman?**
A: Ya. Koneksi menggunakan enkripsi SRTP dan DTLS. Data langsung P2P tanpa melalui server.

---

## Kontak dan Dukungan

Jika mengalami masalah atau memiliki pertanyaan:

1. Check dokumentasi lengkap di `README.md`
2. Check arsitektur sistem di `ARSITEKTUR.md`
3. Lihat console browser untuk error messages (F12)
4. Check server logs di terminal

---

**Selamat menggunakan MediConnect! 🏥💙**
