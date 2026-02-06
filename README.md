
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
- Google Chrome (Recommended)
- Mozilla Firefox

### 2. Memulai Konsultasi

#### Sebagai Dokter/Tenaga Kesehatan:

1. Buka browser dan akses `http://localhost:8080`
2. Isi form:
   - **Nama**: Masukkan nama lengkap Anda (contoh: "Ajen")
   - **ID Ruang**: Buat ID ruang unik (contoh: "konsul-12345")
   - **Saya adalah**: Pilih "Dokter / Tenaga Kesehatan"
3. Klik **"Mulai Konsultasi"**
4. Browser akan meminta izin akses kamera dan mikrofon → Klik **"Allow"**
5. Anda akan masuk ke ruang konsultasi
6. Bagikan **ID Ruang** kepada pasien

#### Sebagai Pasien:

1. Buka browser dan akses `http://localhost:8080`
2. Isi form:
   - **Nama**: Masukkan nama lengkap Anda (contoh: "Ivan")
   - **ID Ruang**: Masukkan ID ruang yang diberikan dokter (contoh: "konsul-12345")
   - **Saya adalah**: Pilih "Pasien"
3. Klik **"Mulai Konsultasi"**
4. Browser akan meminta izin akses kamera dan mikrofon → Klik **"Allow"**
5. Koneksi video akan terhubung otomatis dengan dokter

### 3. Selama Konsultasi

#### Kontrol Media

**Matikan/Nyalakan Mikrofon:**
- Klik ikon mikrofon 
- Ikon berubah merah = mikrofon mati
- Ikon normal = mikrofon aktif

**Matikan/Nyalakan Kamera:**
- Klik ikon kamera 
- Ikon berubah merah = kamera mati
- Ikon normal = kamera aktif

**Menggunakan Chat:**
- Klik ikon chat 
- Panel chat akan muncul di kanan bawah
- Ketik pesan dan klik "Kirim" atau tekan Enter
- Notifikasi muncul jika ada pesan baru saat panel chat tertutup

**Mengakhiri Konsultasi:**
- Klik ikon telepon merah 
- Konfirmasi untuk mengakhiri
- Anda akan kembali ke halaman login
