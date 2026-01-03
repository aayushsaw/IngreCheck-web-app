'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock user type
export interface User {
    id: string;
    name: string;
    email: string;
}

interface RegisteredUser extends User {
    password?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password?: string) => boolean;
    signup: (email: string, name: string, password?: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load user and registered users from local storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('ingrecheck_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage");
                localStorage.removeItem('ingrecheck_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (email: string, password?: string) => { // Added password param
        // Simulate backend validation
        const storedUsers = localStorage.getItem('ingrecheck_users_db');
        let users: RegisteredUser[] = [];
        if (storedUsers) {
            try {
                users = JSON.parse(storedUsers);
            } catch (e) {
                users = [];
            }
        }

        const validUser = users.find(u => u.email === email && u.password === password);

        if (validUser) {
            const { password, ...userWithoutPassword } = validUser;
            setUser(userWithoutPassword);
            localStorage.setItem('ingrecheck_user', JSON.stringify(userWithoutPassword));
            toast.success(`Welcome back, ${validUser.name}!`);
            router.push('/');
            return true;
        } else {
            toast.error('Invalid email or password');
            return false;
        }
    };

    const signup = (email: string, name: string, password?: string) => { // Added password param
        const storedUsers = localStorage.getItem('ingrecheck_users_db');
        let users: RegisteredUser[] = [];
        if (storedUsers) {
            try {
                users = JSON.parse(storedUsers);
            } catch (e) {
                users = [];
            }
        }

        if (users.find(u => u.email === email)) {
            toast.error('Email already registered');
            return false;
        }

        const newUser = { id: Date.now().toString(), email, name, password }; // Storing password for demo
        users.push(newUser);
        localStorage.setItem('ingrecheck_users_db', JSON.stringify(users));

        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        localStorage.setItem('ingrecheck_user', JSON.stringify(userWithoutPassword));

        toast.success(`Account created! Welcome, ${name}.`);
        router.push('/');
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ingrecheck_user');
        toast.info('You have been logged out.');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
