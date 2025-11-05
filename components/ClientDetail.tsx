import React, { useState, useRef } from 'react';
import { Client, Deposit, User, Order } from '../types';
import Avatar from './Avatar';

interface ClientDetailProps {
    client: Client;
    onBack: () => void;
    onNavigate: (view: 'FOLLOW_UP' | 'CLIENT_DASHBOARD' | 'CLIENT_DETAIL' | 'ORDER_GENERATOR', client: Client) => void;
    updateClients: (clients: Client[]) => void;
    clients: Client[];
    user: User;
    orders: Order[];
}

const DepositSection: React.FC<{ title: string, deposit: Deposit, onUpdate: (deposit: Deposit) => void, isEditing: boolean }> = ({ title, deposit, onUpdate, isEditing }) => {
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate({ ...deposit, status: e.target.value as 'active' | 'none' });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            // Fix: Explicitly type 'file' as File to prevent it from being inferred as 'unknown'.
            const newPhotos = files.map((file: File) => ({
                url: URL.createObjectURL(file),
                date: new Date().toISOString()
            }));
            onUpdate({ ...deposit, photos: [...deposit.photos, ...newPhotos] });
        }
    };
    
    return (
        <div className="bg-[#2c3e50] p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-3">{title}</h4>
            <select value={deposit.status} onChange={handleStatusChange} disabled={!isEditing} className="w-full bg-gray-700 text-white p-2 rounded mb-3 disabled:opacity-70">
                <option value="none">No tiene</option>
                <option value="active">Tiene</option>
            </select>
            {deposit.status === 'active' && (
                <div>
                    {isEditing && (
                        <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#bfa86b] file:text-[#2c3e50] hover:file:bg-[#a89158]" />
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
                        {deposit.photos.map((photo, index) => (
                            <div key={index} className="relative group">
                                <img src={photo.url} alt={`Deposit ${index + 1}`} className="w-full h-24 object-cover rounded" />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a href={photo.url} target="_blank" rel="noopener noreferrer" className="text-white text-xs text-center">{new Date(photo.date).toLocaleDateString()}</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ClientDetail: React.FC<ClientDetailProps> = ({ client, onBack, onNavigate, updateClients, clients, user, orders }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(client);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const clientOrders = orders
        .filter(order => order.clientId === client.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const handleUpdate = <K extends keyof Client>(key: K, value: Client[K]) => {
        const newFormData = { ...formData, [key]: value };
        setFormData(newFormData);
    };

    const handleDepositUpdate = (depositName: keyof Client['deposits'], depositData: Deposit) => {
        const newDeposits = { ...formData.deposits, [depositName]: depositData };
        handleUpdate('deposits', newDeposits);
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleUpdate('avatar', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveChanges = () => {
        const updatedClients = clients.map(c => c.id === client.id ? formData : c);
        updateClients(updatedClients);
        setIsEditing(false);
    };

    const deleteFollowUp = (followUpId: string) => {
        if(window.confirm("¿Está seguro de que desea eliminar este seguimiento?")) {
            const updatedFollowUps = client.followUps.filter(f => f.id !== followUpId);
            const updatedClient = { ...client, followUps: updatedFollowUps };
            const updatedClients = clients.map(c => c.id === client.id ? updatedClient : c);
            updateClients(updatedClients);
            setFormData(updatedClient);
        }
    };
    
    const canEdit = user.role === 'superadmin' || user.role === 'trabajador' || (user.role === 'cliente' && user.id === client.id);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar src={formData.avatar} alt={client.name} className="w-24 h-24" />
                        {isEditing && (
                            <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 hover:bg-blue-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 5.232z" /></svg>
                            </button>
                        )}
                         <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />
                    </div>
                    <h1 className="text-4xl font-bold text-[#bfa86b]">{client.name}</h1>
                </div>
                <div className="flex gap-2 self-start sm:self-center">
                     <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Volver</button>
                     {canEdit && (isEditing ? (
                        <button onClick={saveChanges} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Guardar</button>
                     ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Editar</button>
                     ))}
                </div>
            </div>

            <div className="bg-[#233140] p-6 rounded-xl shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-4">Información del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries({
                        clientCode: 'Código Cliente', name: 'Nombre', cif: 'CIF', address: 'Dirección', phone: 'Teléfono', schedule: 'Horario', responsiblePerson: 'Responsable'
                    }).map(([key, label]) => (
                        <div key={key}>
                            <label className="text-sm font-bold text-[#bfa86b]">{label}</label>
                            <input type="text" value={formData[key as keyof typeof formData] as string} disabled={!isEditing} onChange={(e) => handleUpdate(key as keyof Client, e.target.value)}
                                className="w-full bg-[#2c3e50] border border-gray-600 rounded p-2 text-white mt-1 disabled:opacity-70"/>
                            {key === 'address' && <a href={`https://maps.google.com/?q=${encodeURIComponent(client.address)}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline">Como Llegar</a>}
                            {key === 'phone' && <a href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-400 text-xs hover:underline ml-2">WhatsApp</a>}
                        </div>
                    ))}
                </div>
            </div>
            
            {(user.role === 'superadmin' || user.role === 'trabajador') && (
            <>
                <div className="bg-[#233140] p-6 rounded-xl shadow-2xl">
                     <h3 className="text-2xl font-bold text-white mb-4">Depósitos</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DepositSection title="Planchas de Anillos" deposit={formData.deposits.ringPlates} onUpdate={(d) => handleDepositUpdate('ringPlates', d)} isEditing={isEditing} />
                        <DepositSection title="Cadenas Terminadas" deposit={formData.deposits.finishedChains} onUpdate={(d) => handleDepositUpdate('finishedChains', d)} isEditing={isEditing} />
                        <DepositSection title="Cadenas por Metro" deposit={formData.deposits.chainsByMeter} onUpdate={(d) => handleDepositUpdate('chainsByMeter', d)} isEditing={isEditing} />
                        <DepositSection title="Otros Depósitos" deposit={formData.deposits.other} onUpdate={(d) => handleDepositUpdate('other', d)} isEditing={isEditing} />
                    </div>
                </div>

                <div className="bg-[#233140] p-6 rounded-xl shadow-2xl">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-white">Histórico de Seguimientos</h3>
                        <button onClick={() => onNavigate('FOLLOW_UP', client)} className="bg-[#bfa86b] hover:bg-[#a89158] text-[#2c3e50] font-bold py-2 px-4 rounded-lg transition-colors">Nuevo Seguimiento</button>
                     </div>
                     <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {client.followUps.slice(-5).reverse().map(fu => (
                            <div key={fu.id} className="bg-[#2c3e50] p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-white">{new Date(fu.date).toLocaleString()}</p>
                                        <p className="text-sm text-gray-300 italic">Por: {fu.workerName} ({fu.workerEmail})</p>
                                        <p className="mt-2 text-white">{fu.notes}</p>
                                    </div>
                                    {user.role === 'superadmin' && (
                                        <button onClick={() => deleteFollowUp(fu.id)} className="text-red-500 hover:text-red-400 font-bold text-2xl">&times;</button>
                                    )}
                                </div>
                                <div className="flex gap-4 mt-3">
                                    <a href={fu.merchandiseStatePhoto} target="_blank" rel="noopener noreferrer" className="w-1/2">
                                        <img src={fu.merchandiseStatePhoto} alt="Estado Mercancía" className="w-full h-24 object-cover rounded" />
                                        <p className="text-xs text-center text-gray-400 mt-1">Estado Mercancía</p>
                                    </a>
                                    <a href={fu.workFinalizationPhoto} target="_blank" rel="noopener noreferrer" className="w-1/2">
                                        <img src={fu.workFinalizationPhoto} alt="Finalización Trabajo" className="w-full h-24 object-cover rounded" />
                                        <p className="text-xs text-center text-gray-400 mt-1">Finalización Trabajo</p>
                                    </a>
                                </div>
                            </div>
                        ))}
                        {client.followUps.length === 0 && <p className="text-gray-400 text-center">No hay seguimientos registrados.</p>}
                     </div>
                </div>
            </>
            )}

            <div className="bg-[#233140] p-6 rounded-xl shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-4">Histórico de Pedidos (Últimos 5)</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {clientOrders.length > 0 ? (
                    clientOrders.map(order => (
                        <div key={order.id} className="bg-[#2c3e50] p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white">Pedido del {new Date(order.date).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-300 italic">Por: {order.worker.name}</p>
                                    <p className="mt-2 text-white">{order.items.length} artículo(s)</p>
                                    {order.notes && <p className="text-sm text-gray-400 mt-1">Notas: {order.notes}</p>}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center">No hay pedidos registrados para este cliente.</p>
                )}
                </div>
            </div>

        </div>
    );
};

export default ClientDetail;