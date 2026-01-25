// src/context/XPContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { XPContextValue, XPSource } from '../types/xp';
import { xpService } from '../services/xpService';
import { getNextLevelXP, getLevelProgressPercent } from '../constants/xpConfig';

const XPContext = createContext<XPContextValue | undefined>(undefined);

interface XPProviderProps {
    children: ReactNode;
}

export const XPProvider: React.FC<XPProviderProps> = ({ children }) => {
    const [state, setState] = useState(xpService.getState());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeXP = async () => {
            try {
                const initialState = await xpService.initialize();
                setState(initialState);
            } catch (error) {
                console.error('Failed to initialize XP:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeXP();
    }, []);

    const addXP = useCallback(
        async (amount: number, source: XPSource['type'], metadata?: Record<string, any>) => {
            const previousLevel = state.currentLevel;
            const previousRank = state.currentRank;

            const newState = await xpService.addXP(amount, source, metadata);
            setState(newState);

            // Haptic feedback for XP gain
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Check for level up
            if (newState.currentLevel !== previousLevel) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                // TODO: Show level up modal/animation
            }

            // Check for rank up
            if (
                newState.currentRank.tier !== previousRank.tier ||
                newState.currentRank.level !== previousRank.level
            ) {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                // TODO: Show rank up modal/animation
            }
        },
        [state.currentLevel, state.currentRank]
    );

    const unlockAchievement = useCallback(async (achievementId: string) => {
        const newState = await xpService.unlockAchievement(achievementId);
        if (newState) {
            setState(newState);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // TODO: Show achievement unlock modal/animation
        }
    }, []);

    const checkAchievements = useCallback(async () => {
        // This will be called with stats from SubscriptionContext and VocabularyContext
        // For now, we'll just update the state
        const currentState = xpService.getState();
        setState(currentState);
    }, []);

    const getXPForNextLevel = useCallback(() => {
        return getNextLevelXP(state.currentLevel);
    }, [state.currentLevel]);

    const getLevelProgress = useCallback(() => {
        return getLevelProgressPercent(state.currentXP, state.currentLevel);
    }, [state.currentXP, state.currentLevel]);

    const getRankString = useCallback(() => {
        return `${state.currentRank.tier} ${state.currentRank.level}`;
    }, [state.currentRank]);

    const value: XPContextValue = {
        ...state,
        addXP,
        unlockAchievement,
        getXPForNextLevel,
        getLevelProgress,
        getRankString,
        checkAchievements,
        isLoading,
    };

    return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
};

export const useXP = (): XPContextValue => {
    const context = useContext(XPContext);
    if (!context) {
        throw new Error('useXP must be used within XPProvider');
    }
    return context;
};
