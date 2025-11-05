import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as dataService from '../services/dataService';

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const sessionUser = dataService.getSessionUser();
            if (sessionUser) {
                setUser(sessionUser);
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            dataService.clearSessionUser();
        } finally {
            setLoading(false);
        }
    }, []);
    
    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        dataService.setSessionUser(updatedUser);

        const users = dataService.getUsers();
        if (users) {
            const userIndex = users.findIndex((u: any) => u.id === updatedUser.id);
            if (userIndex !== -1) {
                users[userIndex].avatar = updatedUser.avatar;
                dataService.saveUsers(users);
            }
        }
    };

    const login = async (email: string, pass: string): Promise<boolean> => {
        const users = dataService.getUsers(); // dataService maneja la creación inicial de datos
        
        const foundUser = users.find((u: any) => u.email === email && u.password === pass);

        if (foundUser) {
            const userData: User = { id: foundUser.id, email: foundUser.email, name: foundUser.name, role: foundUser.role, avatar: foundUser.avatar || '' };
            dataService.setSessionUser(userData);
            setUser(userData);
            return true;
        }

        return false;
    };

    const logout = () => {
        dataService.clearSessionUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};