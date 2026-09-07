import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/RegWelcome');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
            <div className="card w-full max-w-lg shadow-xl">
                <h2 className="text-4xl font-bold text-center mb-8 text-accent-1">Pieslēgties</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">{error}</div>}

                    <div>
                        <label className="block text-sm font-semibold text-accent-1 mb-2">E-pasts</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border-2 border-black/30 px-4 py-3 bg-white/90 focus:border-accent-2 focus:outline-none focus:ring-2 focus:ring-accent-2/20 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-accent-1 mb-2">Parole</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border-2 border-black/30 px-4 py-3 bg-white/90 focus:border-accent-2 focus:outline-none focus:ring-2 focus:ring-accent-2/20 transition"
                        />
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <button type="submit" className="btn-primary shadow-lg hover:shadow-2xl">Pieslēgties</button>
                        <a href="/register" className="text-sm text-accent-2 font-semibold hover:text-accent-1 transition">Reģistrēties</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;