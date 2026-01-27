// src/services/aiService.ts
// AI Service - Entry point for story generation

import { UserProfile } from '../context/OnboardingContext';
import { Story, WordAnalysis, StoryGenerationResult, StoryQuiz } from '../types/story';
import {
  generateCompleteStory,
  generateStoryProgressive,
  ProgressiveStoryResult
} from './storyGenerationService';
import { LearningAnalytics } from '../utils/learningAnalytics';

// ═══════════════════════════════════════════════════════════════
// PROGRESSIVE API: Story hemen, Quiz arka planda (ÖNERİLEN)
// ═══════════════════════════════════════════════════════════════

/**
 * Generate story with progressive loading - story returns immediately,
 * quiz loads in background while user reads the story.
 *
 * Usage:
 * ```typescript
 * const { story, analytics, quizPromise } = await generateStoryFast(profile, grammar, words);
 *
 * // Hikayeyi hemen göster
 * navigation.navigate('ReadStory', { story, analytics });
 *
 * // Quiz ekranına geçerken await et
 * const quiz = await quizPromise;
 * navigation.navigate('Quiz', { quiz });
 * ```
 */
export const generateStoryFast = async (
  profile: UserProfile,
  grammarFocus: string = 'General',
  reviewWords: WordAnalysis[] = []
): Promise<{
  story: Story;
  analytics: LearningAnalytics;
  quizPromise: Promise<StoryQuiz>;
}> => {
  try {
    console.log(`📡 AI Service (Fast): Generating story...`);
    console.log(`   Grammar Focus: [${grammarFocus}]`);
    console.log(`   Review Words: [${reviewWords.length} items]`);

    const result = await generateStoryProgressive(profile, grammarFocus, reviewWords);

    console.log(`✅ AI Service (Fast): Story ready!`);
    console.log(`   Title: "${result.story.title}"`);
    console.log(`   Quiz: Loading in background...`);

    return result;

  } catch (error) {
    console.error('❌ AI Service Error:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════
// BLOCKING API: Story + Quiz birlikte (eski davranış)
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a complete story with quiz, analytics, and quality metrics
 * Waits for both story and quiz before returning.
 *
 * Use generateStoryFast for better UX.
 */
export const generateStoryWithQuiz = async (
  profile: UserProfile,
  grammarFocus: string = 'General',
  reviewWords: WordAnalysis[] = []
): Promise<StoryGenerationResult> => {
  try {
    console.log(`📡 AI Service: Generating story with quiz`);
    console.log(`   Grammar Focus: [${grammarFocus}]`);
    console.log(`   Review Words: [${reviewWords.length} items]`);

    const result = await generateCompleteStory(profile, grammarFocus, reviewWords);

    console.log(`✅ AI Service: Generation complete`);
    console.log(`   Story: "${result.story.title}"`);
    console.log(`   Quiz Questions: ${
      result.quiz.fill_in_blank.length +
      result.quiz.true_false.length +
      result.quiz.comprehension.length
    }`);
    console.log(`   Quality Score: ${result.quality.confidence_score}`);

    return result;

  } catch (error) {
    console.error('❌ AI Service Error:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════
// LEGACY API: Story Only (Backward Compatibility)
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a daily story (legacy method)
 * Use generateStoryWithQuiz for new implementations
 *
 * @deprecated Use generateStoryWithQuiz instead
 */
export const generateDailyStory = async (
  profile: UserProfile,
  grammarFocus: string = 'General',
  reviewWords: WordAnalysis[] = []
): Promise<Story> => {
  try {
    console.log(`📡 AI Service (Legacy): Generating story`);
    console.log(`   Grammar Focus: [${grammarFocus}]`);
    console.log(`   Review Words: [${reviewWords.length} items]`);

    // Use the new orchestrator but return only the story
    const result = await generateCompleteStory(profile, grammarFocus, reviewWords);

    // Transform to legacy format
    const story: Story = {
      ...result.story,
      // Attach quiz to story for backward compatibility
      quiz: result.quiz
    };

    console.log(`✅ AI Service (Legacy): Story generated`);
    console.log(`   Title: "${story.title}"`);

    return story;

  } catch (error) {
    console.error('❌ AI Service Error:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════
// UTILITY EXPORTS
// ═══════════════════════════════════════════════════════════════

export { generateCompleteStory, generateStoryProgressive } from './storyGenerationService';
export type { ProgressiveStoryResult } from './storyGenerationService';
