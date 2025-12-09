import { initializeGame, playTurn } from './gameLogic.js';

export const rooms = {}; // { roomId: { players: [socketIds], game: gameState } }

export const createRoom = (hostSocketId, playerName) => {
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    rooms[roomId] = {
        players: [hostSocketId],
        playerNames: { [hostSocketId]: playerName || 'Player 1' },
        game: null,
        status: 'LOBBY',
        createdAt: Date.now()
    };
    return roomId;
};

export const joinRoom = (roomId, socketId, playerName) => {
    const room = rooms[roomId];
    if (room && room.status === 'LOBBY' && room.players.length < 4) {
        room.players.push(socketId);
        room.playerNames[socketId] = playerName || `Player ${room.players.length}`;
        return true;
    }
    return false;
};

export const addCpu = (roomId) => {
    const room = rooms[roomId];
    if (room && room.status === 'LOBBY' && room.players.length < 4) {
        const cpuId = `CPU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        room.players.push(cpuId);
        room.playerNames[cpuId] = `CPU ${room.players.length}`;
        return true;
    }
    return false;
};

export const startGame = (roomId) => {
    const room = rooms[roomId];
    if (room) {
        // Create ordered list of names based on players array order
        const namesList = room.players.map(id => room.playerNames[id]);
        room.game = initializeGame(room.players.length, namesList);
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
