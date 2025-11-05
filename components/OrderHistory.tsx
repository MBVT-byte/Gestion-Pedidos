import React, { useState, useMemo } from 'react';
import { Order, Client } from '../types';
import { generateOrderPDF } from '../utils/pdfGenerator';

interface OrderHistoryProps {
    orders: Order[];
    clients: Client[];
    onBack: () => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, clients, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = useMemo(() => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        return orders
            .filter(order => {
                const orderDate = new Date(order.date);
                const isRecent = orderDate >= threeMonthsAgo;
                if (!isRecent) return false;

                if (!searchTerm) return true;

                const searchLower = searchTerm.toLowerCase();
                const nameMatch = order.clientName.toLowerCase().includes(searchLower);
                const codeMatch = order.clientCode.toLowerCase().includes(searchLower);

                return nameMatch || codeMatch;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, searchTerm]);

    const handleViewPDF = (order: Order) => {
        const client = clients.find(c => c.id === order.clientId);
        if (client) {
            generateOrderPDF(order, client, 'view');
        } else {
            alert('No se encontró el cliente asociado a este pedido.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-4xl font-bold text-[#bfa86b]">Histórico de Pedidos</h1>
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors self-start sm:self-center">Volver</button>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <input 
                    type="text" 
                    placeholder="Filtrar por nombre o código de cliente..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-auto flex-grow bg-[#233140] border border-[#bfa86b] text-white p-2 rounded-lg focus:outline-none"
                />
            </div>

            <div className="bg-[#233140] p-4 rounded-xl shadow-2xl">
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                            <div key={order.id} className="bg-[#2c3e50] p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg text-white">{order.clientName} <span className="text-sm text-gray-400">({order.clientCode})</span></p>
                                        <p className="text-sm text-[#bfa86b]">{new Date(order.date).toLocaleString()}</p>
                                        <p className="text-sm text-gray-300 italic mt-1">Pedido realizado por: {order.worker.name}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <p className="text-white font-semibold">{order.items.length} artículos</p>
                                        <button
                                            onClick={() => handleViewPDF(order)}
                                            className="bg-[#bfa86b] hover:bg-[#a89158] text-[#2c3e50] font-bold py-1 px-3 rounded-lg text-sm transition-colors"
                                        >
                                            Ver PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-4">No se encontraron pedidos que coincidan con los criterios.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;