import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Client, User } from '../types';
import DunaCanariasJewelryLogo from '../assets/DunaCanariasJewelryLogo';
import Avatar from './Avatar';

type View = 'DASHBOARD' | 'ORDER_GENERATOR' | 'CLIENT_MANAGER' | 'CLIENT_DETAIL' | 'ADMIN_PANEL' | 'PROFILE' | 'ORDER_HISTORY' | 'CLIENT_ORDER_HISTORY';

interface DashboardProps {
    onNavigate: (view: View, client?: Client) => void;
    user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user }) => {
    const { logout } = useAuth();

    let menuItems: { name: string; icon: string; view: View }[] = [];

    if (user.role === 'cliente') {
        menuItems = [
            { name: 'Mi Ficha', icon: '👤', view: 'CLIENT_DETAIL' },
            { name: 'Generar Pedido', icon: '🧾', view: 'ORDER_GENERATOR' },
            { name: 'Historial de Pedidos', icon: '📊', view: 'CLIENT_ORDER_HISTORY' },
        ];
    } else {
        menuItems = [
            { name: 'Generador de Pedido', icon: '🧾', view: 'ORDER_GENERATOR' },
            { name: 'Fichas de Cliente', icon: '👥', view: 'CLIENT_MANAGER' },
        ];
        if (user.role === 'superadmin' || user.role === 'trabajador') {
            menuItems.push({ name: 'Histórico de Pedidos', icon: '📊', view: 'ORDER_HISTORY' });
        }
        if (user.role === 'superadmin') {
            menuItems.push({ name: 'Panel de Administración', icon: '⚙️', view: 'ADMIN_PANEL' });
        }
    }


    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-white">
            <header className="absolute top-4 right-4 flex items-center gap-4">
                 <div className="flex items-center gap-3">
                    <Avatar src={user.avatar} alt={user.name} className="w-10 h-10" />
                    <span className="text-sm text-gray-300 hidden sm:block">{user.name} ({user.email})</span>
                 </div>
                 {user.role !== 'cliente' && (
                    <button onClick={() => onNavigate('PROFILE')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Mi Perfil
                    </button>
                 )}
                 <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Salir
                </button>
            </header>
            
            <DunaCanariasJewelryLogo className="w-full max-w-[180px] text-[#bfa86b] mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-[#bfa86b] mb-2">Bienvenido, {user.name}</h1>
            <p className="text-lg text-gray-300 mb-12">Seleccione una opción para continuar</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                {menuItems.map(item => (
                    <button
                        key={item.name}
                        onClick={() => onNavigate(item.view)}
                        className="bg-[#233140] p-6 rounded-xl shadow-lg hover:shadow-2xl hover:bg-[#2c3e50] border border-transparent hover:border-[#bfa86b] transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center"
                    >
                        <span className="text-5xl mb-4">{item.icon}</span>
                        <h2 className="text-xl font-semibold text-[#bfa86b]">{item.name}</h2>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;