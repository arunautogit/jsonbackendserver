import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createRoom, joinRoom, startGame, getRoom, leaveRoom, rooms } from './roomManager.js';
import { playTurn, processNextTurn } from './gameLogic.js';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Helper to filter public rooms
    const getPublicRooms = () => {
        const list = [];
        for (const [id, room] of Object.entries(rooms)) {
            if (room.status === 'LOBBY') {
                list.push({ id, players: room.players.length });
            }
        }
        return list;
    };

    // Send initial list
    socket.emit('rooms_list', getPublicRooms());

    socket.on('create_room', () => {
        const roomId = createRoom(socket.id);
        socket.join(roomId);
        socket.emit('room_created', roomId);
        console.log(`Room created: ${roomId} by ${socket.id}`);
        io.emit('rooms_list', getPublicRooms());
    });

    socket.on('join_room', (roomId) => {
        if (joinRoom(roomId, socket.id)) {
            socket.join(roomId);
            const room = getRoom(roomId);
            io.to(roomId).emit('player_joined', room.players.length);
            console.log(`User ${socket.id} joined room ${roomId}`);
            io.emit('rooms_list', getPublicRooms());
        } else {
            socket.emit('error', 'Room not found or full');
        }
    });

    socket.on('get_rooms', () => {
        socket.emit('rooms_list', getPublicRooms());
    });

    socket.on('start_game', (roomId) => {
        const game = startGame(roomId);
        if (game) {
            io.to(roomId).emit('game_started', game);
            io.emit('rooms_list', getPublicRooms());
        }
    });

    socket.on('make_move', ({ roomId, attribute }) => {
        const room = getRoom(roomId);
        if (room && room.game) {
            const g = room.game;
            // Only allow move if not already revealed
            if (g.revealed) return;

            const participatingIndices = g.hands.map((_, i) => i).filter(i => g.hands[i].length > 0);
            const activeCardsMap = participatingIndices.map(index => ({
                playerIndex: index,
                card: g.hands[index][0]
            }));

            const result = playTurn(activeCardsMap, attribute);
            g.revealed = true;
            g.lastResult = result;

            io.to(roomId).emit('game_update', g);
        }
    });

    socket.on('next_turn', (roomId) => {
        const room = getRoom(roomId);
        if (room && room.game) {
            const g = room.game;
            // Only process if revealed
            if (!g.revealed) return;

            processNextTurn(g);
            io.to(roomId).emit('game_update', g);
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
        const roomId = leaveRoom(socket.id);
        if (roomId) {
            io.to(roomId).emit('player_joined', getRoom(roomId)?.players.length || 0); // Update count
        }
    });
});

server.listen(3001, () => {
    console.log('SERVER RUNNING on port 3001');
});
