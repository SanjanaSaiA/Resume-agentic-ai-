/**
 * Authentication Context
 * Manages user authentication state across the application
 */
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, profileAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface User {
    id: number;
    email: string;
}

interface Profile {
    id: number;
    full_name: string;
    email?: string;
    phone?: string;
    skills: string[];
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            // Fetch user profile to verify token
            const profileData = await profileAPI.get();
            setProfile(profileData);
            setUser({ id: profileData.user_id, email: profileData.email || '' });
        } catch (error) {
            // Token invalid or expired
            localStorage.removeItem('token');
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const data = await authAPI.login(email, password);
            localStorage.setItem('token', data.access_token);

            // Fetch profile after login
            await refreshProfile();

            toast.success('Login successful!');
            router.push('/dashboard');
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Login failed';
            toast.error(message);
            throw error;
        }
    };

    const register = async (email: string, password: string) => {
        try {
            const data = await authAPI.register(email, password);
            localStorage.setItem('token', data.access_token);

            // Set basic user data
            setUser({ id: 0, email });

            toast.success('Registration successful! Please complete your profile.');
            router.push('/profile/create');
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Registration failed';
            toast.error(message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setProfile(null);
        toast.success('Logged out successfully');
        router.push('/');
    };

    const refreshProfile = async () => {
        try {
            const profileData = await profileAPI.get();
            setProfile(profileData);
            setUser({ id: profileData.user_id, email: profileData.email || '' });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    const value: AuthContextType = {
        user,
        profile,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
