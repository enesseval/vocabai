// src/constants/achievements.ts

import { Achievement } from '../types/xp';

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_story',
        title: 'First Steps',
        titleTranslationKey: 'achievements.firstStory.title',
        description: 'Complete your first story',
        descriptionTranslationKey: 'achievements.firstStory.description',
        icon: '📖',
        xpReward: 50,
        requirement: {
            type: 'stories_read',
            target: 1,
        },
    },
    {
        id: 'story_collector',
        title: 'Story Collector',
        titleTranslationKey: 'achievements.storyCollector.title',
        description: 'Read 10 stories',
        descriptionTranslationKey: 'achievements.storyCollector.description',
        icon: '📚',
        xpReward: 100,
        requirement: {
            type: 'stories_read',
            target: 10,
        },
    },
    {
        id: 'bookworm',
        title: 'Bookworm',
        titleTranslationKey: 'achievements.bookworm.title',
        description: 'Read 50 stories',
        descriptionTranslationKey: 'achievements.bookworm.description',
        icon: '📕',
        xpReward: 300,
        requirement: {
            type: 'stories_read',
            target: 50,
        },
    },
    {
        id: 'word_learner',
        title: 'Word Learner',
        titleTranslationKey: 'achievements.wordLearner.title',
        description: 'Save 50 words',
        descriptionTranslationKey: 'achievements.wordLearner.description',
        icon: '📝',
        xpReward: 75,
        requirement: {
            type: 'words_learned',
            target: 50,
        },
    },
    {
        id: 'vocabulary_master',
        title: 'Vocabulary Master',
        titleTranslationKey: 'achievements.vocabularyMaster.title',
        description: 'Save 200 words',
        descriptionTranslationKey: 'achievements.vocabularyMaster.description',
        icon: '⭐',
        xpReward: 200,
        requirement: {
            type: 'words_learned',
            target: 200,
        },
    },
    {
        id: 'quiz_champion',
        title: 'Quiz Champion',
        titleTranslationKey: 'achievements.quizChampion.title',
        description: 'Get 100% on 5 quizzes',
        descriptionTranslationKey: 'achievements.quizChampion.description',
        icon: '🏆',
        xpReward: 150,
        requirement: {
            type: 'quiz_perfect',
            target: 5,
        },
    },
    {
        id: 'intermediate_level',
        title: 'Rising Star',
        titleTranslationKey: 'achievements.intermediateLevel.title',
        description: 'Reach B1 level',
        descriptionTranslationKey: 'achievements.intermediateLevel.description',
        icon: '🌟',
        xpReward: 250,
        requirement: {
            type: 'level_reached',
            target: 1000, // B1 start XP
        },
    },
    {
        id: 'advanced_level',
        title: 'Language Expert',
        titleTranslationKey: 'achievements.advancedLevel.title',
        description: 'Reach C1 level',
        descriptionTranslationKey: 'achievements.advancedLevel.description',
        icon: '👑',
        xpReward: 500,
        requirement: {
            type: 'level_reached',
            target: 3500, // C1 start XP
        },
    },
];

export const getAchievementById = (id: string): Achievement | undefined => {
    return ACHIEVEMENTS.find(achievement => achievement.id === id);
};

export const getLockedAchievements = (unlockedIds: string[]): Achievement[] => {
    return ACHIEVEMENTS.filter(achievement => !unlockedIds.includes(achievement.id));
};

export const getUnlockedAchievements = (unlockedIds: string[]): Achievement[] => {
    return ACHIEVEMENTS.filter(achievement => unlockedIds.includes(achievement.id));
};
