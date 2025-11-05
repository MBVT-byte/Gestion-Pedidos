import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import * as dataService from '../services/dataService';

interface ProfileProps {
    onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
    const { user, updateUser } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && user) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedUser = { ...user, avatar: reader.result as string };
                updateUser(updatedUser);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            const users = dataService.getUsers();
            if (users && user) {
                const updatedUsers = users.map((u: any) => {
                    if (u.id === user.id) {
                        return { ...u, password: newPassword };
                    }
                    return u;
                });
                dataService.saveUsers(updatedUsers);
                setSuccess('Contraseña actualizada con éxito. Se ha enviado un correo de confirmación a tu email.');
                setNewPassword('');
                setConfirmPassword('');
                console.log(`Simulating sending password change confirmation to ${user.email}`);
            }
        } catch (err) {
            setError('Error al actualizar la contraseña. Inténtelo de nuevo.');
        }
    };

    if (!user) {
        return <div className="text-center text-white">Usuario no encontrado.</div>
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-[#bfa86b]">Mi Perfil</h1>
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Volver</button>
            </div>
            
            <div className="bg-[#233140] p-6 rounded-xl shadow-2xl flex flex-col items-center sm:flex-row gap-6">
                 <div className="relative">
                    <Avatar src={user.avatar} alt={user.name} className="w-32 h-32" />
                    <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 hover:bg-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 5.232z" /></svg>
                    </button>
                    <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />
                 </div>
                 <div className="space-y-2 text-center sm:text-left">
                     <h2 className="text-3xl font-bold text-white">{user.name}</h2>
                     <p className="text-lg text-gray-400">{user.email}</p>
                     <p className="text-md text-[#bfa86b] capitalize bg-[#2c3e50] inline-block px-3 py-1 rounded-full">{user.role}</p>
                 </div>
            </div>

            <div className="bg-[#233140] p-6 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-semibold text-[#bfa86b] mb-4">Cambiar Contraseña</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                     <input 
                        type="password" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Nueva contraseña"
                        className="w-full bg-[#2c3e50] border border-[#bfa86b] rounded p-2 text-white"
                        required
                    />
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar nueva contraseña"
                        className="w-full bg-[#2c3e50] border border-[#bfa86b] rounded p-2 text-white"
                        required
                    />
                    <button type="submit" className="w-full bg-[#bfa86b] hover:bg-[#a89158] text-[#2c3e50] font-bold py-2 px-4 rounded-lg">
                        Actualizar Contraseña
                    </button>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    {success && <p className="text-green-500 text-sm text-center">{success}</p>}
                </form>
            </div>
        </div>
    );
};

export default Profile;