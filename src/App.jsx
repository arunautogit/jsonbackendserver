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

// Simple Modal Component
const NameInputModal = ({ onConfirm }) => {
  const [name, setName] = useState('');
  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
    }}>
      <div className="modal-content" style={{
        background: '#333', padding: '40px', borderRadius: '15px', textAlign: 'center', border: '1px solid #555',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)', maxWidth: '90%'
      }}>
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>Enter Your Name</h2>
        <input
          autoFocus
          placeholder="Player Name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onConfirm(name); }}
          style={{
            padding: '15px', fontSize: '1.2em', textAlign: 'center',
            width: '100%', marginBottom: '20px', borderRadius: '8px', border: 'none', background: '#222', color: 'white'
          }}
        />
        <button
          onClick={() => { if (name.trim()) onConfirm(name); }}
          disabled={!name.trim()}
          style={{
            padding: '12px 30px', fontSize: '1.1em', background: '#ff5722', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
          }}
        >
          Enter Game 🚀
        </button>
      </div>
    </div>
  );

};

// Spy Hero Tab Component
const SpyHeroTab = ({ hands, playerNames, spyState, onClose, myIndex }) => {
  if (!spyState.active || spyState.holderIndex === null) return null;

  const holderName = playerNames[spyState.holderIndex] || `Player ${spyState.holderIndex + 1}`;
  const holderHand = hands[spyState.holderIndex];
  const isHoldingSelf = spyState.holderIndex === myIndex;

  return (
    <div className="spy-hero-tab" style={{
      position: 'fixed', bottom: '20px', right: '20px', width: '300px',
      background: '#1a1a1a', border: '2px solid gold', borderRadius: '10px',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)', zIndex: 1500, overflow: 'hidden'
    }}>
      <div className="tab-header" style={{
        background: 'gold', color: 'black', padding: '10px', fontWeight: 'bold',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>🕵️ Spy Eye: {isHoldingSelf ? "You" : holderName}</span>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>▼</button>
      </div>
      <div className="tab-content" style={{ padding: '10px', maxHeight: '400px', overflowY: 'auto' }}>
        {isHoldingSelf ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#aaa', fontStyle: 'italic' }}>
            <p>You currently hold the Spy Card!</p>
            <p>If you lose this card, you will see the new owner's hand here.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.8em', color: '#aaa', marginBottom: '10px' }}>Viewing {holderName}'s Hand ({holderHand.length})</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              {holderHand.map((card, idx) => (
                <div key={idx} style={{
                  background: '#333', padding: '5px', borderRadius: '4px', fontSize: '0.7em',
                  borderLeft: `3px solid ${teamColors[card.team] || '#555'}`
                }}>
                  <div style={{ fontWeight: 'bold', color: 'white' }}>{card.name}</div>
                  <div style={{ color: '#ccc' }}>{card.role}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
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

  const [playerName, setPlayerName] = useState('');

  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [showCpuPrompt, setShowCpuPrompt] = useState(false);
  const [showHeroTab, setShowHeroTab] = useState(true); // Toggle for spy tab

  // Steal Logic State
  const [stealTarget, setStealTarget] = useState(null);
  const [stealSelection, setStealSelection] = useState([]);
  const [isTransferring, setIsTransferring] = useState(false);

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
      console.log("[CLIENT] Received game_started", game);
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
    if (!playerName) return alert("Enter Name!");
    socket.emit('create_room', playerName);
  };

  const joinRoom = (id) => {
    if (!playerName) return alert("Enter Name!");
    const roomToJoin = id || inputRoom;
    if (roomToJoin !== "") {
      socket.emit('join_room', { roomId: roomToJoin, playerName });
      setRoomId(roomToJoin);
      setGameState('WAITING');
    }
  };

  const addCpu = () => {
    if (roomId) socket.emit('add_cpu', roomId);
    setShowCpuPrompt(false);
  };

  const dropGame = () => {
    if (confirm("Drop game? Cards will be distributed.")) {
      socket.emit('drop_game', roomId);
      setGameState('LOBBY');
      setServerState(null);
      setPlayerCount(0);
      setMyIndex(null);
      setRoomId('');
    }
  };

  const startGame = () => {
    if (roomId) socket.emit('start_game', roomId);
  };

  const activateSpy = () => {
    if (roomId) socket.emit('activate_spy', { roomId });
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

  // Reset local steal state if server steal state clears (and not transferring)
  useEffect(() => {
    if (!serverState?.stealState?.active && !isTransferring) {
      setStealTarget(null);
      setStealSelection([]);
    }
  }, [serverState?.stealState?.active, isTransferring]);

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

        {!nameConfirmed && (
          <NameInputModal onConfirm={(name) => {
            setPlayerName(name);
            setNameConfirmed(true);
          }} />
        )}

        {nameConfirmed && <h2 style={{ color: '#aaa', marginTop: '-10px' }}>Welcome, {playerName}</h2>}

        <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '20px', padding: '10px', background: '#222', borderRadius: '5px', marginTop: '20px' }}>
          <p style={{ margin: '2px 0' }}><strong>Status:</strong> <span style={{ color: connectionStatus === 'Connected' ? 'lightgreen' : 'red', fontWeight: 'bold' }}>{connectionStatus}</span></p>
          <p style={{ margin: '2px 0' }}><strong>Server:</strong> {socketUrl}</p>
          {connectionStatus !== 'Connected' && (
            <p style={{ color: 'orange', fontSize: '11px', marginTop: '5px' }}>
              Network Note: Ensure Port 3001 is mapped/public if remote.
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

  if (gameState === 'PLAYING') console.log("[CLIENT] Rendering PLAYING state. ServerState:", !!serverState);

  if (!serverState) return <div>Loading Game...</div>;

  const { hands, scores, round, activePlayerIndex, feedback, winningStreak, powerModePlayer, revealed, playerNames, droppedPlayers, stealState, spyState } = serverState;

  // Hooks moved to top
  // const [stealTarget... etc] were here
  // useEffect was here

  const handleStealSubmit = () => {
    if (stealTarget !== null && stealSelection.length === 2 && roomId) {
      setIsTransferring(true);
      // Wait for animation then emit
      setTimeout(() => {
        socket.emit('steal_move', {
          roomId,
          targetIndex: stealTarget,
          cardIndices: stealSelection
        });
        setIsTransferring(false);
      }, 1000); // 1s animation
    }
  };

  // Use names if available, else fallback
  const getPlayerName = (idx) => {
    if (playerNames && playerNames[idx]) return playerNames[idx];
    return `P${idx + 1}`;
  };

  return (
    <div className={`game-board`}>
      <button className="drop-btn" onClick={dropGame}>Drop Game ❌</button>

      {/* Spy Activation Button (Main View) */}
      {!spyState?.active && hands[myIndex]?.length >= 25 && (
        <button onClick={activateSpy} style={{
          position: 'fixed', top: '50px', left: '10px',
          background: 'gold', color: 'black', border: '2px solid white',
          zIndex: 200, fontWeight: 'bold', padding: '8px 12px'
        }}>
          Activate Spy Mode 🕵️
        </button>
      )}

      <header>
        <div className="info">Room: {roomId} | Round: {round} | Turn: {getPlayerName(activePlayerIndex)}</div>
        <div className="scores">
          {scores.map((s, i) => (
            <span key={i} className={i === activePlayerIndex ? 'active-score' : ''}>
              {getPlayerName(i)}: {s} {winningStreak[i] >= 3 ? '🔥' : ''} {droppedPlayers && droppedPlayers[i] ? '(Left)' : ''}
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
          if (hand.length === 0 && (!droppedPlayers || !droppedPlayers[index])) return null; // Show empty if dropped? Or hide?
          // If dropped, maybe show a "Dropped" placeholder or just nothing.
          if (droppedPlayers && droppedPlayers[index]) return null;

          const isStealer = stealState?.active && stealState.stealer === index;
          const posClass = getPositionClass(index, hands.length);

          // Spy Mode Calculations
          const progress = Math.min((hand.length / 25) * 100, 100);
          const isSpyMaker = spyState?.active && spyState.makerIndex === index;

          return (
            <div key={index} className={`player-position ${posClass} ${isStealer ? 'stealer-active' : ''}`}>
              {/* Loader Circle */}
              <div className="avatar-container" style={{ position: 'relative', display: 'inline-block' }}>
                <svg viewBox="0 0 36 36" className="circular-chart" style={{ width: '80px', height: '80px', transform: 'rotate(-90deg)' }}>
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#444" strokeWidth="2" />
                  <path className="circle"
                    strokeDasharray={`${progress}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isSpyMaker ? "gold" : "#ff5722"}
                    strokeWidth="3"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div className="player-avatar" style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '60px', height: '60px', borderRadius: '50%', background: '#333',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2em', overflow: 'hidden'
                }}>
                  {isSpyMaker ? '🕵️' : '👤'}
                </div>
              </div>

              <div className="player-label">{getPlayerName(index)} ({hand.length})</div>
              <Card
                player={hand[0]}
                isVisible={revealed || (index === activePlayerIndex) || (index === myIndex)} // Show my card always? Usually yes.
                isActive={index === activePlayerIndex}
                // Check if this card is the Spy Card AND I am the Spy Maker
                isSpyCard={spyState?.active && spyState.cardId === hand[0].id && spyState.makerIndex === myIndex}
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
      {/* Steal Mode Overlay */}
      {stealState?.active && stealState.stealer === myIndex && (
        <div className="steal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', color: 'white'
        }}>
          <h2 className="pulse-text">🔥 Steal Mode Active! 🔥</h2>
          <p>Select a player and choose 2 cards to steal!</p>

          {!stealTarget && (
            <div className="target-selection" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              {hands.map((h, idx) => {
                if (idx === myIndex || (droppedPlayers && droppedPlayers[idx]) || h.length === 0) return null;
                return (
                  <button key={idx} onClick={() => setStealTarget(idx)} style={{
                    padding: '20px', background: '#d32f2f', color: 'white', border: '2px solid white', borderRadius: '10px', cursor: 'pointer'
                  }}>
                    Steal from {getPlayerName(idx)} <br /> ({h.length} Cards)
                  </button>
                );
              })}
            </div>
          )}

          {stealTarget !== null && (
            <div className="card-selection" style={{ textAlign: 'center' }}>
              <h3>Stealing from {getPlayerName(stealTarget)}</h3>
              <p>Select 2 Cards:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px', maxWidth: '600px', margin: '20px auto' }}>
                {hands[stealTarget].map((_, cIdx) => (
                  <div key={cIdx}
                    onClick={() => {
                      if (stealSelection.includes(cIdx)) {
                        setStealSelection(stealSelection.filter(id => id !== cIdx));
                      } else {
                        if (stealSelection.length < 2) setStealSelection([...stealSelection, cIdx]);
                      }
                    }}
                    style={{
                      width: '40px', height: '60px', background: stealSelection.includes(cIdx) ? '#ff5722' : '#555',
                      border: '1px solid white', borderRadius: '4px', cursor: 'pointer',
                      transform: stealSelection.includes(cIdx) ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    <div style={{ width: '100%', height: '100%', background: `repeating-linear-gradient(45deg, #444, #444 5px, #555 5px, #555 10px)` }}></div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px' }}>
                <button onClick={() => setStealTarget(null)} style={{ marginRight: '10px', background: '#777' }}>Back</button>
                <button onClick={handleStealSubmit} disabled={stealSelection.length !== 2} className="primary-btn" style={{ background: 'gold', color: 'black', fontWeight: 'bold' }}>
                  STEAL CARDS! 🥷
                </button>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Animation Layer */}
      {
        isTransferring && (
          <>
            <div className="flying-card" style={{ top: '20%', left: '50%', animation: 'flyToBottom 1s forwards' }}></div>
            <div className="flying-card" style={{ top: '20%', left: '55%', animation: 'flyToBottom 1s forwards 0.2s' }}></div>
            {/* Simple CSS animation keyframe needs to be globally defined or here */}
            <style>{`
                @keyframes flyToBottom {
                    0% { top: 20%; opacity: 1; transform: scale(1); }
                    100% { top: 80%; opacity: 0; transform: scale(0.5); }
                }
            `}</style>
          </>
        )
      }

      {/* Hero Tab for Spy Maker */}
      {spyState?.active && spyState.makerIndex === myIndex && showHeroTab && (
        <SpyHeroTab
          hands={hands}
          playerNames={playerNames}
          spyState={spyState}
          onClose={() => setShowHeroTab(false)}
          myIndex={myIndex}
        />
      )}
      {/* Restore Button if closed */}
      {spyState?.active && spyState.makerIndex === myIndex && !showHeroTab && (
        <button onClick={() => setShowHeroTab(true)} style={{
          position: 'fixed', bottom: '20px', right: '20px',
          background: 'gold', color: 'black', border: 'none', borderRadius: '50%',
          width: '50px', height: '50px', fontSize: '1.5em', cursor: 'pointer', zIndex: 1500,
          boxShadow: '0 0 10px gold'
        }}>
          🕵️
        </button>
      )}

    </div >
  );
}

export default App;
