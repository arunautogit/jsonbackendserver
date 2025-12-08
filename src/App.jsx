import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Card from './components/Card';
import './index.css';
import { teamColors, teamLogos } from './data/players';

// Connect to Server
// Dynamic URL handling for Local vs GitHub Codespaces
const getSocketUrl = () => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  if (hostname.includes('github.dev') || hostname.includes('gitpod.io')) {
    // Cloud IDEs (GitHub Codespaces) use formatted URLs like 'app-5173.github.dev'
    // We assume the server is on port 3001, so we replace the client port 5173 with 3001
    // Note: You must ensure Port 3001 is "Public" or "Forwarded" in Codespaces ports tab
    return `${protocol}//${hostname.replace('-5173', '-3001')}`;
  }

  // Fallback for local network (e.g. 192.168.x.x:3001)
  return `${protocol}//${hostname}:3001`;
};

const socket = io.connect(getSocketUrl());

function App() {
  const [gameState, setGameState] = useState('LOBBY'); // LOBBY, WAITING, PLAYING...
  const [roomId, setRoomId] = useState('');
  const [inputRoom, setInputRoom] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const [myIndex, setMyIndex] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);

  // Server Game State
  const [serverState, setServerState] = useState(null);

  const playerRefs = useRef([]);

  useEffect(() => {
    socket.on('room_created', (id) => {
      setRoomId(id);
      setGameState('WAITING');
      setMyIndex(0);
    });

    socket.on('player_joined', (count) => {
      setPlayerCount(count);
    });

    socket.on('game_started', (game) => {
      setServerState(game);
      setGameState('PLAYING');
    });

    socket.on('game_update', (game) => {
      setServerState(game);
    });

    socket.on('rooms_list', (rooms) => {
      setAvailableRooms(rooms);
    });

    socket.on('error', (msg) => alert(msg));

    // Initial fetch
    socket.emit('get_rooms');
  }, []);

  const createRoom = () => {
    socket.emit('create_room');
  };

  const joinRoom = (id) => {
    const roomToJoin = id || inputRoom;
    if (roomToJoin !== "") {
      socket.emit('join_room', roomToJoin);
      setRoomId(roomToJoin);
      setGameState('WAITING');
    }
  };

  const startGame = () => {
    if (roomId) socket.emit('start_game', roomId);
  };

  const sendMove = (attribute) => {
    if (roomId) socket.emit('make_move', { roomId, attribute });
  };

  // RENDER LOGIC
  if (gameState === 'LOBBY') {
    return (
      <div className="lobby">
        <h1>IPL Multiplayer</h1>
        <div className="setup-container">
          <div className="actions-row">
            <button onClick={createRoom} className="primary-btn">Create New Room</button>

            <div className="join-manual">
              <input placeholder="Code" onChange={(e) => setInputRoom(e.target.value)} style={{ width: '100px' }} />
              <button onClick={() => joinRoom(null)}>Join</button>
            </div>
          </div>

          <div className="room-list-container" style={{ marginTop: '20px' }}>
            <h3>Available Rooms</h3>
            {availableRooms.length === 0 ? <p>No active rooms.</p> : (
              <div className="room-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {availableRooms.map(r => (
                  <div key={r.id} className="room-item" style={{ background: '#333', padding: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Room <strong>{r.id}</strong> ({r.players}/4)</span>
                    <button onClick={() => joinRoom(r.id)} style={{ background: 'green', padding: '5px 15px' }}>Join</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'WAITING') {
    return (
      <div className="lobby">
        <h1>Room: {roomId}</h1>
        <p>Players Connected: {playerCount}</p>
        {myIndex === 0 && <button onClick={startGame}>Start Game</button>}
        {myIndex !== 0 && <p>Waiting for Host to start...</p>}
      </div>
    );
  }

  if (!serverState) return <div>Loading Game...</div>;

  const { hands, scores, round, activePlayerIndex, feedback, winningStreak, powerModePlayer, revealed } = serverState;

  return (
    <div className={`game-board`}>
      <header>
        <div className="info">Room: {roomId} | Round: {round} | Turn: P{activePlayerIndex + 1}</div>
        <div className="scores">
          {scores.map((s, i) => (
            <span key={i} className={i === activePlayerIndex ? 'active-score' : ''}>
              P{i + 1}: {s} {winningStreak[i] >= 3 ? '🔥' : ''}
            </span>
          ))}
        </div>
      </header>

      <div className="message-area">{feedback}</div>

      <div className="cards-area">
        {hands.map((hand, index) => {
          if (hand.length === 0) return null;

          return (
            <div key={index} className="player-slot">
              <div className="player-label">P{index + 1} ({hand.length})</div>
              <Card
                player={hand[0]}
                isVisible={revealed || (index === activePlayerIndex)}
                isActive={index === activePlayerIndex}
                onSelectAttribute={(attr) => {
                  if (activePlayerIndex === index) {
                    sendMove(attr);
                  }
                }}
                teamColor={teamColors[hand[0].team]}
                teamLogo={teamLogos[hand[0].team]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
