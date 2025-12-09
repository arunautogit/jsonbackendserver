import { initializeGame, playTurn } from './gameLogic.js';

export const rooms = {}; // { roomId: { players: [socketIds], game: gameState } }

export const createRoom = (hostSocketId) => {
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    rooms[roomId] = {
        players: [hostSocketId],
        game: null,
        status: 'LOBBY',
        createdAt: Date.now()
    };
    return roomId;
};

export const joinRoom = (roomId, socketId) => {
    const room = rooms[roomId];
    if (room && room.status === 'LOBBY' && room.players.length < 4) {
        room.players.push(socketId);
        return true;
    }
    return false;
};

export const addCpu = (roomId) => {
    const room = rooms[roomId];
    if (room && room.status === 'LOBBY' && room.players.length < 4) {
        const cpuId = `CPU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        room.players.push(cpuId);
        return true;
    }
    return false;
};

export const startGame = (roomId) => {
    const room = rooms[roomId];
    if (room) {
        room.game = initializeGame(room.players.length);
        room.game.playerIds = [...room.players]; // Store IDs to identifying CPUs
        room.status = 'PLAYING';
        return room.game;
    }
    return null;
};

export const getRoom = (roomId) => rooms[roomId];

export const leaveRoom = (socketId) => {
    for (const id in rooms) {
        const room = rooms[id];
        const index = room.players.indexOf(socketId);
        if (index !== -1) {
            room.players.splice(index, 1);
            if (room.players.length === 0) {
                delete rooms[id];
            }
            return id;
        }
    }
    return null;
};
