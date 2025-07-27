# 💥 Crypto Crash Game – Backend

Hi, I’m Adwaidh Babu, and this is the backend system I built for a real-time multiplayer crash game called **Crypto Crash**. The idea is simple: players place bets in USD, which gets converted to BTC or ETH using live market prices, and they try to cash out before the multiplier crashes.

It’s a full-stack backend with real-time WebSocket updates, crypto price integration, provably fair crash logic, and wallet simulation. I’ve used **Node.js, Express, MongoDB, and Socket.IO** for this project.

---

## 🔧 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **WebSocket**: Socket.IO
- **Crypto API**: CoinGecko (live BTC/ETH prices)
- **Frontend (Test UI)**: A simple HTML page for testing the game in real-time

---

## 🚀 Features

- New game round every 10 seconds
- Multiplier increases in real-time every 100ms
- Players can cash out at any time before the crash
- Provably fair crash point generation using hash-based algorithm
- USD-to-crypto conversion and wallet balance tracking
- Simulated blockchain-style transactions with logs
- Real-time notifications using WebSocket (multiplier, cashout, crash)

---

## 🛠 How to Run Locally

1. **Clone the repo**  

git clone https://github.com/your-username/crypto-crash-backend.git
cd crypto-crash-backend

2.Install dependencies

npm install
Create a .env file

env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/crypto_crash


npm run dev
Start the server
Visit: http://localhost:5000

