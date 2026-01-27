// src/services/aiService.ts
// AI Service - Entry point for story generation

import { UserProfile } from '../context/OnboardingContext';
import { Story, WordAnalysis, StoryGenerationResult } from '../types/story';
import {
  generateCompleteStory,
  generateDailyStoryLegacy
} from './storyGenerationService';

// ═══════════════════════════════════════════════════════════════
// NEW API: Complete Story Generation with Quiz & Analytics
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a complete story with quiz, analytics, and quality metrics
 * This is the recommended method for new implementations
 *
 * @param profile - User profile from onboarding
 * @param grammarFocus - Grammar topic to focus on (e.g., "Past Simple")
 * @param reviewWords - Previously learned words for spaced repetition
 * @returns Complete generation result with story, quiz, analytics, and quality
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

export { generateCompleteStory } from './storyGenerationService';
