import React from 'react';

const RoundSummary = ({ stats, onClose }) => {
    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000
        }}>
            <div className="summary-content" style={{
                background: '#1a1a1a', padding: '40px', borderRadius: '20px', border: '1px solid #444',
                color: 'white', maxWidth: '600px', width: '90%', textAlign: 'center', boxShadow: '0 0 50px rgba(0,0,0,0.8)'
            }}>
                <h1 style={{ color: '#ff9800', marginBottom: '30px', fontSize: '2.5em' }}>Round Summary</h1>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #555', color: '#aaa' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Player</th>
                            <th style={{ padding: '10px' }}>Cards Left</th>
                            <th style={{ padding: '10px' }}>Wins</th>
                            <th style={{ padding: '10px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((s, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>{s.name}</td>
                                <td style={{ padding: '15px' }}>{s.cards}</td>
                                <td style={{ padding: '15px', color: 'lightgreen' }}>{s.wins}</td>
                                <td style={{ padding: '15px' }}>
                                    {s.eliminated ? <span style={{ color: 'red' }}>Eliminated</span> :
                                        (s.cards === 80 ? <span style={{ color: 'gold' }}>WINNER 🏆</span> : 'Active')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button onClick={onClose} style={{
                    background: 'linear-gradient(45deg, #ff9800, #ff5722)', color: 'white', border: 'none',
                    padding: '15px 40px', fontSize: '1.2em', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold',
                    boxShadow: '0 5px 15px rgba(255,87,34,0.4)'
                }}>
                    Next Match ➡️
                </button>
            </div>
        </div>
    );
};

export default RoundSummary;
