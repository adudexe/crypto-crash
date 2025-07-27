import dotenv from 'dotenv';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';
import mongoose from 'mongoose';
import router from './routers/Router.js';
import { startGame,registerPlayer,cashOut } from './gameEngine.js';
import path,{ dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const server = http.createServer(app);


// Socket is created
const io = new Server(server , {
    cors:{
        origin:"*"
    },
});

//Socket Operation's
io.on('connection', (socket) => {
  console.log(`New client: ${socket.id}`);

  // Register player's bet in current round
  socket.on('joinRound', (betData) => {
    console.log("Player joined round:", betData);
    registerPlayer(socket, betData);
  });

  // Cashout
  socket.on('cashoutRequest', async () => {
    await cashOut(socket, io);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

startGame(io);


// console.log("dirnameis",dirname);
const filename = fileURLToPath(import.meta.url);
const __dirname = dirname(filename);
app.use(express.static(path.join(__dirname, 'public')));



// Middlewares
app.use(cors());
app.use(express.json());


//Connect to Mongodb
mongoose.connect(process.env.MONGO_URI)
.then(() => { console.log("MongoDB Succesfully Connected") })
.catch(() => { console.log("Error in Connecting to MongoDB Database") });

// Routes
app.use('/',router);


// WebSocket
// io.on('connection',(socket) => {
//     console.log(`New Client ${socket.id}`)

//     io.on('disconnect',(socket) => {
//         console.log(`Client Disconnected ${socket.id}`);
//     })

// })

server.listen(3000,(err)=>{
    if(err){
        console.log("Error in listening to server",err);
        return;
    }
    console.log(`Server Running on PORT ${process.env.PORT} http://localhost:${process.env.PORT}`);
})












