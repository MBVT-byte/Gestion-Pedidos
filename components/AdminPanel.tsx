import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import * as dataService from '../services/dataService';

interface AdminPanelProps {
    onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'trabajador' | 'cliente'>('trabajador');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [resettingUser, setResettingUser] = useState<any | null>(null);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        setUsers(dataService.getUsers());
    }, []);

    const updateUserStorage = (updatedUsers: any[]) => {
        setUsers(updatedUsers);
        dataService.saveUsers(updatedUsers);
    }

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!name || !email || !password) {
            setError('Nombre, email y contraseña son obligatorios.');
            return;
        }
        if (users.some(u => u.email === email)) {
            setError('Este email ya está registrado.');
            return;
        }

        const newUser = {
            id: `user-${Date.now()}`,
            name,
            email,
            password,
            role,
            avatar: ''
        };
        const updatedUsers = [...users, newUser];
        updateUserStorage(updatedUsers);
        setSuccess(`Usuario '${name}' añadido con el rol de ${role}.`);
        setName('');
        setEmail('');
        setPassword('');
    };

    const handleDeleteUser = (userId: string) => {
        if(window.confirm("¿Está seguro de que desea eliminar este usuario?")) {
            const userToDelete = users.find(u => u.id === userId);
            if (userToDelete?.role === 'superadmin') {
                alert("No se puede eliminar al superadministrador.");
                return;
            }
            const updatedUsers = users.filter(u => u.id !== userId);
            updateUserStorage(updatedUsers);
            setSuccess(`Usuario eliminado con éxito.`);
        }
    }

    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resettingUser || !newPassword) return;

        const updatedUsers = users.map(u => {
            if (u.id === resettingUser.id) {
                return { ...u, password: newPassword };
            }
            return u;
        });

        updateUserStorage(updatedUsers);
        setSuccess(`Contraseña para '${resettingUser.email}' actualizada con éxito.`);
        setResettingUser(null);
        setNewPassword('');
        setError('');
    };


    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-[#bfa86b]">Panel de Administración</h1>
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Volver</button>
            </div>
            
            <div className="bg-[#233140] p-6 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-semibold text-[#bfa86b] mb-4">Añadir Nuevo Usuario</h2>
                <form onSubmit={handleAddUser} className="space-y-4">
                     <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full bg-[#2c3e50] border border-[#bfa86b] rounded p-2 text-white"
                        required
                    />
                     <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email del usuario"
                        className="w-full bg-[#2c3e50] border border-[#bfa86b] rounded p-2 text-white"
                        required
                    />
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Contraseña temporal"
                        className="w-full bg-[#2c3e50] border border-[#bfa86b] rounded p-2 text-white"
                        required
                    />
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value as 'trabajador' | 'cliente')}
                        className="w-full bg-[#2c3e50] border border-[#bfa86b] rounded p-2 text-white"
                    >
                        <option value="trabajador">Trabajador</option>
                        <option value="cliente">Cliente</option>
                    </select>
                    <button type="submit" className="w-full bg-[#bfa86b] hover:bg-[#a89158] text-[#2c3e50] font-bold py-2 px-4 rounded-lg">
                        Añadir Usuario
                    </button>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    {success && <p className="text-green-500 text-sm text-center">{success}</p>}
                </form>
            </div>

            {resettingUser && (
                <div className="bg-[#233140] p-6 rounded-xl shadow-2xl">
                    <h2 className="text-2xl font-semibold text-[#bfa86b] mb-4">Restablecer Contraseña para {resettingUser.email}</h2>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Nueva contraseña"
                            className="w-full bg-[#2c3e50] border border-[#bfa86b] rounded p-2 text-white"
                            required
                        />
                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => { setResettingUser(null); setNewPassword(''); }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
                                Cancelar
                            </button>
                            <button type="submit" className="bg-[#bfa86b] hover:bg-[#a89158] text-[#2c3e50] font-bold py-2 px-4 rounded-lg">
                                Guardar Nueva Contraseña
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-[#233140] p-6 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-semibold text-[#bfa86b] mb-4">Lista de Usuarios</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {users.map(user => (
                        <div key={user.id} className="flex items-center justify-between bg-[#2c3e50] p-3 rounded-lg">
                            <div className="flex items-center">
                                <Avatar src={user.avatar} alt={user.name} className="w-10 h-10 mr-4" />
                                <div>
                                    <p className="font-bold text-white">{user.name} <span className="text-sm text-gray-400">({user.email})</span></p>
                                    <p className="text-sm text-[#bfa86b] capitalize">{user.role}</p>
                                </div>
                            </div>
                            {user.role !== 'superadmin' && (
                                <div className="flex gap-2">
                                    <button onClick={() => setResettingUser(user)} className="text-blue-400 hover:text-blue-300 font-bold px-3 py-1 text-sm">Restablecer Contraseña</button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-400 font-bold px-3 py-1 text-sm">Eliminar</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AdminPanel;