import { useState } from 'react';
import api from '../api/axios'; 
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // Added for the spinner icon
import eventLogo from '../assets/cei2026f.png';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 1. Add loading state
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true); // 2. Start loading

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
            // Note: We don't need to set isLoading(false) here because we are navigating away
        } catch (err) {
            setError('Invalid Credentials');
            setIsLoading(false); // 3. Stop loading only if there is an error
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
                            disabled={isLoading} // Disable input while loading
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-uaBlue focus:outline-none disabled:bg-gray-100"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            required
                            disabled={isLoading} // Disable input while loading
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-uaBlue focus:outline-none disabled:bg-gray-100"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center font-bold animate-pulse">{error}</p>}

                    <button 
                        type="submit" 
                        disabled={isLoading} // 4. Disable button while loading
                        className="w-full bg-uaBlue text-white font-bold py-3 rounded-lg hover:bg-blue-900 transition duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Signing In...</span>
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}