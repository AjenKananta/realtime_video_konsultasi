#!/bin/bash

# MediConnect Startup Script

echo "========================================="
echo "  MediConnect - Telemedicine Platform"
echo "========================================="
echo ""

# Check if Go is installed
if ! command -v go &> /dev/null
then
    echo "❌ Go tidak terinstall. Install Go terlebih dahulu."
    echo "   Download dari: https://golang.org/dl/"
    exit 1
fi

echo "✓ Go version: $(go version)"
echo ""

# Navigate to server directory
cd server

# Download dependencies
echo "📦 Downloading dependencies..."
go mod download

if [ $? -ne 0 ]; then
    echo "❌ Gagal download dependencies"
    exit 1
fi

echo "✓ Dependencies downloaded"
echo ""

# Run the server
echo "🚀 Starting MediConnect server..."
echo ""
echo "Server akan berjalan di: http://localhost:8080"
echo ""
echo "Cara menggunakan:"
echo "1. Buka http://localhost:8080 di browser"
echo "2. Masukkan nama, ID ruang, dan pilih role (dokter/pasien)"
echo "3. Klik 'Mulai Konsultasi'"
echo "4. Untuk testing, buka tab/window baru dengan ID ruang yang sama"
echo ""
echo "Tekan Ctrl+C untuk menghentikan server"
echo "========================================="
echo ""

go run main.go
