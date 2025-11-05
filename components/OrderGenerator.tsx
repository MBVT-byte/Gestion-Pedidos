import React, { useState, useRef, useEffect } from 'react';
import { processOrderImage } from '../services/geminiService';
import { Client, OrderItem, User, Order } from '../types';
import Avatar from './Avatar';
import { generateOrderPDF } from '../utils/pdfGenerator';

interface OrderGeneratorProps {
    onBack: () => void;
    clients: Client[];
    user: User;
    addOrder: (order: Order) => void;
    selectedClientIdProp?: string;
}

const OrderGenerator: React.FC<OrderGeneratorProps> = ({ onBack, clients, user, addOrder, selectedClientIdProp }) => {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFinalized, setIsFinalized] = useState(false);
    const [signature, setSignature] = useState<string>('');
    const [orderNotes, setOrderNotes] = useState('');
    const [pdfSuccessMessage, setPdfSuccessMessage] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedClientIdProp) {
            setSelectedClientId(selectedClientIdProp);
        }
    }, [selectedClientIdProp]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await processImage(file);
        }
    };

    const processImage = async (file: File) => {
        setIsLoading(true);
        setError(null);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                const newItems = await processOrderImage(base64String, file.type);
                setOrderItems(prev => [...prev, ...newItems]);
                playNotificationSound();
            };
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const playNotificationSound = () => {
        const audio = new Audio("data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YQQAAAAP//8/AAAA//8=");
        audio.play().catch(e => console.error("Audio playback failed:", e));
    };
    
    const removeItem = (id: string) => {
        setOrderItems(prev => prev.filter(item => item.id !== id));
    };

    const handleFinalize = () => {
        if (!selectedClientId) {
            setError("Por favor, seleccione un cliente para finalizar el pedido.");
            return;
        }
        setIsFinalized(true);
    };

    const handleGeneratePDF = () => {
        const selectedClient = clients.find(c => c.id === selectedClientId);
        if (!selectedClient) return;

        const newOrder: Order = {
          id: `order-${Date.now()}`,
          clientId: selectedClient.id,
          clientName: selectedClient.name,
          clientCode: selectedClient.clientCode,
          date: new Date().toISOString(),
          items: orderItems,
          notes: orderNotes,
          signature: signature,
          worker: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        };
        addOrder(newOrder);

        generateOrderPDF(newOrder, selectedClient, 'print');
        
        setPdfSuccessMessage('Pedido guardado y enviado exitosamente.');
        playNotificationSound();
        setTimeout(() => setPdfSuccessMessage(''), 5000);
    };

    if (isFinalized) {
        return (
             <div className="bg-[#233140] p-8 rounded-xl shadow-2xl">
                 <h2 className="text-3xl font-bold text-[#bfa86b] mb-6">Finalizar Pedido</h2>
                 <p className="text-gray-300 mb-4">Por favor, pida al cliente que firme en el recuadro de abajo.</p>
                 
                 <div className="mb-6">
                     <label className="block text-[#bfa86b] text-sm font-bold mb-2">Firma del Cliente:</label>
                     <input type="text" value={signature} onChange={e => setSignature(e.target.value)} placeholder="Escriba el nombre del cliente para firmar" className="w-full p-2 bg-gray-700 border border-[#bfa86b] rounded text-white" />
                     <p className="text-xs text-gray-400 mt-1">En un dispositivo táctil, esto sería un lienzo de firma.</p>
                 </div>
                 
                 <div className="flex justify-between mt-8">
                    <button onClick={() => setIsFinalized(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Volver</button>
                    <button onClick={handleGeneratePDF} disabled={!signature} className="bg-[#bfa86b] hover:bg-[#a89158] text-[#2c3e50] font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50">
                        Generar PDF y Guardar
                    </button>
                </div>
                {pdfSuccessMessage && (
                    <p className="text-green-400 text-center mt-4 animate-pulse">{pdfSuccessMessage}</p>
                )}
             </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-[#bfa86b]">Generador de Pedido</h1>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 text-right">
                        <div>
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-gray-400">Vendedor</p>
                        </div>
                        <Avatar src={user.avatar} alt={user.name} className="w-12 h-12" />
                    </div>
                    <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Volver</button>
                </div>
            </div>

            <div className="bg-[#233140] p-6 rounded-xl shadow-2xl space-y-4">
                <h2 className="text-2xl font-semibold text-[#bfa86b]">1. Añadir Artículos</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                     <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50" disabled={isLoading}>
                        {isLoading ? 'Procesando...' : 'Subir Fotografía'}
                    </button>
                    <button onClick={() => cameraInputRef.current?.click()} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50" disabled={isLoading}>
                        Abrir Cámara
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
                </div>
                 {isLoading && <div className="flex items-center justify-center gap-2 text-white"><div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-[#bfa86b]"></div>Procesando imagen con IA...</div>}
                {error && <p className="text-red-500 text-center">{error}</p>}
            </div>

            <div className="bg-[#233140] p-6 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-semibold text-[#bfa86b] mb-4">2. Resumen del Pedido</h2>
                {orderItems.length === 0 ? (
                    <p className="text-gray-400">No hay artículos en el pedido. Añada artículos usando las opciones de arriba.</p>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {orderItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-[#2c3e50] p-3 rounded-lg">
                                <div>
                                    <p className="font-bold text-white">{item.code} <span className="text-sm font-normal text-gray-300">({item.category})</span></p>
                                    <p className="text-sm text-[#bfa86b]">{item.price ? `€${item.price.toFixed(2)}` : 'Precio no detectado'}</p>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-400 font-bold text-xl">&times;</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-[#233140] p-6 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-semibold text-[#bfa86b] mb-4">Observaciones del Pedido</h2>
                <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={4}
                    className="w-full bg-[#2c3e50] border border-[#bfa86b] rounded p-2 text-white"
                    placeholder="Añada notas adicionales para el pedido aquí..."
                ></textarea>
            </div>

            <div className="bg-[#233140] p-6 rounded-xl shadow-2xl space-y-4">
                 <h2 className="text-2xl font-semibold text-[#bfa86b]">3. Finalizar</h2>
                  <div>
                    <label htmlFor="client-select" className="block mb-2 text-sm font-medium text-gray-300">Seleccionar Cliente</label>
                    <select
                        id="client-select"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="bg-gray-700 border border-[#bfa86b] text-white text-sm rounded-lg focus:ring-[#bfa86b] focus:border-[#bfa86b] block w-full p-2.5"
                        disabled={!!selectedClientIdProp}
                    >
                        <option value="">-- Elija un cliente --</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.clientCode} - {client.name}</option>
                        ))}
                    </select>
                </div>
                 <button 
                    onClick={handleFinalize}
                    disabled={orderItems.length === 0 || !selectedClientId}
                    className="w-full bg-[#bfa86b] hover:bg-[#a89158] text-[#2c3e50] font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Finalizar Pedido y Firmar
                </button>
            </div>
        </div>
    );
};

export default OrderGenerator;