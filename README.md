# MediConnect - Aplikasi Telemedicine dengan WebRTC dan WebSocket

Aplikasi konsultasi video real-time antara dokter dan pasien menggunakan teknologi WebRTC untuk komunikasi peer-to-peer dan WebSocket untuk signaling.

## 📋 Deskripsi Proyek

### Latar Belakang Permasalahan

Di era digital saat ini, akses terhadap layanan kesehatan masih menjadi tantangan besar, terutama untuk:

1. **Aksesibilitas Geografis**: Pasien di daerah terpencil kesulitan mengakses fasilitas kesehatan
2. **Efisiensi Waktu**: Konsultasi ringan tidak memerlukan kunjungan fisik yang memakan waktu
3. **Biaya Transportasi**: Biaya perjalanan ke klinik/rumah sakit menjadi beban tambahan
4. **Situasi Darurat**: Kebutuhan konsultasi cepat untuk kondisi mendesak
5. **Pandemi**: Kebutuhan konsultasi jarak jauh untuk mengurangi kontak fisik

### Tujuan Aplikasi

1. Menyediakan platform konsultasi video real-time yang aman dan mudah digunakan
2. Memungkinkan komunikasi audio-video berkualitas tinggi dengan latensi rendah
3. Menyediakan fitur chat tambahan untuk komunikasi tertulis
4. Mengurangi hambatan geografis dalam mengakses layanan kesehatan
5. Meningkatkan efisiensi waktu dan biaya bagi dokter dan pasien

## 🏗️ Arsitektur Sistem

### Komponen Utama

```
┌─────────────────┐                      ┌─────────────────┐
│                 │   WebSocket          │                 │
│   Client 1      │◄────Signaling───────►│   Go Server     │
│   (Browser)     │                      │   (WebSocket)   │
└─────────────────┘                      └─────────────────┘
        │                                         ▲
        │                                         │
        │         WebRTC P2P Connection          │
        │         (Audio/Video/Data)             │
        │                                         │
        │                                         │
        │                                ┌────────┴────────┐
        └────────────────────────────────┤                 │
                                         │   Client 2      │
                                         │   (Browser)     │
                                         └─────────────────┘
```

### 1. **Client (Browser)**
- Interface pengguna berbasis web
- Menggunakan WebRTC API untuk media streaming
- Menggunakan WebSocket untuk komunikasi dengan server
- Menangani rendering video lokal dan remote

### 2. **Server (Golang)**
- Signaling server menggunakan WebSocket
- Mengelola room konsultasi
- Meneruskan SDP offers/answers antar peers
- Meneruskan ICE candidates untuk NAT traversal
- Mengelola status koneksi pengguna

### 3. **WebRTC Peer Connection**
- Koneksi langsung (P2P) antar browser
- Streaming audio dan video
- Data channel untuk chat
- Menggunakan STUN server untuk NAT traversal

## 🔌 Peran WebSocket dalam Sistem

WebSocket berperan sebagai **Signaling Channel** dengan fungsi:

### 1. **Session Negotiation**
- Pertukaran SDP (Session Description Protocol) offers dan answers
- Negosiasi codec audio/video yang didukung
- Pertukaran informasi media capabilities

### 2. **ICE Candidate Exchange**
- Pertukaran informasi konektivitas jaringan
- Memungkinkan NAT traversal
- Mencari jalur terbaik untuk koneksi P2P

### 3. **Room Management**
- Membuat dan mengelola ruang konsultasi
- Tracking pengguna yang bergabung/keluar
- Memberikan notifikasi status pengguna

### 4. **Real-time Messaging**
- Mengirim pesan chat
- Notifikasi status koneksi
- Event broadcasting ke semua peserta room

### Alur Komunikasi WebSocket:

```
Client                  Server                  Client
  │                       │                       │
  ├──► join room          │                       │
  │                       ├──► user-list ────────►│
  │                       │                       │
  ├──► offer SDP          │                       │
  │                       ├──► offer SDP ────────►│
  │                       │                       │
  │                       │◄──── answer SDP ──────┤
  │◄──── answer SDP ──────┤                       │
  │                       │                       │
  ├──► ICE candidate      │                       │
  │                       ├──► ICE candidate ────►│
```

## 🎥 Peran WebRTC dalam Sistem

WebRTC (Web Real-Time Communication) menyediakan komunikasi **peer-to-peer** dengan fungsi:

### 1. **Media Streaming**
- **Audio**: Streaming suara dokter dan pasien secara real-time
- **Video**: Streaming video kamera dengan kualitas adaptif
- **Codec Negotiation**: Otomatis memilih codec terbaik (VP8, H.264, Opus)

### 2. **NAT Traversal**
- **STUN Server**: Menemukan alamat IP publik
- **ICE Protocol**: Mencari jalur koneksi terbaik
- **Kandidat Gathering**: Mengumpulkan kemungkinan jalur koneksi

### 3. **Security**
- **DTLS**: Enkripsi untuk data channel
- **SRTP**: Enkripsi untuk media stream
- **End-to-End Encryption**: Data terenkripsi dari browser ke browser

### 4. **Quality Adaptation**
- Bandwidth estimation
- Adaptive bitrate streaming
- Packet loss recovery
- Jitter buffer untuk audio

### Alur Koneksi WebRTC:

```
1. getUserMedia() → Akses kamera/mikrofon
2. createPeerConnection() → Buat koneksi RTCPeerConnection
3. addTrack() → Tambahkan stream lokal
4. createOffer() → Buat SDP offer
5. setLocalDescription() → Set deskripsi lokal
6. [Send offer via WebSocket]
7. [Receive answer via WebSocket]
8. setRemoteDescription() → Set deskripsi remote
9. onicecandidate → Kumpulkan ICE candidates
10. ontrack → Terima stream remote
```

## 🛠️ Teknologi yang Digunakan

### Backend
- **Go 1.21+**: Bahasa pemrograman untuk server
- **Gorilla WebSocket**: Library WebSocket untuk Go
- **net/http**: HTTP server bawaan Go

### Frontend
- **HTML5**: Struktur halaman
- **CSS3**: Styling dan responsive design
- **JavaScript (Vanilla)**: Logika aplikasi
- **WebRTC API**: Media streaming
- **WebSocket API**: Real-time communication

### Infrastructure
- **STUN Server**: Google STUN servers untuk NAT traversal

## 📦 Instalasi dan Menjalankan

### Prerequisites
- Go 1.21 atau lebih baru
- Browser modern (Chrome, Firefox, Safari, Edge)

### Langkah Instalasi

1. **Clone atau extract project**
```bash
cd telemedicine-app
```

2. **Install dependencies Go**
```bash
cd server
go mod download
```

3. **Jalankan server**
```bash
go run main.go
```

Server akan berjalan di `http://localhost:8080`

4. **Buka aplikasi di browser**
- Buka `http://localhost:8080` di browser
- Untuk testing, buka 2 tab/window browser berbeda

### Testing Aplikasi

1. **Tab/Window 1 (Sebagai Dokter)**
   - Nama: "Dr. Budi"
   - ID Ruang: "room123"
   - Pilih: "Dokter / Tenaga Kesehatan"
   - Klik "Mulai Konsultasi"

2. **Tab/Window 2 (Sebagai Pasien)**
   - Nama: "Ahmad"
   - ID Ruang: "room123" (sama dengan dokter)
   - Pilih: "Pasien"
   - Klik "Mulai Konsultasi"

3. **Testing Fitur**
   - Video call harus terhubung otomatis
   - Test toggle audio/video
   - Test fitur chat
   - Test end call

## 📱 Fitur Aplikasi

### ✅ Fitur yang Tersedia

1. **Video Call Real-time**
   - Kualitas video HD
   - Audio jernih
   - Latensi rendah

2. **Kontrol Media**
   - Toggle mikrofon on/off
   - Toggle kamera on/off
   - Mute/unmute

3. **Chat Text**
   - Pesan real-time
   - Notifikasi pesan baru
   - Riwayat chat dalam sesi

4. **Room Management**
   - Buat ruang dengan ID custom
   - Multiple users per room
   - Status koneksi real-time

5. **User Interface**
   - Responsive design
   - User-friendly
   - Indikator status koneksi
   - Informasi peserta

## 🔒 Keamanan

1. **WebRTC Security**
   - SRTP encryption untuk media
   - DTLS encryption untuk data
   - End-to-end encryption

2. **WebSocket**
   - Dapat di-upgrade ke WSS (WebSocket Secure)
   - Connection validation

3. **Best Practices**
   - No media storage di server
   - Direct P2P connection
   - Session-based rooms

## 🚀 Pengembangan Lebih Lanjut

### Fitur Potensial

1. **Autentikasi & Autorisasi**
   - Login dokter dan pasien
   - Verifikasi kredensial dokter
   - Role-based access control

2. **Recording**
   - Rekam sesi konsultasi
   - Simpan untuk keperluan medis
   - Transcription otomatis

3. **Scheduling**
   - Sistem appointment
   - Calendar integration
   - Reminder notifikasi

4. **Medical Records**
   - Upload dokumen medis
   - Electronic Medical Records (EMR)
   - Prescription digital

5. **Payment Integration**
   - Pembayaran online
   - Billing system
   - Insurance integration

6. **Analytics**
   - Call quality metrics
   - Usage statistics
   - Performance monitoring

## 📊 Monitoring dan Debugging

### Browser Console
Aplikasi mencetak log penting di console:
- Status WebSocket connection
- WebRTC connection state
- ICE candidates
- Media stream events

### Chrome WebRTC Internals
Akses `chrome://webrtc-internals` untuk:
- Detail koneksi WebRTC
- Statistik bandwidth
- Codec information
- ICE candidate pairs

## 🐛 Troubleshooting

### Kamera/Mikrofon Tidak Terdeteksi
- Pastikan browser memiliki izin akses media
- Check setting privasi browser
- Test di `chrome://settings/content/camera`

### Video Tidak Muncul
- Check koneksi internet
- Pastikan kedua client di room yang sama
- Lihat console untuk error messages

### Koneksi Gagal
- Firewall mungkin memblokir WebRTC
- Coba gunakan TURN server untuk relay
- Check network restrictions

## 📝 Lisensi

Project ini dibuat untuk keperluan edukasi dan pembelajaran.

## 👨‍💻 Kontributor

Dikembangkan sebagai contoh implementasi WebRTC dan WebSocket untuk aplikasi telemedicine.

---

**Note**: Aplikasi ini adalah proof-of-concept untuk pembelajaran. Untuk production, perlu penambahan fitur keamanan, skalabilitas, dan compliance dengan regulasi kesehatan (HIPAA, dll).
#   r e a l t i m e _ v i d e o _ k o n s u l t a s i  
 #   r e a l t i m e _ v i d e o _ k o n s u l t a s i  
 