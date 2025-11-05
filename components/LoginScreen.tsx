import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DunaCanariasJewelryLogo from '../assets/DunaCanariasJewelryLogo';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const success = await login(email, password);
            if (!success) {
                setError('Usuario o contraseña incorrectos.');
            }
        } catch (err) {
            setError('Error al iniciar sesión. Inténtelo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#2c3e50] p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="w-full max-w-[180px] mx-auto mb-6 text-center text-[#bfa86b]">
                    <DunaCanariasJewelryLogo className="w-full h-auto" />
                </div>
                <div className="bg-[#233140] shadow-2xl rounded-lg px-8 pt-6 pb-8 mb-4 max-w-sm mx-auto">
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-[#bfa86b] text-sm font-bold mb-2" htmlFor="email">
                                Usuario
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-[#bfa86b]"
                                id="email"
                                type="email"
                                placeholder="email@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-[#bfa86b] text-sm font-bold mb-2" htmlFor="password">
                                Contraseña
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-[#bfa86b]"
                                id="password"
                                type="password"
                                placeholder="******************"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="text-right mb-6">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert('Para restablecer su contraseña, por favor contacte al administrador: christiansm85@gmail.com');
                                }}
                                className="text-xs text-[#bfa86b] hover:text-[#a89158] transition-colors"
                            >
                                ¿Olvidó su contraseña?
                            </a>
                        </div>
                        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                        <div className="flex items-center justify-between">
                            <button
                                className="bg-[#bfa86b] hover:bg-[#a89158] text-[#2c3e50] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300 disabled:opacity-50"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </div>
                    </form>
                </div>
                 <p className="text-center text-gray-500 text-xs">
                    &copy;2024 Duna Canarias. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;