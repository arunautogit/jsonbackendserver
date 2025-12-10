import React, { useState } from 'react';

const LandingPage = ({ onLogin, apiUrl }) => {
    // Default directly to auth/login as requested
    const [step, setStep] = useState('auth');
    const [authMode, setAuthMode] = useState('login'); // Default login
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = authMode === 'register' ? '/api/register' : '/api/login';
        const payload = authMode === 'register'
            ? { name, email, country }
            : { email };

        try {
            // Determine full URL. If apiUrl is provided, use it, else relative (assuming proxy or same host)
            // But API is on 3001, Frontend usually 5173. So we likely need the full URL from App.jsx or defaults.
            const url = `${apiUrl}${endpoint}`;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                // If login fails with "User not found", suggest registering?
                // For now just error.
                throw new Error(data.error || 'Request failed');
            }

            // Success
            onLogin(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Removed the "step === connect" block entirely to default to the form view
    // if (step === 'connect') { ... }

    return (
        <div className="landing-container center-view">
            <div className="auth-card">
                <h2>{authMode === 'register' ? 'New Player Registration' : 'Player Login'}</h2>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {authMode === 'register' && (
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Player Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {authMode === 'register' && (
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Country"
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : (authMode === 'register' ? 'REGISTER' : 'LOGIN')}
                    </button>
                </form>

                <div className="toggle-auth">
                    {authMode === 'register' ? (
                        <p>Already have an account? <span onClick={() => setAuthMode('login')}>Login here</span></p>
                    ) : (
                        <p>First time? <span onClick={() => setAuthMode('register')}>Register here</span></p>
                    )}
                </div>
            </div>
            <style>{`
                .center-view {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background: #000;
                    color: white;
                    font-family: sans-serif;
                    background-image: radial-gradient(circle at 50% 50%, #202020 0%, #000 100%);
                    overflow: hidden;
                    position: relative;
                }
                .title {
                    font-size: 4em;
                    font-weight: 900;
                    letter-spacing: 5px;
                    background: linear-gradient(45deg, #ff9800, #ff5722);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 0;
                    z-index: 2;
                }
                .subtitle {
                    font-size: 1.5em;
                    color: #aaa;
                    margin-bottom: 40px;
                    z-index: 2;
                }
                .connect-btn {
                    padding: 15px 50px;
                    font-size: 1.5em;
                    background: transparent;
                    color: #ff9800;
                    border: 2px solid #ff9800;
                    border-radius: 50px;
                    cursor: pointer;
                    transition: all 0.3s;
                    z-index: 2;
                    text-transform: uppercase;
                    font-weight: bold;
                    box-shadow: 0 0 20px rgba(255, 152, 0, 0.3);
                }
                .connect-btn:hover {
                    background: #ff9800;
                    color: black;
                    box-shadow: 0 0 50px rgba(255, 152, 0, 0.8);
                }
                .auth-card {
                    background: rgba(30, 30, 30, 0.9);
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                    width: 100%;
                    max-width: 400px;
                    border: 1px solid #333;
                    z-index: 2;
                }
                .auth-card h2 {
                    text-align: center;
                    margin-bottom: 30px;
                    color: #fff;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group input {
                    width: 100%;
                    padding: 12px;
                    background: #111;
                    border: 1px solid #444;
                    color: white;
                    border-radius: 5px;
                    font-size: 1em;
                }
                .form-group input:focus {
                    outline: none;
                    border-color: #ff9800;
                }
                .submit-btn {
                    width: 100%;
                    padding: 12px;
                    background: #ff9800;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 1.1em;
                    cursor: pointer;
                    font-weight: bold;
                }
                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .toggle-auth {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 0.9em;
                    color: #888;
                }
                .toggle-auth span {
                    color: #ff9800;
                    cursor: pointer;
                    text-decoration: underline;
                }
                .glow-circle {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(255,152,0,0.1) 0%, rgba(0,0,0,0) 70%);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1;
                }
                .error-msg {
                    background: rgba(255, 0, 0, 0.2);
                    color: #ff5555;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    text-align: center;
                    border: 1px solid rgba(255, 0, 0, 0.3);
                }
           `}</style>
        </div>
    );
};

export default LandingPage;
