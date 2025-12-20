import { useState } from 'react';
import api from '../api/axios'; 
import { useNavigate } from 'react-router-dom';
import eventLogo from '../assets/cei2026f.png'; // Make sure this path is correct

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { username, password });
            
            // Save token and role
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.user.role);
            localStorage.setItem('name', response.data.user.name);

            // Redirect based on role
            if (response.data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/judge');
            }
        } catch (err) {
            setError('Invalid Credentials');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-uaBlue">
                <div className="text-center mb-8">
                    <img src={eventLogo} alt="Logo" className="h-20 mx-auto mb-4 object-contain" />
                    <h2 className="text-2xl font-bold text-uaBlue">Welcome Panelist</h2>
                    <p className="text-gray-500 text-sm">Please sign in to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input 
                            type="text" 
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-uaBlue focus:outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-uaBlue focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

                    <button 
                        type="submit" 
                        className="w-full bg-uaBlue text-white font-bold py-3 rounded-lg hover:bg-blue-900 transition duration-300 shadow-md"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}