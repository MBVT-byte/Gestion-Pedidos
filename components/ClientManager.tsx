import React, { useState } from 'react';
import { Client, User } from '../types';
import Avatar from './Avatar';
import * as dataService from '../services/dataService';

interface ClientManagerProps {
    onNavigate: (view: 'DASHBOARD' | 'CLIENT_DETAIL', client?: Client) => void;
    clients: Client[];
    updateClients: (clients: Client[]) => void;
    user: User;
}

const ClientForm: React.FC<{ onSave: (clientData: Omit<Client, 'id' | 'deposits' | 'followUps' | 'avatar'>, email?: string) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        clientCode: '', name: '', cif: '', address: '', phone: '', schedule: '', responsiblePerson: ''
    });
    const [email, setEmail] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, email);
    };

    const inputStyle = "bg-[#2c3e50] border border-[#bfa86b] text-white py-2 px-3 rounded-lg";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-[#233140] p-6 rounded-lg">
            <h3 className="text-xl font-bold text-[#bfa86b]">Nuevo Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="clientCode" value={formData.clientCode} onChange={handleChange} placeholder="Código de Cliente *" required className={inputStyle} />
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Cliente *" required className={inputStyle} />
                <input name="cif" value={formData.cif} onChange={handleChange} placeholder="CIF" className={inputStyle} />
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Dirección" className={inputStyle} />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Teléfono de Contacto" className={inputStyle} />
                <input name="schedule" value={formData.schedule} onChange={handleChange} placeholder="Horario" className={inputStyle} />
                <input name="responsiblePerson" value={formData.responsiblePerson} onChange={handleChange} placeholder="Nombre del Responsable" className={inputStyle} />
                 <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email de Acceso (opcional)" className={inputStyle} />
            </div>
            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="bg-[#bfa86b] hover:bg-[#a89158] text-[#2c3e50] font-bold py-2 px-4 rounded-lg transition-colors">Guardar Cliente</button>
            </div>
        </form>
    );
};


const ClientManager: React.FC<ClientManagerProps> = ({ onNavigate, clients, updateClients }) => {
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSaveClient = (newClientData: Omit<Client, 'id' | 'deposits' | 'followUps' | 'avatar'>, email?: string) => {
        const clientId = `client-${Date.now()}`;
        const newClient: Client = {
            ...newClientData,
            id: clientId,
            avatar: '',
            email: email,
            deposits: {
                ringPlates: { photos: [], status: 'none' },
                finishedChains: { photos: [], status: 'none' },
                chainsByMeter: { photos: [], status: 'none' },
                other: { photos: [], status: 'none' },
            },
            followUps: []
        };
        updateClients([...clients, newClient]);
        
        if (email) {
            const newClientUser = {
                id: clientId,
                name: newClientData.name,
                email: email,
                password: 'password123', // Default temporary password
                role: 'cliente',
                avatar: ''
            };
            dataService.addUser(newClientUser);
        }
        
        setShowForm(false);
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clientCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-4xl font-bold text-[#bfa86b]">Fichas de Cliente</h1>
                <button onClick={() => onNavigate('DASHBOARD')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors self-start sm:self-center">Volver</button>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <input 
                    type="text" 
                    placeholder="Buscar cliente por nombre o código..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-auto flex-grow bg-[#233140] border border-[#bfa86b] text-white p-2 rounded-lg focus:outline-none"
                />
                <button onClick={() => setShowForm(!showForm)} className="bg-[#bfa86b] hover:bg-[#a89158] text-[#2c3e50] font-bold py-2 px-6 rounded-lg transition-colors">
                    {showForm ? 'Cerrar Formulario' : 'Nuevo Cliente'}
                </button>
            </div>

            {showForm && <ClientForm onSave={handleSaveClient} onCancel={() => setShowForm(false)} />}

            <div className="bg-[#233140] p-4 rounded-xl shadow-2xl">
                <div className="space-y-3">
                    {filteredClients.length > 0 ? (
                        filteredClients.map(client => (
                            <div key={client.id} onClick={() => onNavigate('CLIENT_DETAIL', client)} className="bg-[#2c3e50] p-4 rounded-lg flex items-center cursor-pointer hover:bg-opacity-80 transition-colors">
                                <Avatar src={client.avatar} alt={client.name} className="w-12 h-12 mr-4" />
                                <div className="flex-grow">
                                    <p className="font-bold text-lg text-white">{client.name}</p>
                                    <p className="text-sm text-[#bfa86b]">{client.clientCode}</p>
                                </div>
                                <span className="text-2xl text-gray-400">&rarr;</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-4">No se encontraron clientes. Añada uno nuevo para empezar.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientManager;