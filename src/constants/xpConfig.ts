// src/constants/xpConfig.ts

import { LevelConfig, RankTier, LanguageLevel } from '../types/xp';

export const XP_LEVELS: Record<LanguageLevel, LevelConfig> = {
    A1: { start: 0, end: 500 },
    A2: { start: 500, end: 1000 },
    B1: { start: 1000, end: 2000 },
    B2: { start: 2000, end: 3500 },
    C1: { start: 3500, end: 5500 },
    C2: { start: 5500, end: 10000 },
};

export const RANK_TIERS: Record<RankTier, { start: number; end: number }> = {
    Bronze: { start: 0, end: 1500 },
    Silver: { start: 1500, end: 4000 },
    Gold: { start: 4000, end: 8000 },
    Platinum: { start: 8000, end: 999999 },
};

export const XP_REWARDS = {
    STORY_COMPLETE: 60,
    WORD_SAVE: 5,
    QUIZ_COMPLETE: 30,
    QUIZ_PERFECT: 50, // Bonus for 100% quiz
    DAILY_GOAL: 20,
} as const;

export const RANK_COLORS: Record<RankTier, string> = {
    Bronze: '#cd7f32',
    Silver: '#c0c0c0',
    Gold: '#fbbf24',
    Platinum: '#e5e4e2',
};

// Helper function to get current level based on XP
export const getLevelFromXP = (xp: number): LanguageLevel => {
    if (xp >= XP_LEVELS.C2.start) return 'C2';
    if (xp >= XP_LEVELS.C1.start) return 'C1';
    if (xp >= XP_LEVELS.B2.start) return 'B2';
    if (xp >= XP_LEVELS.B1.start) return 'B1';
    if (xp >= XP_LEVELS.A2.start) return 'A2';
    return 'A1';
};

// Helper function to get current rank based on XP
export const getRankFromXP = (xp: number): { tier: RankTier; level: 'I' | 'II' | 'III' } => {
    let tier: RankTier;

    if (xp >= RANK_TIERS.Platinum.start) tier = 'Platinum';
    else if (xp >= RANK_TIERS.Gold.start) tier = 'Gold';
    else if (xp >= RANK_TIERS.Silver.start) tier = 'Silver';
    else tier = 'Bronze';

    const tierConfig = RANK_TIERS[tier];
    const tierProgress = xp - tierConfig.start;
    const tierRange = tierConfig.end - tierConfig.start;
    const tierPercent = tierProgress / tierRange;

    let level: 'I' | 'II' | 'III';
    if (tier === 'Platinum') {
        // Platinum only has I and II
        level = tierPercent < 0.5 ? 'I' : 'II';
    } else {
        // Other tiers have I, II, III
        if (tierPercent < 0.33) level = 'I';
        else if (tierPercent < 0.67) level = 'II';
        else level = 'III';
    }

    return { tier, level };
};

// Helper function to get next level XP requirement
export const getNextLevelXP = (currentLevel: LanguageLevel): number => {
    return XP_LEVELS[currentLevel].end;
};

// Helper function to calculate level progress percentage
export const getLevelProgressPercent = (xp: number, currentLevel: LanguageLevel): number => {
    const levelConfig = XP_LEVELS[currentLevel];
    const progress = xp - levelConfig.start;
    const total = levelConfig.end - levelConfig.start;
    return Math.min(100, Math.max(0, (progress / total) * 100));
};
