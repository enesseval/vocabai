import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
    name: string;
    age: string;
    nativeLang: string | null;
    targetLang: string | null;
    purpose: string | null;
    interests: number[];
    level: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface OnboardingContextType {
    userProfile: UserProfile;
    updateProfile: (data: Partial<UserProfile>) => void;
    resetProfile: () => void;
    isLoading: boolean;
}

const defaultProfile: UserProfile = {
    name: '',
    age: '',
    nativeLang: null,
    targetLang: null,
    purpose: null,
    interests: [],
    level: 'Intermediate',
};

const STORAGE_KEY = '@user_profile';

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
    const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
    const [isLoading, setIsLoading] = useState(true);

    // Uygulama açılışında AsyncStorage'dan verileri yükle
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setUserProfile(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (data: Partial<UserProfile>) => {
        const updated = { ...userProfile, ...data };
        setUserProfile(updated);

        // AsyncStorage'a kaydet
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save user profile:', error);
        }
    };

    const resetProfile = async () => {
        setUserProfile(defaultProfile);
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to reset user profile:', error);
        }
    };

    return (
        <OnboardingContext.Provider value={{ userProfile, updateProfile, resetProfile, isLoading }}>
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) throw new Error('useOnboarding must be used within an OnboardingProvider');
    return context;
};