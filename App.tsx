import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import OrderGenerator from './components/OrderGenerator';
import ClientManager from './components/ClientManager';
import { Client, Order } from './types';
import ClientDetail from './components/ClientDetail';
import FollowUpManager from './components/FollowUpManager';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import OrderHistory from './components/OrderHistory';
import ClientOrderHistory from './components/ClientOrderHistory';
import * as dataService from './services/dataService';

type View = 'DASHBOARD' | 'ORDER_GENERATOR' | 'CLIENT_MANAGER' | 'CLIENT_DETAIL' | 'FOLLOW_UP' | 'ADMIN_PANEL' | 'PROFILE' | 'ORDER_HISTORY' | 'CLIENT_ORDER_HISTORY' | 'CLIENT_DASHBOARD';

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const [view, setView] = useState<View>('DASHBOARD');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        setClients(dataService.getClients());
        setOrders(dataService.getOrders());
    }, []);

    useEffect(() => {
        if (user?.role === 'cliente') {
            const clientProfile = clients.find(c => c.id === user.id);
            if (clientProfile) {
                setSelectedClient(clientProfile);
                setView('CLIENT_DASHBOARD');
            }
        } else {
             setView('DASHBOARD');
        }
    }, [user, clients]);

    const updateClients = useCallback((newClients: Client[]) => {
        setClients(newClients);
        dataService.saveClients(newClients);
    }, []);

    const addOrder = useCallback((order: Order) => {
        dataService.saveOrder(order); // Persiste el pedido y simula la subida a Drive
        setOrders(prevOrders => [order, ...prevOrders]); // Actualiza el estado de la UI
    }, []);

    const handleNavigate = (newView: View, client?: Client) => {
        setView(newView);
        if (client) {
            setSelectedClient(client);
        } else if (newView !== 'CLIENT_DETAIL' && newView !== 'FOLLOW_UP') {
            if (user?.role !== 'cliente') {
                setSelectedClient(null);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#2c3e50]">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#bfa86b]"></div>
            </div>
        );
    }

    if (!user) {
        return <LoginScreen />;
    }

    if (user.role === 'cliente') {
        const clientProfile = clients.find(c => c.id === user.id);
        if (!clientProfile) return <div className="text-white text-center p-8">Error: Perfil de cliente no encontrado.</div>;
        
        switch (view) {
            case 'ORDER_GENERATOR':
                return <OrderGenerator onBack={() => handleNavigate('CLIENT_DASHBOARD')} clients={[clientProfile]} user={user} addOrder={addOrder} selectedClientIdProp={clientProfile.id} />;
            case 'CLIENT_DETAIL':
                return <ClientDetail client={clientProfile} onBack={() => handleNavigate('CLIENT_DASHBOARD')} onNavigate={handleNavigate} updateClients={updateClients} clients={clients} user={user} orders={orders} />;
            case 'CLIENT_ORDER_HISTORY':
                 return <ClientOrderHistory orders={orders.filter(o => o.clientId === user.id)} clients={clients} onBack={() => handleNavigate('CLIENT_DASHBOARD')} />;
            default: // CLIENT_DASHBOARD
                return <Dashboard onNavigate={handleNavigate} user={user} />;
        }
    }


    const renderContent = () => {
        switch (view) {
            case 'DASHBOARD':
                return <Dashboard onNavigate={handleNavigate} user={user} />;
            case 'ORDER_GENERATOR':
                return <OrderGenerator onBack={() => handleNavigate('DASHBOARD')} clients={clients} user={user} addOrder={addOrder} />;
            case 'CLIENT_MANAGER':
                return <ClientManager onNavigate={handleNavigate} clients={clients} updateClients={updateClients} user={user} />;
            case 'CLIENT_DETAIL':
                return selectedClient ? <ClientDetail client={selectedClient} onBack={() => handleNavigate('CLIENT_MANAGER')} onNavigate={handleNavigate} updateClients={updateClients} clients={clients} user={user} orders={orders} /> : <div className="text-white">Client not found.</div>;
             case 'FOLLOW_UP':
                return selectedClient ? <FollowUpManager client={selectedClient} onBack={() => handleNavigate('CLIENT_DETAIL', selectedClient)} user={user} /> : <div className="text-white">Client not found.</div>;
            case 'ADMIN_PANEL':
                return <AdminPanel onBack={() => handleNavigate('DASHBOARD')} />;
            case 'PROFILE':
                return <Profile onBack={() => handleNavigate('DASHBOARD')} />;
            case 'ORDER_HISTORY':
                return <OrderHistory orders={orders} clients={clients} onBack={() => handleNavigate('DASHBOARD')} />;
            default:
                return <Dashboard onNavigate={handleNavigate} user={user} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#2c3e50] text-[#bfa86b] font-sans antialiased">
            <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
                {renderContent()}
            </main>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;