// src/hooks/useStoryQueue.ts

import { useState, useEffect, useCallback } from 'react';
import { Story, StoryDifficulty } from '../types/story';
import { storyQueueService } from '../services/storyQueueService';
import { useOnboarding } from '../context/OnboardingContext';

interface UseStoryQueueResult {
    currentStory: Story | null;
    queue: Story[];
    isLoading: boolean;
    error: string | null;
    fillQueue: () => Promise<void>;
    markComplete: (storyId: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export const useStoryQueue = (): UseStoryQueueResult => {
    const { userProfile } = useOnboarding();
    const [currentStory, setCurrentStory] = useState<Story | null>(null);
    const [queue, setQueue] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadQueue = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const state = await storyQueueService.initialize();
            setQueue(state.queue);
            setCurrentStory(state.queue[0] || null);
        } catch (err) {
            setError('Failed to load story queue');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fillQueue = useCallback(async () => {
        if (!userProfile.targetLang || !userProfile.nativeLang) {
            setError('User profile incomplete');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const updatedQueue = await storyQueueService.fillQueue({
                level: userProfile.level as StoryDifficulty,
                interests: userProfile.interests,
                targetLang: userProfile.targetLang,
                nativeLang: userProfile.nativeLang,
            });

            setQueue(updatedQueue);
            setCurrentStory(updatedQueue[0] || null);
        } catch (err) {
            setError('Failed to generate stories');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [userProfile]);

    const markComplete = useCallback(
        async (storyId: string) => {
            try {
                await storyQueueService.markStoryComplete(storyId);

                // Update local state
                const updatedQueue = storyQueueService.getQueue();
                setQueue(updatedQueue);
                setCurrentStory(updatedQueue[0] || null);

                // Auto-fill queue if it's getting low
                if (updatedQueue.length < 2) {
                    await fillQueue();
                }
            } catch (err) {
                setError('Failed to mark story complete');
                console.error(err);
            }
        },
        [fillQueue]
    );

    const refresh = useCallback(async () => {
        await loadQueue();
    }, [loadQueue]);

    useEffect(() => {
        loadQueue();
    }, [loadQueue]);

    // Auto-fill queue if empty and user profile is complete
    useEffect(() => {
        if (
            !isLoading &&
            queue.length === 0 &&
            userProfile.targetLang &&
            userProfile.nativeLang
        ) {
            fillQueue();
        }
    }, [queue.length, isLoading, userProfile, fillQueue]);

    return {
        currentStory,
        queue,
        isLoading,
        error,
        fillQueue,
        markComplete,
        refresh,
    };
};
