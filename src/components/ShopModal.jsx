import React from 'react';

const ShopModal = ({ coins, onClose, onBuy }) => {
    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
        }}>
            <div className="shop-content" style={{
                background: '#222', padding: '30px', borderRadius: '15px', border: '2px solid gold',
                color: 'white', maxWidth: '400px', width: '90%', textAlign: 'center'
            }}>
                <h2 style={{ color: 'gold', marginBottom: '20px' }}>🛒 Item Shop</h2>
                <p style={{ marginBottom: '20px' }}>Your Coins: <span style={{ color: 'gold', fontWeight: 'bold' }}>{coins}</span></p>

                <div className="shop-item" style={itemStyle}>
                    <div>
                        <h3>🦸‍♂️ Power Mode</h3>
                        <p style={{ fontSize: '0.8em', color: '#aaa' }}>Instantly trigger 3-win streak power (Steal 2 cards).</p>
                    </div>
                    <button onClick={() => onBuy('power', 50)} disabled={coins < 50} style={coins < 50 ? disabledBtn : buyBtn}>
                        50 🪙
                    </button>
                </div>

                <div className="shop-item" style={itemStyle}>
                    <div>
                        <h3>🕵️ Spy Mode</h3>
                        <p style={{ fontSize: '0.8em', color: '#aaa' }}>Convert a card to Spy Card immediately.</p>
                    </div>
                    <button onClick={() => onBuy('spy', 100)} disabled={coins < 100} style={coins < 100 ? disabledBtn : buyBtn}>
                        100 🪙
                    </button>
                </div>

                <button onClick={onClose} style={{ marginTop: '20px', background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Close</button>
            </div>
        </div>
    );
};

const itemStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#333', padding: '15px', marginBottom: '10px', borderRadius: '8px'
};

const buyBtn = {
    background: 'gold', color: 'black', fontWeight: 'bold', border: 'none',
    padding: '10px 15px', borderRadius: '5px', cursor: 'pointer'
};

const disabledBtn = {
    background: '#555', color: '#888', fontWeight: 'bold', border: 'none',
    padding: '10px 15px', borderRadius: '5px', cursor: 'not-allowed'
};

export default ShopModal;
