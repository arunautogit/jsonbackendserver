import React, { useEffect, useState } from 'react';

const Dashboard = ({ user, onPlayCpu, onPlayRoom, onLogout, onOpenShop }) => {
    // Generate simple avatar text
    const avatarLetter = user?.name ? user.name[0].toUpperCase() : 'P';
    const bgCards = Array.from({ length: 10 }); // 10 floating cards

    return (
        <div className="dashboard-container" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh',
            background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', color: 'white', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            position: 'relative', overflow: 'hidden'
        }}>
            {/* Background Animation Layer */}
            {bgCards.map((_, i) => (
                <div key={i} className="bg-card" style={{
                    position: 'absolute', width: '100px', height: '150px', background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                    left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                    animation: `float ${5 + Math.random() * 10}s infinite linear`,
                    zIndex: 0
                }} />
            ))}

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
                    50% { opacity: 0.5; }
                    100% { transform: translateY(-100px) rotate(20deg); opacity: 0.3; }
                }
            `}</style>

            <div style={{ zIndex: 10, textAlign: 'center' }}>
                <div className="profile-header" style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(45deg, gold, orange)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3em', fontWeight: 'bold',
                        marginBottom: '10px', boxShadow: '0 0 20px gold', color: '#333'
                    }}>
                        {avatarLetter}
                    </div>
                    <h1 style={{ fontSize: '3em', marginBottom: '5px', textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
                        {user?.name || 'Player'}
                    </h1>
                    <div className="stats-row" style={{ display: 'flex', gap: '20px', background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '50px' }}>
                        <span>🪙 Coins: <strong>{user?.coins || 0}</strong></span>
                        <span>🏆 Wins: <strong>{user?.wins || 0}</strong></span>
                    </div>
                </div>

                <div className="game-modes" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '50px' }}>
                    <div onClick={onPlayCpu} className="mode-card" style={cardStyle}>
                        <div style={{ fontSize: '5em', marginBottom: '20px' }}>🤖</div>
                        <h2 style={{ fontSize: '2em', marginBottom: '10px' }}>Play vs CPU</h2>
                        <p style={{ textAlign: 'center', opacity: 0.7 }}>Solo mode. You vs 3 AI opponents.</p>
                    </div>

                    <div onClick={onPlayRoom} className="mode-card" style={cardStyle}>
                        <div style={{ fontSize: '5em', marginBottom: '20px' }}>🌍</div>
                        <h2 style={{ fontSize: '2em', marginBottom: '10px' }}>Play in Room</h2>
                        <p style={{ textAlign: 'center', opacity: 0.7 }}>Join friends or public lobbies.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <button onClick={onOpenShop} style={{
                        background: 'gold', border: 'none', color: 'black', fontWeight: 'bold',
                        padding: '10px 30px', borderRadius: '30px', cursor: 'pointer', fontSize: '1em', transition: 'all 0.3s'
                    }}>
                        🛒 Shop
                    </button>

                    <button onClick={onLogout} style={{
                        background: 'transparent', border: '1px solid #ff5722', color: '#ff5722',
                        padding: '10px 30px', borderRadius: '30px', cursor: 'pointer', fontSize: '1em', transition: 'all 0.3s'
                    }}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Hover Effects inlined */}
            <style>{`
                .mode-card:hover {
                    transform: translateY(-10px);
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    box-shadow: 0 0 25px rgba(0, 255, 255, 0.2) !important;
                }
            `}</style>
        </div>
    );
};

const cardStyle = {
    width: '300px', height: '400px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'pointer',
    transition: 'all 0.3s ease', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
}

export default Dashboard;

