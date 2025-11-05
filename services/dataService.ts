import { Client, User, Order, FollowUp } from '../types';
import { uploadOrderPDF } from '../utils/googleDriveUploader';

// --- Data Seeding ---
const seedInitialData = () => {
    if (!localStorage.getItem('users')) {
        const adminUser = { 
            id: 'admin-01', 
            name: 'Christian', 
            email: 'christiansm85@gmail.com', 
            password: '54076566Rr-', 
            role: 'superadmin', 
            avatar: '' 
        };
        localStorage.setItem('users', JSON.stringify([adminUser]));
    }
    if (!localStorage.getItem('clients')) {
        localStorage.setItem('clients', JSON.stringify([]));
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
};

seedInitialData();

// --- User Management ---
export const getUsers = (): any[] => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: any[]) => {
    localStorage.setItem('users', JSON.stringify(users));
};

export const addUser = (user: any) => {
    const users = getUsers();
    users.push(user);
    saveUsers(users);
};

// --- Client Management ---
export const getClients = (): Client[] => {
    const clients = localStorage.getItem('clients');
    return clients ? JSON.parse(clients) : [];
};

export const saveClients = (clients: Client[]) => {
    localStorage.setItem('clients', JSON.stringify(clients));
};

export const addFollowUp = (clientId: string, followUp: FollowUp) => {
    const clients = getClients();
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex !== -1) {
        clients[clientIndex].followUps.push(followUp);
        saveClients(clients);
    }
};

// --- Order Management ---
export const getOrders = (): Order[] => {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
};

export const saveOrders = (orders: Order[]) => {
    localStorage.setItem('orders', JSON.stringify(orders));
};

export const saveOrder = (order: Order) => {
    const orders = getOrders();
    orders.unshift(order); // Add to the beginning
    saveOrders(orders);
    
    // Also trigger the simulated upload to Google Drive
    const client = getClients().find(c => c.id === order.clientId);
    if (client) {
        uploadOrderPDF(order, client);
    }
};

// --- Session Management ---
export const getSessionUser = (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const setSessionUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
};

export const clearSessionUser = () => {
    localStorage.removeItem('user');
};