# Dokumentasi Arsitektur Sistem MediConnect

## 1. LATAR BELAKANG PERMASALAHAN

### Konteks Masalah
Akses terhadap layanan kesehatan berkualitas masih menjadi tantangan utama di Indonesia, khususnya:

**Permasalahan Utama:**
1. **Kesenjangan Geografis**
   - 40% penduduk Indonesia tinggal di daerah terpencil
   - Rasio dokter per penduduk masih rendah (0.4 per 1000 penduduk)
   - Distribusi tenaga kesehatan tidak merata

2. **Hambatan Waktu dan Biaya**
   - Waktu tunggu di fasilitas kesehatan bisa mencapai 2-4 jam
   - Biaya transportasi ke klinik/rumah sakit 
   - Waktu kerja yang tidak fleksibel untuk konsultasi

3. **Pandemi dan Penyakit Menular**
   - Risiko penularan di fasilitas kesehatan
   - Kebutuhan social distancing
   - Beban sistem kesehatan yang berlebih

4. **Kualitas Konsultasi**
   - Konsultasi singkat karena antrian panjang
   - Kurang dokumentasi hasil konsultasi
   - Follow-up yang sulit dilakukan

### Solusi yang Ditawarkan
Platform telemedicine dengan fitur video conference real-time yang memungkinkan:
- Konsultasi jarak jauh tanpa batasan geografis
- Efisiensi waktu dan biaya
- Dokumentasi konsultasi yang lebih baik
- Akses cepat ke tenaga kesehatan

---

## 2. TUJUAN APLIKASI

### Tujuan Utama
Menyediakan platform konsultasi kesehatan jarak jauh yang:
1. **Accessible**: Mudah diakses dari mana saja
2. **Reliable**: Koneksi stabil dan berkualitas
3. **Secure**: Privasi data pasien terjaga
4. **User-friendly**: Mudah digunakan untuk semua kalangan

### Tujuan Teknis
1. Implementasi komunikasi real-time menggunakan WebRTC
2. Signaling yang efisien menggunakan WebSocket
3. Arsitektur yang scalable dan maintainable
4. User experience yang intuitif

### Target Pengguna
1. **Dokter/Tenaga Kesehatan**
   - Dapat melayani pasien dari mana saja
   - Efisiensi waktu praktik
   - Dokumentasi konsultasi digital

2. **Pasien**
   - Akses mudah ke konsultasi kesehatan
   - Hemat waktu dan biaya
   - Konsultasi dari rumah

---

## 3. ARSITEKTUR SISTEM

### 3.1 Overview Arsitektur

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐                      ┌──────────────┐        │
│  │   Browser    │                      │   Browser    │        │
│  │  (Dokter)    │                      │  (Pasien)    │        │
│  │              │                      │              │        │
│  │  - WebRTC    │                      │  - WebRTC    │        │
│  │  - WebSocket │                      │  - WebSocket │        │
│  │  - UI/UX     │                      │  - UI/UX     │        │
│  └──────┬───────┘                      └──────┬───────┘        │
└─────────┼────────────────────────────────────┼────────────────┘
          │                                    │
          │         WebSocket (Signaling)      │
          │                                    │
          ▼                                    ▼
┌────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                             │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Golang WebSocket Server                 │      │
│  │                                                       │      │
│  │  Components:                                         │      │
│  │  - WebSocket Handler                                 │      │
│  │  - Hub (Room Manager)                                │      │
│  │  - Message Router                                    │      │
│  │  - Client Connection Manager                         │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────┘
          │                                    │
          │      WebRTC P2P (Direct)          │
          └────────────────┬───────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  STUN Server   │
                  │  (Google)      │
                  └────────────────┘
```

### 3.2 Komponen Detail

#### A. CLIENT (Browser)

**Teknologi:**
- HTML5, CSS3, JavaScript (Vanilla)
- WebRTC API
- WebSocket API

**Struktur Komponen:**

```javascript
Client Components
│
├── UI Layer
│   ├── Login Interface
│   ├── Video Display (Local & Remote)
│   ├── Controls (Audio/Video Toggle)
│   └── Chat Panel
│
├── WebSocket Manager
│   ├── Connection Handler
│   ├── Message Parser
│   └── Event Dispatcher
│
├── WebRTC Manager
│   ├── PeerConnection Handler
│   ├── Media Stream Manager
│   ├── ICE Candidate Handler
│   └── SDP Handler
│
└── State Manager
    ├── User State
    ├── Connection State
    └── Media State
```

**Responsibilities:**
1. Mengakses media devices (camera/microphone)
2. Menampilkan local dan remote video streams
3. Mengelola WebSocket connection untuk signaling
4. Mengelola WebRTC peer connection
5. Handle user interactions
6. Menampilkan chat messages

#### B. SERVER (Golang)

**Struktur Komponen:**

```go
Server Components
│
├── HTTP Server
│   ├── Static File Server
│   └── WebSocket Upgrade Handler
│
├── Hub (Room Manager)
│   ├── Room Registry (map[roomID]*Room)
│   ├── Client Registration
│   ├── Client Unregistration
│   └── Message Broadcasting
│
├── Room
│   ├── Client List (map[clientID]*Client)
│   ├── Mutex for thread-safety
│   └── Room Lifecycle Management
│
├── Client
│   ├── WebSocket Connection
│   ├── Send Channel (buffered)
│   ├── User Metadata
│   └── Read/Write Pumps
│
└── Message Router
    ├── Message Type Handler
    ├── Validation
    └── Broadcasting Logic
```

**Responsibilities:**
1. Serve static files (HTML, CSS, JS)
2. Handle WebSocket connections
3. Manage rooms and clients
4. Route signaling messages (SDP, ICE)
5. Broadcast messages to room participants
6. Handle client join/leave events

#### C. WebRTC Peer Connection

**Flow:**

```
┌─────────────┐                           ┌─────────────┐
│  Client A   │                           │  Client B   │
└──────┬──────┘                           └──────┬──────┘
       │                                         │
       │ 1. getUserMedia()                      │
       │    (Access Camera/Mic)                 │
       ├──────────────────────────────────────► │
       │                                         │
       │ 2. createOffer()                       │
       │    (Create SDP Offer)                  │
       │                                         │
       │ 3. setLocalDescription()               │
       │    (Set Local SDP)                     │
       │                                         │
       │ 4. Send Offer via WebSocket            │
       ├────────────────────────────────────────►│
       │                                         │
       │                                         │ 5. setRemoteDescription()
       │                                         │    (Set Remote SDP)
       │                                         │
       │                                         │ 6. createAnswer()
       │                                         │    (Create SDP Answer)
       │                                         │
       │                                         │ 7. setLocalDescription()
       │                                         │
       │ 8. Receive Answer via WebSocket        │
       │◄────────────────────────────────────────┤
       │                                         │
       │ 9. setRemoteDescription()              │
       │                                         │
       │                                         │
       │ 10. Exchange ICE Candidates            │
       │◄───────────────────────────────────────►│
       │     (via WebSocket)                    │
       │                                         │
       │                                         │
       │ 11. P2P Connection Established         │
       │◄═══════════════════════════════════════►│
       │     (Direct Audio/Video Stream)        │
       │                                         │
```

---

## 4. PERAN WEBSOCKET DALAM SISTEM

### 4.1 Fungsi Utama WebSocket

WebSocket berperan sebagai **Signaling Channel** - jalur komunikasi untuk:

1. **Koordinasi Koneksi**
   - Pertukaran informasi untuk membangun koneksi P2P
   - Sinkronisasi state antar peers
   - Notifikasi events

2. **Session Negotiation**
   - SDP Offer/Answer exchange
   - Media capabilities negotiation
   - Codec selection

3. **Network Traversal**
   - ICE candidate exchange
   - Network path discovery
   - NAT penetration support

### 4.2 Message Types

```javascript
// 1. JOIN - User bergabung ke room
{
  "type": "join",
  "roomId": "room123",
  "userId": "user_abc123",
  "userType": "doctor"
}

// 2. USER-LIST - Daftar user di room
{
  "type": "user-list",
  "roomId": "room123",
  "data": {
    "users": [
      {"id": "user_abc123", "userType": "doctor"},
      {"id": "user_xyz789", "userType": "patient"}
    ]
  }
}

// 3. OFFER - WebRTC SDP Offer
{
  "type": "offer",
  "roomId": "room123",
  "userId": "user_abc123",
  "data": {
    "sdp": {
      "type": "offer",
      "sdp": "v=0\r\no=- ..."
    }
  }
}

// 4. ANSWER - WebRTC SDP Answer
{
  "type": "answer",
  "roomId": "room123",
  "userId": "user_xyz789",
  "data": {
    "sdp": {
      "type": "answer",
      "sdp": "v=0\r\no=- ..."
    }
  }
}

// 5. ICE-CANDIDATE - ICE Candidate
{
  "type": "ice-candidate",
  "roomId": "room123",
  "userId": "user_abc123",
  "data": {
    "candidate": {
      "candidate": "candidate:...",
      "sdpMLineIndex": 0,
      "sdpMid": "0"
    }
  }
}

// 6. CHAT - Text message
{
  "type": "chat",
  "roomId": "room123",
  "userId": "user_abc123",
  "userType": "doctor",
  "text": "Halo, ada yang bisa saya bantu?"
}
```

### 4.3 Connection Lifecycle

```
1. Client → Server: HTTP Upgrade Request
   GET /ws?room=room123&userId=user_abc&userType=doctor

2. Server → Client: 101 Switching Protocols
   Connection upgraded to WebSocket

3. Client Registration
   - Client added to Hub
   - Room created/joined
   - User list broadcasted

4. Message Exchange
   - Bidirectional real-time messaging
   - JSON-formatted messages
   - Event-driven communication

5. Connection Termination
   - Client disconnection detected
   - Client removed from room
   - Updated user list broadcasted
   - Room cleanup if empty
```

### 4.4 Room Management

**Hub Pattern:**

```go
type Hub struct {
    Rooms      map[string]*Room      // All active rooms
    Register   chan *Client          // Registration channel
    Unregister chan *Client          // Unregistration channel
    Broadcast  chan *Message         // Broadcast channel
}

// Concurrent-safe operations
func (h *Hub) run() {
    for {
        select {
        case client := <-h.Register:
            h.registerClient(client)
        case client := <-h.Unregister:
            h.unregisterClient(client)
        case message := <-h.Broadcast:
            h.broadcastMessage(message)
        }
    }
}
```

**Benefits:**
- Thread-safe room management
- Efficient message broadcasting
- Scalable architecture
- Clean separation of concerns

---

## 5. PERAN WEBRTC DALAM SISTEM

### 5.1 Fungsi Utama WebRTC

WebRTC menyediakan komunikasi **peer-to-peer** real-time untuk:

1. **Media Streaming**
   - Audio streaming (Opus codec)
   - Video streaming (VP8/H.264 codec)
   - Adaptive bitrate
   - Echo cancellation

2. **NAT Traversal**
   - ICE (Interactive Connectivity Establishment)
   - STUN (Session Traversal Utilities for NAT)
   - Automatic path finding

3. **Security**
   - DTLS (Datagram Transport Layer Security)
   - SRTP (Secure Real-time Transport Protocol)
   - End-to-end encryption

### 5.2 Connection Establishment

**ICE Candidate Types:**

```
1. Host Candidate
   - Local network address
   - Example: 192.168.1.100:54321
   - Priority: High

2. Server Reflexive Candidate
   - Public IP from STUN server
   - Example: 203.0.113.1:54321
   - Priority: Medium

3. Relay Candidate (if TURN used)
   - Address via TURN server
   - Example: relay.server.com:3478
   - Priority: Low
```

**Connection Priority:**
```
Direct (Host) > NAT Traversal (STUN) > Relay (TURN)
```

### 5.3 Media Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                     Client A (Sender)                        │
└─────────────────────────────────────────────────────────────┘
         │
         │ 1. getUserMedia()
         ▼
┌─────────────────┐
│ Camera/Mic      │
│ Hardware        │
└────────┬────────┘
         │
         │ 2. MediaStream
         ▼
┌─────────────────┐
│ Media Encoder   │
│ (VP8/Opus)      │
└────────┬────────┘
         │
         │ 3. RTP Packets
         ▼
┌─────────────────┐
│ SRTP Encryption │
└────────┬────────┘
         │
         │ 4. Encrypted Packets
         ▼
┌─────────────────┐
│ Network (UDP)   │
│ P2P Connection  │
└────────┬────────┘
         │
         │ 5. Transmission
         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Client B (Receiver)                      │
└─────────────────────────────────────────────────────────────┘
         │
         │ 6. Encrypted Packets
         ▼
┌─────────────────┐
│ SRTP Decryption │
└────────┬────────┘
         │
         │ 7. RTP Packets
         ▼
┌─────────────────┐
│ Media Decoder   │
│ (VP8/Opus)      │
└────────┬────────┘
         │
         │ 8. MediaStream
         ▼
┌─────────────────┐
│ Video/Audio     │
│ Rendering       │
└─────────────────┘
```

### 5.4 Quality Adaptation

**Adaptive Bitrate Streaming:**

```javascript
// WebRTC automatically adjusts:
- Video resolution
- Frame rate
- Bitrate
- Codec parameters

Based on:
- Network bandwidth
- Packet loss
- Latency
- CPU usage
```

**Quality Metrics:**

```javascript
peerConnection.getStats().then(stats => {
  stats.forEach(report => {
    if (report.type === 'inbound-rtp') {
      console.log('Packets received:', report.packetsReceived);
      console.log('Packets lost:', report.packetsLost);
      console.log('Jitter:', report.jitter);
      console.log('Round trip time:', report.roundTripTime);
    }
  });
});
```

### 5.5 Security Features

**1. Encryption Layers:**
```
Application Layer: End-to-end encrypted media
Transport Layer: DTLS for signaling, SRTP for media
Network Layer: Optional VPN/TLS
```

**2. Certificate Fingerprint:**
```javascript
// SDP contains certificate fingerprint
a=fingerprint:sha-256 
  12:34:56:78:90:AB:CD:EF:...
```

**3. Perfect Forward Secrecy:**
- New encryption keys for each session
- Keys not stored on server
- Cannot decrypt past sessions

---

## 6. DATA FLOW DIAGRAM

### 6.1 Complete User Journey

```
┌──────────────┐
│ User Opens   │
│ Application  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Enter Name   │
│ Room ID      │
│ Select Type  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Request Camera/  │
│ Microphone Access│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Connect WebSocket│
│ to Server        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Join Room        │
│ Register Client  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Receive User List│
└──────┬───────────┘
       │
       ├── Only 1 user? ──► Wait for others
       │
       └── 2+ users? ──┐
                       │
                       ▼
              ┌──────────────────┐
              │ Create WebRTC    │
              │ PeerConnection   │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Exchange SDP     │
              │ Offer/Answer     │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Exchange ICE     │
              │ Candidates       │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ P2P Connection   │
              │ Established      │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Video Call Active│
              │ - Audio Stream   │
              │ - Video Stream   │
              │ - Chat Available │
              └──────────────────┘
```

### 6.2 Message Flow Sequence

```
Client A          WebSocket Server         Client B
   │                     │                     │
   │─────join───────────►│                     │
   │                     │                     │
   │◄───user-list────────│                     │
   │                     │◄────join────────────│
   │                     │                     │
   │◄───user-list────────┼────user-list───────►│
   │                     │                     │
   │─────offer──────────►│                     │
   │                     │─────offer──────────►│
   │                     │                     │
   │                     │◄────answer──────────│
   │◄───answer───────────│                     │
   │                     │                     │
   │──ICE-cand──────────►│                     │
   │                     │──ICE-cand──────────►│
   │                     │                     │
   │                     │◄──ICE-cand──────────│
   │◄──ICE-cand──────────│                     │
   │                     │                     │
   │═══════════════WebRTC P2P═══════════════►│
   │                                           │
   │─────chat───────────►│                     │
   │                     │─────chat───────────►│
   │                     │                     │
```

---

## 7. SCALABILITY CONSIDERATIONS

### 7.1 Current Limitations

1. **One-to-One Only**
   - Support untuk 2 peserta per room
   - Tidak mendukung group call

2. **No Media Server**
   - Direct P2P connection
   - Server hanya untuk signaling

3. **In-Memory State**
   - Room dan client data di memory
   - Reset saat server restart

### 7.2 Future Enhancements

1. **Multi-Party Calls**
```
Options:
- Mesh topology (everyone connects to everyone)
- SFU (Selective Forwarding Unit)
- MCU (Multipoint Control Unit)
```

2. **Persistent Storage**
```
- Redis untuk session state
- Database untuk user/room metadata
- Message queue untuk scaling
```

3. **Load Balancing**
```
Client → Load Balancer → Multiple Server Instances
                              │
                              └──► Shared Redis/Database
```

---

## 8. KESIMPULAN

MediConnect adalah implementasi modern dari aplikasi telemedicine yang menggabungkan:

**WebSocket untuk:**
- Signaling yang efisien
- Real-time messaging
- Room management
- State synchronization

**WebRTC untuk:**
- High-quality video/audio streaming
- Low-latency P2P communication
- Secure end-to-end encryption
- Adaptive quality

**Keunggulan:**
✓ Komunikasi real-time dengan latensi rendah
✓ Kualitas video/audio tinggi
✓ Aman dengan enkripsi end-to-end
✓ Efisien bandwidth dengan P2P
✓ Mudah digunakan dan accessible

**Cocok untuk:**
- Konsultasi medis jarak jauh
- Pendidikan kesehatan online
- Follow-up pasien
- Konseling psikologi
- Second opinion medis
