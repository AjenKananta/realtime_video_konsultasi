// Global variables
let ws = null;
let localStream = null;
let peerConnection = null;
let userId = null;
let userName = null;
let userType = null;
let roomId = null;
let isAudioEnabled = true;
let isVideoEnabled = true;
let unreadMessages = 0;
let isPolite = false;
let makingOffer = false;
let ignoreOffer = false;
let remoteUserId = null;

// WebRTC configuration
const rtcConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// DOM Elements
const loginSection = document.getElementById('loginSection');
const videoSection = document.getElementById('videoSection');
const joinBtn = document.getElementById('joinBtn');
const userNameInput = document.getElementById('userName');
const roomIdInput = document.getElementById('roomId');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const toggleAudioBtn = document.getElementById('toggleAudio');
const toggleVideoBtn = document.getElementById('toggleVideo');
const toggleChatBtn = document.getElementById('toggleChat');
const endCallBtn = document.getElementById('endCall');
const chatPanel = document.getElementById('chatPanel');
const closeChatBtn = document.getElementById('closeChat');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChat');
const chatMessages = document.getElementById('chatMessages');
const connectionStatus = document.getElementById('connectionStatus');
const noRemoteVideo = document.getElementById('noRemoteVideo');
const currentRoomId = document.getElementById('currentRoomId');
const participantCount = document.getElementById('participantCount');
const localUserName = document.getElementById('localUserName');
const remoteUserName = document.getElementById('remoteUserName');
const chatBadge = document.getElementById('chatBadge');

// Generate unique user ID
userId = 'user_' + Math.random().toString(36).substr(2, 9);
console.log('============================================');
console.log('APP INITIALIZED - My User ID:', userId);
console.log('============================================');

// Event Listeners
joinBtn.addEventListener('click', joinRoom);
toggleAudioBtn.addEventListener('click', toggleAudio);
toggleVideoBtn.addEventListener('click', toggleVideo);
toggleChatBtn.addEventListener('click', () => {
    chatPanel.classList.toggle('hidden');
    if (!chatPanel.classList.contains('hidden')) {
        unreadMessages = 0;
        updateChatBadge();
        chatInput.focus();
    }
});
closeChatBtn.addEventListener('click', () => {
    chatPanel.classList.add('hidden');
});
endCallBtn.addEventListener('click', endCall);
sendChatBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});

// Initialize application
function joinRoom() {
    userName = userNameInput.value.trim();
    roomId = roomIdInput.value.trim();
    const selectedUserType = document.querySelector('input[name="userType"]:checked');
    
    if (!userName || !roomId || !selectedUserType) {
        alert('Mohon lengkapi semua field');
        return;
    }
    
    userType = selectedUserType.value;
    
    console.log('JOIN ROOM:', { userName, roomId, userType, userId });
    
    // Update UI
    localUserName.textContent = `${userName} (Anda)`;
    currentRoomId.textContent = roomId;
    
    // Start media and WebSocket
    startLocalMedia();
}

// Start local media (camera & microphone)
async function startLocalMedia() {
    try {
        console.log('Requesting media devices...');
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        console.log('Media stream obtained:', localStream.getTracks());
        localVideo.srcObject = localStream;
        
        // Connect to WebSocket
        connectWebSocket();
        
        // Show video section
        loginSection.classList.add('hidden');
        videoSection.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Tidak dapat mengakses kamera/mikrofon. Pastikan izin telah diberikan.');
    }
}

// Connect to WebSocket server
function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?room=${roomId}&userId=${userId}&userType=${userType}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('✅ WebSocket CONNECTED');
        updateConnectionStatus(true);
    };
    
    ws.onmessage = (event) => {
        console.log('📨 RAW WebSocket message:', event.data);
        handleWebSocketMessage(JSON.parse(event.data));
    };
    
    ws.onerror = (error) => {
        console.error('❌ WebSocket ERROR:', error);
        updateConnectionStatus(false);
    };
    
    ws.onclose = () => {
        console.log('🔌 WebSocket DISCONNECTED');
        updateConnectionStatus(false);
    };
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(message) {
    console.log('📬 Parsed message:', message);
    console.log('   Type:', message.type);
    console.log('   Data:', message.data);
    
    switch (message.type) {
        case 'user-list':
            console.log('👥 USER-LIST event received');
            handleUserList(message);
            break;
        case 'offer':
            console.log('📞 OFFER received');
            handleOffer(message.data);
            break;
        case 'answer':
            console.log('📞 ANSWER received');
            handleAnswer(message.data);
            break;
        case 'ice-candidate':
            console.log('🧊 ICE-CANDIDATE received');
            handleIceCandidate(message.data);
            break;
        case 'chat':
            console.log('💬 CHAT message received');
            handleChatMessage(message);
            break;
        default:
            console.warn('⚠️ Unknown message type:', message.type);
    }
}

// Handle user list updates
function handleUserList(message) {
    console.log('============================================');
    console.log('👥 HANDLE USER LIST');
    console.log('Full message:', JSON.stringify(message, null, 2));
    
    const users = message.data.users;
    const politePeer = message.data.politePeer;
    
    console.log('Users in room:', users);
    console.log('Polite peer ID:', politePeer);
    console.log('My ID:', userId);
    
    if (!users || users.length === 0) {
        console.error('❌ No users in the list!');
        return;
    }
    
    participantCount.textContent = users.length;
    
    // Determine if we are the polite peer
    isPolite = (userId === politePeer);
    
    console.log('Am I polite?', isPolite ? '✅ YES' : '❌ NO');
    
    // Find other user (not self)
    const otherUser = users.find(u => u.id !== userId);
    console.log('Other user:', otherUser);
    
    if (otherUser) {
        remoteUserId = otherUser.id;
        const userTypeLabel = otherUser.userType === 'doctor' ? 'Dokter' : 'Pasien';
        remoteUserName.textContent = userTypeLabel;
        
        console.log('✅ Remote user found!');
        console.log('   Remote ID:', remoteUserId);
        console.log('   Remote type:', userTypeLabel);
        
        // Create peer connection if not exists
        if (!peerConnection) {
            console.log('🔧 Creating NEW peer connection...');
            createPeerConnection();
            
            // Only polite peer creates offer
            if (isPolite) {
                console.log('👑 I am POLITE peer - will create offer in 500ms');
                setTimeout(() => {
                    console.log('⏰ Timeout triggered, checking state...');
                    console.log('   Peer connection exists?', !!peerConnection);
                    console.log('   Connection state:', peerConnection?.connectionState);
                    
                    if (peerConnection && peerConnection.connectionState === 'new') {
                        console.log('🚀 Creating offer NOW');
                        createOffer();
                    } else {
                        console.log('⚠️ Not creating offer - state changed');
                    }
                }, 500);
            } else {
                console.log('🤝 I am IMPOLITE peer - waiting for offer');
            }
        } else {
            console.log('ℹ️ Peer connection ALREADY exists');
            console.log('   State:', peerConnection.connectionState);
            console.log('   Signaling state:', peerConnection.signalingState);
        }
    } else {
        console.log('❌ No other user found in room');
        remoteUserName.textContent = 'Menunggu peserta lain...';
        remoteUserId = null;
    }
    console.log('============================================');
}

// Create WebRTC peer connection
function createPeerConnection() {
    console.log('🔧 CREATE PEER CONNECTION');
    peerConnection = new RTCPeerConnection(rtcConfiguration);
    
    console.log('   Adding local tracks...');
    // Add local stream tracks
    localStream.getTracks().forEach(track => {
        console.log('     Adding track:', track.kind, track.label);
        peerConnection.addTrack(track, localStream);
    });
    
    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
        console.log('🎥 RECEIVED REMOTE TRACK:', event.track.kind);
        console.log('   Stream:', event.streams[0]);
        remoteVideo.srcObject = event.streams[0];
        noRemoteVideo.classList.add('hidden');
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('🧊 Sending ICE candidate:', event.candidate.candidate);
            sendMessage({
                type: 'ice-candidate',
                targetUserId: remoteUserId,
                data: {
                    candidate: event.candidate
                }
            });
        } else {
            console.log('🧊 ICE gathering complete (null candidate)');
        }
    };
    
    // Perfect negotiation pattern
    peerConnection.onnegotiationneeded = async () => {
        console.log('🔄 NEGOTIATION NEEDED');
        console.log('   makingOffer:', makingOffer);
        console.log('   Signaling state:', peerConnection.signalingState);
        
        try {
            makingOffer = true;
            console.log('   Creating local description...');
            await peerConnection.setLocalDescription();
            console.log('   ✅ Local description set:', peerConnection.localDescription.type);
            console.log('   📤 Sending offer to:', remoteUserId);
            sendMessage({
                type: 'offer',
                targetUserId: remoteUserId,
                data: {
                    sdp: peerConnection.localDescription
                }
            });
        } catch (err) {
            console.error('❌ Negotiation error:', err);
        } finally {
            makingOffer = false;
        }
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
        console.log('🔌 Connection state:', peerConnection.connectionState);
        
        if (peerConnection.connectionState === 'connected') {
            console.log('🎉 PEERS CONNECTED SUCCESSFULLY!');
        }
        
        if (peerConnection.connectionState === 'disconnected' || 
            peerConnection.connectionState === 'failed') {
            console.log('💔 Connection lost/failed');
            noRemoteVideo.classList.remove('hidden');
        }
    };
    
    // Additional logging
    peerConnection.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', peerConnection.iceConnectionState);
    };
    
    peerConnection.onicegatheringstatechange = () => {
        console.log('🧊 ICE gathering state:', peerConnection.iceGatheringState);
    };
    
    peerConnection.onsignalingstatechange = () => {
        console.log('📡 Signaling state:', peerConnection.signalingState);
    };
    
    console.log('✅ Peer connection created');
}

// Create and send WebRTC offer
async function createOffer() {
    console.log('============================================');
    console.log('📞 CREATE OFFER');
    try {
        console.log('   Creating offer...');
        const offer = await peerConnection.createOffer();
        console.log('   ✅ Offer created');
        
        console.log('   Setting local description...');
        await peerConnection.setLocalDescription(offer);
        console.log('   ✅ Local description set');
        
        console.log('   📤 Sending offer to:', remoteUserId);
        sendMessage({
            type: 'offer',
            targetUserId: remoteUserId,
            data: {
                sdp: offer
            }
        });
        console.log('   ✅ Offer sent');
    } catch (error) {
        console.error('❌ Error creating offer:', error);
    }
    console.log('============================================');
}

// Handle incoming WebRTC offer
async function handleOffer(data) {
    console.log('============================================');
    console.log('📞 HANDLE OFFER');
    console.log('   makingOffer:', makingOffer);
    console.log('   Signaling state:', peerConnection?.signalingState);
    
    try {
        const offerCollision = (makingOffer || 
            (peerConnection && peerConnection.signalingState !== 'stable'));
        
        ignoreOffer = !isPolite && offerCollision;
        
        console.log('   Offer collision?', offerCollision);
        console.log('   Ignore offer?', ignoreOffer);
        
        if (ignoreOffer) {
            console.log('⏭️ Ignoring offer (impolite peer in collision)');
            return;
        }
        
        if (!peerConnection) {
            console.log('   Creating peer connection to handle offer');
            createPeerConnection();
        }
        
        if (offerCollision) {
            console.log('   🔄 Collision detected - rolling back');
            await Promise.all([
                peerConnection.setLocalDescription({type: 'rollback'}),
                peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
            ]);
        } else {
            console.log('   Setting remote description...');
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        }
        
        console.log('   ✅ Remote description set');
        console.log('   Creating answer...');
        const answer = await peerConnection.createAnswer();
        console.log('   ✅ Answer created');
        
        console.log('   Setting local description...');
        await peerConnection.setLocalDescription(answer);
        console.log('   ✅ Local description set');
        
        console.log('   📤 Sending answer to:', remoteUserId);
        sendMessage({
            type: 'answer',
            targetUserId: remoteUserId,
            data: {
                sdp: answer
            }
        });
        console.log('   ✅ Answer sent');
    } catch (error) {
        console.error('❌ Error handling offer:', error);
    }
    console.log('============================================');
}

// Handle incoming WebRTC answer
async function handleAnswer(data) {
    console.log('============================================');
    console.log('📞 HANDLE ANSWER');
    try {
        console.log('   Setting remote description...');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        console.log('   ✅ Answer set successfully');
    } catch (error) {
        console.error('❌ Error handling answer:', error);
    }
    console.log('============================================');
}

// Handle incoming ICE candidate
async function handleIceCandidate(data) {
    console.log('🧊 HANDLE ICE CANDIDATE');
    console.log('   Candidate:', data.candidate.candidate);
    try {
        if (peerConnection && data.candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            console.log('   ✅ ICE candidate added');
        }
    } catch (error) {
        if (!ignoreOffer) {
            console.error('❌ Error handling ICE candidate:', error);
        }
    }
}

// Toggle audio
function toggleAudio() {
    isAudioEnabled = !isAudioEnabled;
    
    localStream.getAudioTracks().forEach(track => {
        track.enabled = isAudioEnabled;
    });
    
    toggleAudioBtn.classList.toggle('active');
    console.log('🎤 Audio toggled:', isAudioEnabled ? 'ON' : 'OFF');
}

// Toggle video
function toggleVideo() {
    isVideoEnabled = !isVideoEnabled;
    
    localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoEnabled;
    });
    
    toggleVideoBtn.classList.toggle('active');
    console.log('📹 Video toggled:', isVideoEnabled ? 'ON' : 'OFF');
}

// Send chat message
function sendChatMessage() {
    const text = chatInput.value.trim();
    
    if (!text) return;
    
    sendMessage({
        type: 'chat',
        text: text
    });
    
    displayChatMessage(userName, text, true);
    chatInput.value = '';
}

// Handle incoming chat message
function handleChatMessage(message) {
    const senderName = message.userType === 'doctor' ? 'Dokter' : 'Pasien';
    displayChatMessage(senderName, message.text, false);
    
    if (chatPanel.classList.contains('hidden')) {
        unreadMessages++;
        updateChatBadge();
    }
}

// Display chat message in UI
function displayChatMessage(sender, text, isOwn) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message' + (isOwn ? ' own' : '');
    
    const senderDiv = document.createElement('div');
    senderDiv.className = 'message-sender';
    senderDiv.textContent = sender;
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = text;
    
    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(textDiv);
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Update chat badge
function updateChatBadge() {
    if (unreadMessages > 0) {
        chatBadge.textContent = unreadMessages > 9 ? '9+' : unreadMessages;
        chatBadge.classList.remove('hidden');
    } else {
        chatBadge.classList.add('hidden');
    }
}

// End call
function endCall() {
    if (confirm('Apakah Anda yakin ingin mengakhiri konsultasi?')) {
        cleanup();
        videoSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        userNameInput.value = '';
        roomIdInput.value = '';
    }
}

// Cleanup connections and streams
function cleanup() {
    console.log('🧹 CLEANUP');
    
    if (ws) {
        ws.close();
        ws = null;
    }
    
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    noRemoteVideo.classList.remove('hidden');
    
    isAudioEnabled = true;
    isVideoEnabled = true;
    toggleAudioBtn.classList.remove('active');
    toggleVideoBtn.classList.remove('active');
    chatPanel.classList.add('hidden');
    chatMessages.innerHTML = '';
    unreadMessages = 0;
    updateChatBadge();
    
    isPolite = false;
    makingOffer = false;
    ignoreOffer = false;
    remoteUserId = null;
}

// Send message through WebSocket
function sendMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('📤 SENDING MESSAGE:', message);
        ws.send(JSON.stringify(message));
    } else {
        console.error('❌ Cannot send - WebSocket not open');
    }
}

// Update connection status indicator
function updateConnectionStatus(connected) {
    const statusDot = connectionStatus.querySelector('.status-dot');
    const statusText = connectionStatus.querySelector('.status-text');
    
    if (connected) {
        statusDot.classList.add('connected');
        statusText.textContent = 'Terhubung';
    } else {
        statusDot.classList.remove('connected');
        statusText.textContent = 'Terputus';
    }
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    cleanup();
});