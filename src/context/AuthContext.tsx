import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
    token: string | null;
    hasProfile: boolean;
    isLoading: boolean;
    setToken: (token: string | null) => Promise<void>;
    setHasProfile: (value: boolean) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    token: null,
    hasProfile: false,
    isLoading: true,
    setToken: async () => { },
    setHasProfile: async () => { },
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setTokenState] = useState<string | null>(null);
    const [hasProfile, setHasProfileState] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted auth state on mount
    useEffect(() => {
        const loadAuthState = async () => {
            try {
                const savedToken = await AsyncStorage.getItem('token');
                const savedHasProfile = await AsyncStorage.getItem('has_profile');

                if (savedToken) {
                    setTokenState(savedToken);
                }
                if (savedHasProfile === 'true') {
                    setHasProfileState(true);
                }
            } catch (error) {
                console.error('Failed to load auth state:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAuthState();
    }, []);

    const setToken = async (newToken: string | null) => {
        try {
            if (newToken) {
                await AsyncStorage.setItem('token', newToken);
            } else {
                await AsyncStorage.removeItem('token');
            }
            setTokenState(newToken);
        } catch (error) {
            console.error('Failed to save token:', error);
        }
    };

    const setHasProfile = async (value: boolean) => {
        try {
            await AsyncStorage.setItem('has_profile', value ? 'true' : 'false');
            
            if (value) {
                const identifier = await AsyncStorage.getItem('auth_identifier');
                if (identifier) {
                    await AsyncStorage.setItem(`has_profile_${identifier}`, 'true');
                }
            }
            
            setHasProfileState(value);
        } catch (error) {
            console.error('Failed to save profile state:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['token', 'has_profile', 'auth_identifier']);
            setTokenState(null);
            setHasProfileState(false);
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ token, hasProfile, isLoading, setToken, setHasProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
