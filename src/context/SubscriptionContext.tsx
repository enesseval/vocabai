// src/context/SubscriptionContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionDetails, SubscriptionPlan } from '../types/subscription';

interface SubscriptionContextType {
    subscription: SubscriptionDetails;
    isPremium: boolean;
    updateSubscription: (plan: SubscriptionPlan) => Promise<void>;
    cancelSubscription: () => Promise<void>;
    checkFeatureAccess: (feature: string) => boolean;
    storiesRead: number;
    incrementStoriesRead: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STORAGE_KEY = 'user_subscription';
const STORIES_READ_KEY = 'stories_read_count';

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const [subscription, setSubscription] = useState<SubscriptionDetails>({
        plan: 'free',
        isPremium: false,
    });
    const [storiesRead, setStoriesRead] = useState(0);

    useEffect(() => {
        loadSubscription();
        loadStoriesRead();
    }, []);

    const loadSubscription = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convert date strings back to Date objects
                if (parsed.startDate) parsed.startDate = new Date(parsed.startDate);
                if (parsed.expiryDate) parsed.expiryDate = new Date(parsed.expiryDate);
                setSubscription(parsed);
            }
        } catch (error) {
            console.error('Failed to load subscription:', error);
        }
    };

    const loadStoriesRead = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORIES_READ_KEY);
            if (stored) {
                setStoriesRead(parseInt(stored, 10));
            }
        } catch (error) {
            console.error('Failed to load stories read count:', error);
        }
    };

    const updateSubscription = async (plan: SubscriptionPlan) => {
        const now = new Date();
        let expiryDate = new Date();

        // Calculate expiry based on plan
        switch (plan) {
            case 'weekly':
                expiryDate.setDate(now.getDate() + 7);
                break;
            case 'monthly':
                expiryDate.setMonth(now.getMonth() + 1);
                break;
            case 'yearly':
                expiryDate.setFullYear(now.getFullYear() + 1);
                break;
            default:
                expiryDate = now;
        }

        const newSubscription: SubscriptionDetails = {
            plan,
            isPremium: plan !== 'free',
            startDate: now,
            expiryDate: plan !== 'free' ? expiryDate : undefined,
            autoRenew: true,
        };

        setSubscription(newSubscription);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSubscription));
    };

    const cancelSubscription = async () => {
        const freeSubscription: SubscriptionDetails = {
            plan: 'free',
            isPremium: false,
        };
        setSubscription(freeSubscription);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(freeSubscription));
    };

    const checkFeatureAccess = (feature: string): boolean => {
        if (subscription.isPremium) return true;

        // Free tier limitations
        const freeLimits: Record<string, boolean> = {
            'unlimited_stories': false,
            'advanced_quiz': false,
            'detailed_analytics': false,
            'offline_download': false,
            'achievements': false,
            'voice_recording': false,
        };

        return freeLimits[feature] !== false;
    };

    const incrementStoriesRead = async () => {
        const newCount = storiesRead + 1;
        setStoriesRead(newCount);
        await AsyncStorage.setItem(STORIES_READ_KEY, newCount.toString());
    };

    return (
        <SubscriptionContext.Provider
            value={{
                subscription,
                isPremium: subscription.isPremium,
                updateSubscription,
                cancelSubscription,
                checkFeatureAccess,
                storiesRead,
                incrementStoriesRead,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within SubscriptionProvider');
    }
    return context;
}
