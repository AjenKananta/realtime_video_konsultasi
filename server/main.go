package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sort"
	"sync"

	"github.com/gorilla/websocket"
)

// Message types
const (
	TypeJoin         = "join"
	TypeLeave        = "leave"
	TypeOffer        = "offer"
	TypeAnswer       = "answer"
	TypeICECandidate = "ice-candidate"
	TypeChat         = "chat"
	TypeUserList     = "user-list"
	TypeError        = "error"
)

// Message struktur untuk WebSocket communication
type Message struct {
	Type         string                 `json:"type"`
	RoomID       string                 `json:"roomId,omitempty"`
	UserID       string                 `json:"userId,omitempty"`
	TargetUserID string                 `json:"targetUserId,omitempty"`
	UserType     string                 `json:"userType,omitempty"`
	Data         map[string]interface{} `json:"data,omitempty"`
	Text         string                 `json:"text,omitempty"`
}

// Client represents a WebSocket client
type Client struct {
	ID       string
	UserType string
	Conn     *websocket.Conn
	RoomID   string
	Send     chan []byte
}

// Room represents a consultation room
type Room struct {
	ID      string
	Clients map[string]*Client
	mutex   sync.RWMutex
}

// Hub manages all rooms and clients
type Hub struct {
	Rooms      map[string]*Room
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan *Message
	mutex      sync.RWMutex
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var hub = &Hub{
	Rooms:      make(map[string]*Room),
	Register:   make(chan *Client),
	Unregister: make(chan *Client),
	Broadcast:  make(chan *Message),
}

func (h *Hub) run() {
	log.Println("Hub started and running...")
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

func (h *Hub) registerClient(client *Client) {
	log.Printf("REGISTER CLIENT: %s (type: %s) in room: %s", client.ID, client.UserType, client.RoomID)

	h.mutex.Lock()
	room, exists := h.Rooms[client.RoomID]
	if !exists {
		log.Printf("Creating NEW room: %s", client.RoomID)
		room = &Room{
			ID:      client.RoomID,
			Clients: make(map[string]*Client),
		}
		h.Rooms[client.RoomID] = room
	}
	h.mutex.Unlock()

	room.mutex.Lock()
	room.Clients[client.ID] = client
	clientCount := len(room.Clients)
	room.mutex.Unlock()

	log.Printf("✅ Client %s added to room %s (total clients: %d)", client.ID, client.RoomID, clientCount)

	// Send user list - IMPORTANT: call this OUTSIDE of any locks
	h.sendUserList(client.RoomID)
}

func (h *Hub) unregisterClient(client *Client) {
	log.Printf("UNREGISTER CLIENT: %s from room: %s", client.ID, client.RoomID)

	h.mutex.RLock()
	room, exists := h.Rooms[client.RoomID]
	h.mutex.RUnlock()

	if exists {
		room.mutex.Lock()
		if _, ok := room.Clients[client.ID]; ok {
			delete(room.Clients, client.ID)
			close(client.Send)
			log.Printf("✅ Client %s removed", client.ID)
		}
		clientCount := len(room.Clients)
		room.mutex.Unlock()

		// Send updated user list
		h.sendUserList(client.RoomID)

		// Remove room if empty
		if clientCount == 0 {
			h.mutex.Lock()
			delete(h.Rooms, client.RoomID)
			h.mutex.Unlock()
			log.Printf("Room %s removed (empty)", client.RoomID)
		}
	}
}

func (h *Hub) broadcastMessage(message *Message) {
	h.mutex.RLock()
	room, exists := h.Rooms[message.RoomID]
	h.mutex.RUnlock()

	if !exists {
		return
	}

	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	room.mutex.RLock()
	clients := make([]*Client, 0)
	for _, client := range room.Clients {
		// Skip sender
		if client.ID == message.UserID {
			continue
		}
		// If targetUserId specified, only send to that user
		if message.TargetUserID != "" && client.ID != message.TargetUserID {
			continue
		}
		clients = append(clients, client)
	}
	room.mutex.RUnlock()

	// Send outside of lock
	for _, client := range clients {
		select {
		case client.Send <- data:
			log.Printf("Sent %s to %s", message.Type, client.ID)
		default:
			log.Printf("Send buffer full for %s", client.ID)
		}
	}
}

func (h *Hub) sendUserList(roomID string) {
	log.Printf("SEND USER LIST for room: %s", roomID)

	h.mutex.RLock()
	room, exists := h.Rooms[roomID]
	h.mutex.RUnlock()

	if !exists {
		log.Printf("Room %s not found", roomID)
		return
	}

	// Collect user data while holding lock
	room.mutex.RLock()
	users := make([]map[string]string, 0, len(room.Clients))
	userIds := make([]string, 0, len(room.Clients))
	clients := make([]*Client, 0, len(room.Clients))

	for id, client := range room.Clients {
		users = append(users, map[string]string{
			"id":       id,
			"userType": client.UserType,
		})
		userIds = append(userIds, id)
		clients = append(clients, client)
		log.Printf("  User in room: %s (type: %s)", id, client.UserType)
	}
	room.mutex.RUnlock()

	// Determine polite peer
	sort.Strings(userIds)
	var politePeerId string
	if len(userIds) > 0 {
		politePeerId = userIds[0]
	}

	log.Printf("Total users: %d, Polite peer: %s", len(users), politePeerId)

	// Create message
	message := &Message{
		Type:   TypeUserList,
		RoomID: roomID,
		Data: map[string]interface{}{
			"users":      users,
			"politePeer": politePeerId,
		},
	}

	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling user list: %v", err)
		return
	}

	log.Printf("User list message: %s", string(data))

	// Send to all clients (outside of lock)
	sentCount := 0
	for _, client := range clients {
		select {
		case client.Send <- data:
			log.Printf("✅ Sent user list to: %s", client.ID)
			sentCount++
		default:
			log.Printf("❌ Buffer full for: %s", client.ID)
		}
	}

	log.Printf("User list sent to %d/%d clients", sentCount, len(clients))
}

func (c *Client) readPump() {
	defer func() {
		hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, messageData, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		var message Message
		if err := json.Unmarshal(messageData, &message); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		message.RoomID = c.RoomID
		message.UserID = c.ID

		log.Printf("Received %s from %s", message.Type, c.ID)
		hub.Broadcast <- &message
	}
}

func (c *Client) writePump() {
	defer c.Conn.Close()

	for message := range c.Send {
		err := c.Conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Printf("Write error: %v", err)
			return
		}
	}
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Upgrade error: %v", err)
		return
	}

	roomID := r.URL.Query().Get("room")
	userID := r.URL.Query().Get("userId")
	userType := r.URL.Query().Get("userType")

	if roomID == "" || userID == "" || userType == "" {
		conn.WriteMessage(websocket.CloseMessage, []byte("Missing required parameters"))
		conn.Close()
		return
	}

	client := &Client{
		ID:       userID,
		UserType: userType,
		Conn:     conn,
		RoomID:   roomID,
		Send:     make(chan []byte, 256),
	}

	hub.Register <- client

	go client.writePump()
	client.readPump()
}

func main() {
	log.Println("🚀 MediConnect Server Starting...")

	// Start hub
	go hub.run()

	// Serve static files
	fs := http.FileServer(http.Dir("../static"))
	http.Handle("/", fs)

	// WebSocket endpoint
	http.HandleFunc("/ws", handleWebSocket)

	log.Println("✅ Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
