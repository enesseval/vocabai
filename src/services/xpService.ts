// src/services/xpService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { XPState, XPSource, Achievement, LanguageLevel, Rank } from '../types/xp';
import { getLevelFromXP, getRankFromXP, XP_REWARDS } from '../constants/xpConfig';
import { ACHIEVEMENTS } from '../constants/achievements';

const XP_STORAGE_KEY = '@xp/state';

const DEFAULT_XP_STATE: XPState = {
    currentXP: 0,
    currentLevel: 'A1',
    currentRank: { tier: 'Bronze', level: 'I' },
    xpHistory: [],
    achievements: ACHIEVEMENTS,
    unlockedAchievements: [],
};

class XPService {
    private state: XPState = DEFAULT_XP_STATE;

    async initialize(): Promise<XPState> {
        try {
            const stored = await AsyncStorage.getItem(XP_STORAGE_KEY);
            if (stored) {
                const parsedState = JSON.parse(stored);
                // Merge with default to ensure all achievements are present
                this.state = {
                    ...DEFAULT_XP_STATE,
                    ...parsedState,
                    achievements: ACHIEVEMENTS.map(achievement => {
                        const unlocked = parsedState.unlockedAchievements?.includes(achievement.id);
                        return {
                            ...achievement,
                            unlockedAt: unlocked ? parsedState.achievements?.find((a: Achievement) => a.id === achievement.id)?.unlockedAt : undefined,
                        };
                    }),
                };
            }
            return this.state;
        } catch (error) {
            console.error('Failed to load XP state:', error);
            return DEFAULT_XP_STATE;
        }
    }

    async addXP(amount: number, source: XPSource['type'], metadata?: Record<string, any>): Promise<XPState> {
        const xpEntry: XPSource = {
            type: source,
            amount,
            timestamp: new Date().toISOString(),
            metadata,
        };

        this.state.currentXP += amount;
        this.state.xpHistory.push(xpEntry);

        // Update level and rank
        const newLevel = getLevelFromXP(this.state.currentXP);
        const newRank = getRankFromXP(this.state.currentXP);

        const levelChanged = newLevel !== this.state.currentLevel;
        const rankChanged =
            newRank.tier !== this.state.currentRank.tier ||
            newRank.level !== this.state.currentRank.level;

        this.state.currentLevel = newLevel;
        this.state.currentRank = newRank;

        await this.persist();

        return this.state;
    }

    async unlockAchievement(achievementId: string): Promise<XPState | null> {
        if (this.state.unlockedAchievements.includes(achievementId)) {
            return null; // Already unlocked
        }

        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) {
            console.warn(`Achievement ${achievementId} not found`);
            return null;
        }

        this.state.unlockedAchievements.push(achievementId);

        // Update achievements array with unlock timestamp
        this.state.achievements = this.state.achievements.map(a =>
            a.id === achievementId
                ? { ...a, unlockedAt: new Date().toISOString() }
                : a
        );

        // Add achievement XP
        await this.addXP(achievement.xpReward, 'achievement', { achievementId });

        return this.state;
    }

    async checkAchievements(stats: {
        storiesRead: number;
        wordsLearned: number;
        quizPerfect: number;
    }): Promise<string[]> {
        const newlyUnlocked: string[] = [];

        for (const achievement of ACHIEVEMENTS) {
            if (this.state.unlockedAchievements.includes(achievement.id)) {
                continue; // Skip already unlocked
            }

            let shouldUnlock = false;

            switch (achievement.requirement.type) {
                case 'stories_read':
                    shouldUnlock = stats.storiesRead >= achievement.requirement.target;
                    break;
                case 'words_learned':
                    shouldUnlock = stats.wordsLearned >= achievement.requirement.target;
                    break;
                case 'quiz_perfect':
                    shouldUnlock = stats.quizPerfect >= achievement.requirement.target;
                    break;
                case 'level_reached':
                    shouldUnlock = this.state.currentXP >= achievement.requirement.target;
                    break;
            }

            if (shouldUnlock) {
                await this.unlockAchievement(achievement.id);
                newlyUnlocked.push(achievement.id);
            }
        }

        return newlyUnlocked;
    }

    getState(): XPState {
        return this.state;
    }

    async reset(): Promise<void> {
        this.state = DEFAULT_XP_STATE;
        await this.persist();
    }

    private async persist(): Promise<void> {
        try {
            await AsyncStorage.setItem(XP_STORAGE_KEY, JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to persist XP state:', error);
        }
    }
}

export const xpService = new XPService();
