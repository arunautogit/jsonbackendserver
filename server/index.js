import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createRoom, joinRoom, startGame, getRoom, leaveRoom, rooms, addCpu } from './roomManager.js';
import { playTurn, processNextTurn, getBestAttribute, handlePlayerDrop, handleStealMove } from './gameLogic.js';

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

    socket.on('create_room', (playerName) => {
        const roomId = createRoom(socket.id, playerName);
        socket.join(roomId);
        socket.emit('room_created', roomId);
        console.log(`Room created: ${roomId} by ${socket.id} (${playerName})`);
        io.emit('rooms_list', getPublicRooms());
    });

    socket.on('join_room', ({ roomId, playerName }) => {
        // Handle both simple ID (old client) and object (new client)
        let targetRoom = roomId;
        let pName = playerName;

        if (typeof roomId === 'object') {
            targetRoom = roomId.roomId;
            pName = roomId.playerName;
        }

        if (joinRoom(targetRoom, socket.id, pName)) {
            socket.join(targetRoom);
            const room = getRoom(targetRoom);
            io.to(targetRoom).emit('player_joined', room.players.length);
            console.log(`User ${socket.id} (${pName}) joined room ${targetRoom}`);
            io.emit('rooms_list', getPublicRooms());
        } else {
            socket.emit('error', 'Room not found or full');
        }
    });

    socket.on('add_cpu', (roomId) => {
        const room = getRoom(roomId);
        // Only host can add CPU? Or anyone in lobby? Let's say anyone for now if room exists
        if (room && room.status === 'LOBBY') {
            if (addCpu(roomId)) {
                io.to(roomId).emit('player_joined', room.players.length);
                io.emit('rooms_list', getPublicRooms());
                // If full?
            }
        }
    });

    socket.on('drop_game', (roomId) => {
        const room = getRoom(roomId);
        if (room && room.game) {
            const playerIndex = room.players.indexOf(socket.id);
            if (playerIndex !== -1) {
                handlePlayerDrop(room.game, playerIndex);
                io.to(roomId).emit('game_update', room.game);

                // Check if next player is CPU (if turn passed)
                setTimeout(() => checkCpuTurn(roomId, room.game), 1000);
            }
        }
    });

    socket.on('get_rooms', () => {
        socket.emit('rooms_list', getPublicRooms());
    });

    socket.on('start_game', (roomId) => {
        console.log(`[DEBUG] Received start_game for room ${roomId}`);
        try {
            const game = startGame(roomId);
            if (game) {
                console.log(`[DEBUG] Game started for ${roomId}`);
                io.to(roomId).emit('game_started', game);
                io.emit('rooms_list', getPublicRooms());
                checkCpuTurn(roomId, game);
            } else {
                console.error(`[DEBUG] startGame failed for ${roomId}`);
            }
        } catch (err) {
            console.error(`[DEBUG] Error in start_game: ${err.message}`);
            console.error(err);
        }
    });

    socket.on('steal_move', ({ roomId, targetIndex, cardIndices }) => {
        const room = getRoom(roomId);
        if (room && room.game) {
            // Verify it is the stealer's turn to steal
            // Security check: socket.id should match room.players[game.stealState.stealer]
            // We'll trust the logic for now or add check:
            // const stealerIdx = room.game.stealState.stealer;
            // if (room.players[stealerIdx] !== socket.id) return;

            handleStealMove(room.game, { targetIndex, cardIndices });
            io.to(roomId).emit('game_update', room.game);
        }
    });

    socket.on('make_move', ({ roomId, attribute }) => {
        const room = getRoom(roomId);
        if (room && room.game) {
            const g = room.game;
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

            // Check if next player is CPU
            setTimeout(() => checkCpuTurn(roomId, g), 1000);
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

// CPU Logic Helper
const checkCpuTurn = (roomId, game) => {
    const room = getRoom(roomId);
    if (!room) return;

    const activePlayerIndex = game.activePlayerIndex;
    const activePlayerId = room.players[activePlayerIndex]; // Or use stored playerIds in game object if socket IDs change (but they shouldn't mid-game)
    // Actually room.players helps us identify if it is a CPU
    // But wait, room.players might track *connected* sockets. 
    // We stored `game.playerIds` in startGame. Using that is safer.

    if (game.playerIds && game.playerIds[activePlayerIndex] && game.playerIds[activePlayerIndex].startsWith('CPU-')) {
        // It's a CPU turn
        console.log(`CPU Turn: Player ${activePlayerIndex}`);

        const hand = game.hands[activePlayerIndex];
        if (hand && hand.length > 0) {
            const card = hand[0];
            const attr = getBestAttribute(card);

            // Simulate delay
            setTimeout(() => {
                // We need to trigger make_move logic.
                // Re-using the logic inside specific function prevents code duplication, 
                // but for now I'll just copy the make_move logic block or refactor.
                // Let's refactor slightly by creating a function or just invoking logic.
                // Since I cannot easily refactor the whole file in one go without potential errors, I will duplicate the make_move logic here safely.

                const g = game; // closure reference
                if (g.revealed) return; // Should not happen

                const participatingIndices = g.hands.map((_, i) => i).filter(i => g.hands[i].length > 0);
                const activeCardsMap = participatingIndices.map(index => ({
                    playerIndex: index,
                    card: g.hands[index][0]
                }));

                const result = playTurn(activeCardsMap, attr);
                g.revealed = true;
                g.lastResult = result;

                io.to(roomId).emit('game_update', g);

                // Auto "Next Turn" for CPU?
                // Usually user wants to see the result. So we DO NOT auto-next-turn.
                // Users must click next turn.
            }, 1500);
        }
    }
};

// 5 Minute Interval Checker
setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of Object.entries(rooms)) {
        if (room.status === 'LOBBY' && room.createdAt && (now - room.createdAt > 300000)) { // 5 mins
            // Emit suggestion to host? 
            // We can emit to the room.
            io.to(roomId).emit('suggest_cpu');
        }
    }
}, 60000); // Check every minute

server.listen(3001, () => {
    console.log('SERVER RUNNING on port 3001');
});
