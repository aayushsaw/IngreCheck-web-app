'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// User type matching Supabase auth user
export interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, name: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Initialize auth state and listen for changes
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.name,
                });
            }
            setIsLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.name,
                });
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
                return false;
            }

            if (data.user) {
                setUser({
                    id: data.user.id,
                    email: data.user.email!,
                    name: data.user.user_metadata?.name,
                });
                toast.success(`Welcome back!`);
                router.push('/');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Login error:', error);
            toast.error('An unexpected error occurred');
            return false;
        }
    };

    const signup = async (email: string, name: string, password: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                    },
                },
            });

            if (error) {
                toast.error(error.message);
                return false;
            }

            if (data.user) {
                // Check if email confirmation is required
                if (data.user.identities && data.user.identities.length === 0) {
                    toast.error('Email already registered');
                    return false;
                }

                setUser({
                    id: data.user.id,
                    email: data.user.email!,
                    name: data.user.user_metadata?.name,
                });

                toast.success(`Account created! Welcome, ${name}.`);

                // Note: If email confirmation is enabled, user won't be logged in automatically
                if (data.session) {
                    router.push('/');
                } else {
                    toast.info('Please check your email to verify your account.');
                    router.push('/login');
                }

                return true;
            }

            return false;
        } catch (error) {
            console.error('Signup error:', error);
            toast.error('An unexpected error occurred');
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                toast.error(error.message);
                return;
            }

            setUser(null);
            toast.info('You have been logged out.');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('An unexpected error occurred');
        }
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
