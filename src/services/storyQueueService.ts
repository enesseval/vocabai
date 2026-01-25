// src/services/storyQueueService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Story, StoryCategory, StoryDifficulty } from '../types/story';
import { generateAIStory } from './aiService';

const QUEUE_STORAGE_KEY = '@storyQueue/state';
const QUEUE_SIZE = 3; // Always maintain 3 stories in queue

interface StoryQueueState {
    queue: Story[];
    completedStoryIds: string[];
    lastGenerated: string | null;
}

const DEFAULT_QUEUE_STATE: StoryQueueState = {
    queue: [],
    completedStoryIds: [],
    lastGenerated: null,
};

// Placeholder images by category (can be replaced with AI-generated images)
const CATEGORY_IMAGES: Record<StoryCategory, string> = {
    Mystery: 'https://images.unsplash.com/photo-1516876437184-593fda40c7ce?w=720&h=540&fit=crop',
    Romance: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=720&h=540&fit=crop',
    Adventure: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=720&h=540&fit=crop',
    'Sci-Fi': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=720&h=540&fit=crop',
    Comedy: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=720&h=540&fit=crop',
    Drama: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=720&h=540&fit=crop',
};

class StoryQueueService {
    private state: StoryQueueState = DEFAULT_QUEUE_STATE;

    async initialize(): Promise<StoryQueueState> {
        try {
            const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
            if (stored) {
                this.state = JSON.parse(stored);
            }
            return this.state;
        } catch (error) {
            console.error('Failed to load story queue:', error);
            return DEFAULT_QUEUE_STATE;
        }
    }

    async generateNextStory(userProfile: {
        level: StoryDifficulty;
        interests: number[];
        targetLang: string;
        nativeLang: string;
    }): Promise<Story> {
        try {
            // Generate story using AI service
            const story = await generateAIStory({
                level: userProfile.level,
                interests: userProfile.interests,
                targetLang: userProfile.targetLang,
                nativeLang: userProfile.nativeLang,
            });

            // Enhance story with metadata
            const enhancedStory = this.enhanceStoryMetadata(story, userProfile.level);

            // Add to queue
            this.state.queue.push(enhancedStory);
            this.state.lastGenerated = new Date().toISOString();

            await this.persist();

            return enhancedStory;
        } catch (error) {
            console.error('Failed to generate story:', error);
            throw error;
        }
    }

    async fillQueue(userProfile: {
        level: StoryDifficulty;
        interests: number[];
        targetLang: string;
        nativeLang: string;
    }): Promise<Story[]> {
        const storiesNeeded = QUEUE_SIZE - this.state.queue.length;

        if (storiesNeeded <= 0) {
            return this.state.queue;
        }

        const newStories: Story[] = [];

        for (let i = 0; i < storiesNeeded; i++) {
            try {
                const story = await this.generateNextStory(userProfile);
                newStories.push(story);
            } catch (error) {
                console.error(`Failed to generate story ${i + 1}:`, error);
                // Continue generating other stories even if one fails
            }
        }

        return this.state.queue;
    }

    async markStoryComplete(storyId: string): Promise<void> {
        this.state.completedStoryIds.push(storyId);
        this.state.queue = this.state.queue.filter(story => story.id !== storyId);
        await this.persist();
    }

    getCurrentStory(): Story | null {
        return this.state.queue[0] || null;
    }

    getQueue(): Story[] {
        return this.state.queue;
    }

    getQueueLength(): number {
        return this.state.queue.length;
    }

    private enhanceStoryMetadata(story: Story, difficulty: StoryDifficulty): Story {
        // Calculate estimated reading time (average 200 words/minute)
        const wordCount = story.content.split(/\s+/).length;
        const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 200));

        // Determine category based on title/content keywords (simple heuristic)
        const category = this.detectCategory(story.title + ' ' + story.content);

        // Calculate XP reward based on length and difficulty
        const baseXP = 60;
        const difficultyMultiplier = difficulty === 'Advanced' ? 1.5 : difficulty === 'Intermediate' ? 1.2 : 1.0;
        const lengthBonus = estimatedMinutes > 5 ? 20 : 0;
        const xpReward = Math.round(baseXP * difficultyMultiplier) + lengthBonus;

        // Generate teaser from first segment
        const teaser = this.generateTeaser(story);

        return {
            ...story,
            metadata: {
                teaser,
                category,
                difficulty,
                estimatedMinutes,
                xpReward,
                imageUrl: CATEGORY_IMAGES[category],
                emotion: this.getEmotionFromCategory(category),
            },
        };
    }

    private detectCategory(text: string): StoryCategory {
        const lowerText = text.toLowerCase();

        if (
            lowerText.includes('mystery') ||
            lowerText.includes('detective') ||
            lowerText.includes('secret') ||
            lowerText.includes('murder')
        ) {
            return 'Mystery';
        }

        if (
            lowerText.includes('love') ||
            lowerText.includes('heart') ||
            lowerText.includes('romance') ||
            lowerText.includes('couple')
        ) {
            return 'Romance';
        }

        if (
            lowerText.includes('space') ||
            lowerText.includes('robot') ||
            lowerText.includes('future') ||
            lowerText.includes('sci-fi')
        ) {
            return 'Sci-Fi';
        }

        if (
            lowerText.includes('adventure') ||
            lowerText.includes('journey') ||
            lowerText.includes('explore') ||
            lowerText.includes('quest')
        ) {
            return 'Adventure';
        }

        if (
            lowerText.includes('funny') ||
            lowerText.includes('laugh') ||
            lowerText.includes('comedy') ||
            lowerText.includes('joke')
        ) {
            return 'Comedy';
        }

        return 'Drama'; // Default
    }

    private generateTeaser(story: Story): string {
        if (story.segments && story.segments.length > 0) {
            const firstSegment = story.segments[0].native;
            // Take first 2 sentences or 120 characters, whichever is shorter
            const sentences = firstSegment.match(/[^.!?]+[.!?]+/g) || [firstSegment];
            const teaser = sentences.slice(0, 2).join(' ');
            return teaser.length > 120 ? teaser.substring(0, 117) + '...' : teaser;
        }
        return 'An intriguing story awaits...';
    }

    private getEmotionFromCategory(category: StoryCategory): 'suspenseful' | 'romantic' | 'exciting' | 'thoughtful' | 'funny' {
        switch (category) {
            case 'Mystery':
                return 'suspenseful';
            case 'Romance':
                return 'romantic';
            case 'Adventure':
            case 'Sci-Fi':
                return 'exciting';
            case 'Comedy':
                return 'funny';
            case 'Drama':
            default:
                return 'thoughtful';
        }
    }

    async reset(): Promise<void> {
        this.state = DEFAULT_QUEUE_STATE;
        await this.persist();
    }

    private async persist(): Promise<void> {
        try {
            await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to persist story queue:', error);
        }
    }
}

export const storyQueueService = new StoryQueueService();
