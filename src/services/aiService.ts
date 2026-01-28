// src/services/aiService.ts
// AI Service - Entry point for story generation

import { UserProfile } from '../context/OnboardingContext';
import { Story, WordAnalysis, StoryQuiz } from '../types/story';
import { generateStoryProgressive, ProgressiveStoryResult } from './storyGenerationService';
import { LearningAnalytics } from '../utils/learningAnalytics';

/**
 * Generate story with progressive loading - story returns immediately,
 * quiz loads in background while user reads the story.
 *
 * This is the ONLY story generation function - all others are removed.
 */
export const generateStoryFast = async (
  profile: UserProfile,
  grammarFocus: string = 'General',
  reviewWords: WordAnalysis[] = [],
  lastStory?: Story | null
): Promise<{
  story: Story;
  analytics: LearningAnalytics;
  quizPromise: Promise<StoryQuiz>;
}> => {
  try {
    console.log(`📡 AI Service: Generating story...`);
    console.log(`   Grammar Focus: [${grammarFocus}]`);
    console.log(`   Review Words: [${reviewWords.length} items]`);
    console.log(`   Series State: ${lastStory ? 'continuation' : 'first'}`);
    if (lastStory) {
      console.log(`   Last Story: "${lastStory.title}"`);
    }

    const result = await generateStoryProgressive(profile, grammarFocus, reviewWords, lastStory);

    console.log(`✅ AI Service: Story ready!`);
    console.log(`   Title: "${result.story.title}"`);
    console.log(`   Quiz: Loading in background...`);

    return result;

  } catch (error) {
    console.error('❌ AI Service Error:', error);
    throw error;
  }
};

// Re-export for compatibility
export { generateStoryProgressive } from './storyGenerationService';
export type { ProgressiveStoryResult } from './storyGenerationService';
