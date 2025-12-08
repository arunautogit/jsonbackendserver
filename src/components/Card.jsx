import React from 'react';
import './Card.css';

const Card = ({ player, isVisible, isActive, onSelectAttribute, disabled, teamColor }) => {
    if (!player) return <div className="card-placeholder"></div>;

    return (
        <div
            className={`card ${isVisible ? 'visible' : 'hidden'} ${isActive ? 'active' : ''}`}
        >
            <div className="card-back">
                <div className="logo">IPL CARD GAME</div>
            </div>
            <div className="card-front" style={{ background: teamColor }}>
                <div className="card-header">
                    <span className="rank">#{player.id}</span>
                    <span className="team">{player.team.split(' ').map(w => w[0]).join('')}</span>
                </div>
                <div className="card-image-container">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(player.name)}&clothing=graphicShirt`}
                        alt={player.name}
                        className="player-image"
                    />
                    <div className="player-name">{player.name}</div>
                    <div className="player-role">{player.role}{player.isOverseas ? ' ✈️' : ''}</div>
                </div>
                <div className="stats-container">
                    {Object.entries(player.stats).map(([key, value]) => (
                        <button
                            key={key}
                            className={`stat-row ${key}`}
                            onClick={() => !disabled && onSelectAttribute && onSelectAttribute(key)}
                            disabled={disabled}
                        >
                            <span className="stat-label">{key.toUpperCase()}</span>
                            <span className="stat-value">
                                {key === 'price' ? `₹${value} Cr` : value}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Card;
