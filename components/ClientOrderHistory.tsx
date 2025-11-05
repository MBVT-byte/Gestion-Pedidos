import React from 'react';
import { Order, Client } from '../types';
import { generateOrderPDF } from '../utils/pdfGenerator';

interface ClientOrderHistoryProps {
    orders: Order[];
    clients: Client[];
    onBack: () => void;
}

const ClientOrderHistory: React.FC<ClientOrderHistoryProps> = ({ orders, clients, onBack }) => {

    const handleViewPDF = (order: Order) => {
        const client = clients.find(c => c.id === order.clientId);
        if (client) {
            generateOrderPDF(order, client, 'view');
        } else {
            alert('No se encontró el cliente asociado a este pedido.');
        }
    };

    const sortedOrders = orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-4xl font-bold text-[#bfa86b]">Mi Historial de Pedidos</h1>
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors self-start sm:self-center">Volver</button>
            </div>

            <div className="bg-[#233140] p-4 rounded-xl shadow-2xl">
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                    {sortedOrders.length > 0 ? (
                        sortedOrders.map(order => (
                            <div key={order.id} className="bg-[#2c3e50] p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg text-white">Pedido del {new Date(order.date).toLocaleString()}</p>
                                        <p className="text-sm text-gray-300 italic mt-1">Realizado por: {order.worker.name}</p>
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
                        <p className="text-center text-gray-400 py-4">No tiene pedidos registrados.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientOrderHistory;
