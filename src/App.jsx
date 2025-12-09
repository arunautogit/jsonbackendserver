import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Card from './components/Card';
import './index.css';
import { teamColors, teamLogos } from './data/players';

// Connect to Server
// Dynamic URL handling for Local vs GitHub Codespaces
const getSocketUrl = () => {
  // If running in a codespace or similar cloud/proxy env
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port } = window.location;

    // If we are on a standard localhost with port (e.g. localhost:5173)
    // We want to target localhost:3001
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:3001`;
    }

    // If we are on codespaces (e.g. fuzzy-space-waffle-5173.github.dev)
    // We typically want fuzzy-space-waffle-3001.github.dev
    // We can attempt to replace the port number in the hostname if present
    if (hostname.includes('-5173')) {
      return `${protocol}//${hostname.replace('-5173', '-3001')}`;
    }
  }

  // Fallback
  return `http://localhost:3001`;
};

const socket = io.connect(getSocketUrl());

function App() {
  const [gameState, setGameState] = useState('LOBBY'); // LOBBY, WAITING, PLAYING...
  const [roomId, setRoomId] = useState('');
  const [inputRoom, setInputRoom] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const [myIndex, setMyIndex] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);

  // Debug State
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [socketUrl, setSocketUrl] = useState(getSocketUrl());

  // Server Game State
  const [serverState, setServerState] = useState(null);

  const playerRefs = useRef([]);

  const [showCpuPrompt, setShowCpuPrompt] = useState(false);

  useEffect(() => {
    // Debug Listeners
    socket.on('connect', () => setConnectionStatus('Connected'));
    socket.on('disconnect', () => setConnectionStatus('Disconnected'));
    socket.on('connect_error', (err) => {
      setConnectionStatus(`Error: ${err.message}`);
      console.error("Socket Error:", err);
    });

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
      setShowCpuPrompt(false);
    });

    socket.on('game_update', (game) => {
      setServerState(game);
    });

    socket.on('rooms_list', (rooms) => {
      setAvailableRooms(rooms);
    });

    socket.on('suggest_cpu', () => {
      setShowCpuPrompt(true);
    });

    socket.on('error', (msg) => alert(msg));

    // Initial fetch
    socket.emit('get_rooms');

    // Check connection immediately
    if (socket.connected) setConnectionStatus('Connected');
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
      // We don't know myIndex yet until game starts or we ask, 
      // but strictly we can infer from connection order or just wait for game start
      // For now, only Host knows he is host (index 0 usually). 
      // Actually, myIndex isn't strictly set for joiners in Lobby.
      // We need to set myIndex when game starts.
    }
  };

  const addCpu = () => {
    if (roomId) socket.emit('add_cpu', roomId);
    setShowCpuPrompt(false);
  };

  const startGame = () => {
    if (roomId) socket.emit('start_game', roomId);
  };


  const sendMove = (attribute) => {
    if (roomId) socket.emit('make_move', { roomId, attribute });
  };

  const handleNextTurn = () => {
    if (roomId) socket.emit('next_turn', roomId);
  };

  // Determine My Index correctly on Game Start if not set
  useEffect(() => {
    if (serverState && serverState.playerIds && socket.id) {
      const idx = serverState.playerIds.indexOf(socket.id);
      if (idx !== -1 && myIndex !== idx) {
        setMyIndex(idx);
        console.log("Set My Index to:", idx);
      }
    }
  }, [serverState, socket.id, myIndex]);

  // Helper to calculate position class
  const getPositionClass = (index, totalPlayers) => {
    // If we don't know myIndex, assume we are P0 (or spectator view)
    const pivot = myIndex !== null ? myIndex : 0;

    // Calculate relative index (0 to total-1)
    // relative 0 = Me (Bottom)
    // relative 1 = Right (if 4) or Top (if 2)

    let relative = (index - pivot + totalPlayers) % totalPlayers;

    if (totalPlayers === 2) {
      if (relative === 0) return 'bottom';
      return 'top';
    }

    if (totalPlayers === 3) {
      if (relative === 0) return 'bottom';
      if (relative === 1) return 'right'; // or top-right
      return 'left';
    }

    if (totalPlayers >= 4) {
      if (relative === 0) return 'bottom';
      if (relative === 1) return 'left';
      if (relative === 2) return 'top';
      if (relative === 3) return 'right';
    }

    return 'bottom';
  };

  // RENDER LOGIC
  if (gameState === 'LOBBY') {
    return (
      <div className="lobby">
        <h1>IPL Multiplayer</h1>

        <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '20px', padding: '10px', background: '#222', borderRadius: '5px' }}>
          <p style={{ margin: '2px 0' }}><strong>Status:</strong> <span style={{ color: connectionStatus === 'Connected' ? 'lightgreen' : 'red', fontWeight: 'bold' }}>{connectionStatus}</span></p>
          <p style={{ margin: '2px 0' }}><strong>Server:</strong> {socketUrl}</p>
          {connectionStatus !== 'Connected' && (
            <p style={{ color: 'orange', fontSize: '11px', marginTop: '5px' }}>
              Codespaces Note: Ensure Port 3001 is <strong>PUBLIC</strong> in Ports tab.
            </p>
          )}
        </div>

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

        {showCpuPrompt && (
          <div style={{ background: '#444', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
            <p>Waiting for a while? Add a CPU?</p>
            <button onClick={addCpu} style={{ background: '#ff9800' }}>Add CPU Player</button>
          </div>
        )}

        {/* Helper for testing CPU immediately */}
        <div style={{ marginTop: '20px', fontSize: '0.8em' }}>
          <button onClick={addCpu} style={{ background: '#555', padding: '5px' }}>+ CPU (Debug)</button>
        </div>

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

      <div className="battle-arena">
        <div className="message-area">
          {feedback}
          {revealed && (
            <div style={{ marginTop: '10px' }}>
              <button className="next-turn-btn" onClick={handleNextTurn}>Next Turn ➡️</button>
            </div>
          )}
        </div>

        {hands.map((hand, index) => {
          if (hand.length === 0) return null; // Or show empty slot?

          const posClass = getPositionClass(index, hands.length); // Assuming standard 4 slots or dynamic?
          // Hands length is constant usually (e.g. 2 or 4) if initialized.
          // But if players drop, we might need robust count.

          return (
            <div key={index} className={`player-position ${posClass}`}>
              <div className="player-label">P{index + 1} ({hand.length})</div>
              <Card
                player={hand[0]}
                isVisible={revealed || (index === activePlayerIndex) || (index === myIndex)} // Show my card always? Usually yes.
                isActive={index === activePlayerIndex}
                onSelectAttribute={(attr) => {
                  if (activePlayerIndex === index) { // Only if active
                    // And if it is MY turn (check myIndex)
                    // For now we allow hotseat moves if myIndex is not strictly enforced
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
