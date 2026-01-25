// src/types/xp.ts

export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type RankLevel = 'I' | 'II' | 'III';

export interface Rank {
    tier: RankTier;
    level: RankLevel;
}

export interface LevelConfig {
    start: number;
    end: number;
}

export interface XPSource {
    type: 'story_complete' | 'word_save' | 'quiz_complete' | 'quiz_perfect' | 'daily_goal' | 'achievement';
    amount: number;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface Achievement {
    id: string;
    title: string;
    titleTranslationKey: string;
    description: string;
    descriptionTranslationKey: string;
    icon: string;
    xpReward: number;
    requirement: {
        type: 'stories_read' | 'words_learned' | 'quiz_perfect' | 'days_active' | 'level_reached';
        target: number;
    };
    unlockedAt?: string;
    progress?: number;
}

export interface XPState {
    currentXP: number;
    currentLevel: LanguageLevel;
    currentRank: Rank;
    xpHistory: XPSource[];
    achievements: Achievement[];
    unlockedAchievements: string[];
}

export interface XPContextValue extends XPState {
    addXP: (amount: number, source: XPSource['type'], metadata?: Record<string, any>) => Promise<void>;
    unlockAchievement: (achievementId: string) => Promise<void>;
    getXPForNextLevel: () => number;
    getLevelProgress: () => number;
    getRankString: () => string;
    checkAchievements: () => Promise<void>;
    isLoading: boolean;
}
