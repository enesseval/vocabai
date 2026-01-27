// src/services/storyGenerationService.ts
// Orchestrator for story generation with hybrid architecture

import { supabase } from '../utils/supabaseClient';
import { calculateLearningAnalytics, LearningAnalytics } from '../utils/learningAnalytics';
import {
  validateStoryResponse,
  validateQuizResponse,
  performQualityCheck,
  shouldRetryStory,
  shouldRetryQuiz,
  StoryResponse,
  QuizResponse,
  QualityCheck
} from '../utils/storyValidator';
import { UserProfile } from '../context/OnboardingContext';
import {
  Story,
  WordAnalysis,
  StoryQuiz,
  StoryGenerationResult,
  AIStoryResponse,
  AIQuizResponse
} from '../types/story';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const MAX_STORY_RETRIES = 2;
const MAX_QUIZ_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// ═══════════════════════════════════════════════════════════════
// PROGRESSIVE LOADING RESULT TYPE
// ═══════════════════════════════════════════════════════════════
export interface ProgressiveStoryResult {
  story: Story;
  analytics: LearningAnalytics;
  quizPromise: Promise<StoryQuiz>; // Quiz arka planda yükleniyor
}

// ═══════════════════════════════════════════════════════════════
// PROGRESSIVE STORY GENERATION (Story hemen, Quiz arka planda)
// ═══════════════════════════════════════════════════════════════
export async function generateStoryProgressive(
  profile: UserProfile,
  grammarFocus: string = 'General',
  reviewWords: WordAnalysis[] = []
): Promise<ProgressiveStoryResult> {
  console.log('🚀 Progressive Story Generation Started');
  console.log(`   Level: ${profile.level}`);
  console.log(`   Grammar: ${grammarFocus}`);
  console.log(`   Review Words: ${reviewWords.length}`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Generate Story (Blocking - kullanıcı bunu beklemeli)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📖 Step 1: Generating Story...');

  let storyResponse: AIStoryResponse | null = null;
  let storyRetryCount = 0;
  let storyValidation = { valid: false, errors: ['Not attempted'], warnings: [] };

  while (storyRetryCount <= MAX_STORY_RETRIES) {
    try {
      storyResponse = await callStoryGeneration(profile, grammarFocus, reviewWords);
      storyValidation = validateStoryResponse(storyResponse as unknown as StoryResponse, profile.level);

      if (storyValidation.valid) {
        console.log('   ✅ Story generated successfully');
        break;
      } else {
        console.log(`   ⚠️ Story validation failed (attempt ${storyRetryCount + 1}/${MAX_STORY_RETRIES + 1})`);
        if (storyRetryCount < MAX_STORY_RETRIES) {
          await delay(RETRY_DELAY_MS);
          storyRetryCount++;
        } else {
          throw new Error(`Story generation failed: ${storyValidation.errors.join(', ')}`);
        }
      }
    } catch (error: any) {
      console.error(`   ❌ Story API Error: ${error.message}`);
      if (storyRetryCount < MAX_STORY_RETRIES) {
        await delay(RETRY_DELAY_MS);
        storyRetryCount++;
      } else {
        throw error;
      }
    }
  }

  if (!storyResponse) {
    throw new Error('Story generation failed: No response');
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Calculate Analytics (Senkron - çok hızlı)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📊 Step 2: Calculating Analytics...');

  const analytics = calculateLearningAnalytics(
    storyResponse.vocabulary,
    storyResponse.grammar_focus_used,
    storyResponse.segments
  );

  console.log(`   ✅ Analytics ready (${analytics.total_vocabulary} words, difficulty: ${analytics.difficulty_score})`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Assemble Story (Hemen döndürülecek)
  // ═══════════════════════════════════════════════════════════════
  const fullContent = storyResponse.segments.map(s => s.target).join('\n\n');

  const story: Story = {
    id: `ai_${Date.now()}`,
    title: storyResponse.title,
    titleNative: storyResponse.title_native,
    content: fullContent,
    segments: storyResponse.segments,
    language: profile.targetLang || 'en',
    topicIds: profile.interests,
    level: storyResponse.metadata.level,
    vocabulary: storyResponse.vocabulary,
    metadata: {
      teaser: storyResponse.metadata.teaser,
      teaser_native: storyResponse.metadata.teaser_native,
      genre: storyResponse.metadata.genre,
      emotion: storyResponse.metadata.emotion,
      word_count: storyResponse.metadata.word_count,
      estimated_read_minutes: storyResponse.metadata.estimated_read_minutes,
    },
    series_state: storyResponse.series_state,
    grammar_focus_used: storyResponse.grammar_focus_used,
  };

  // ═══════════════════════════════════════════════════════════════
  // STEP 4: Start Quiz Generation (Arka planda - non-blocking)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📝 Step 3: Starting Quiz generation in background...');

  const quizPromise = generateQuizInBackground(
    storyResponse.segments,
    storyResponse.vocabulary,
    grammarFocus,
    profile
  );

  console.log('\n🎉 Story Ready! (Quiz loading in background)');

  return {
    story,
    analytics,
    quizPromise
  };
}

// ═══════════════════════════════════════════════════════════════
// BACKGROUND QUIZ GENERATION
// ═══════════════════════════════════════════════════════════════
async function generateQuizInBackground(
  segments: any[],
  vocabulary: WordAnalysis[],
  grammarFocus: string,
  profile: UserProfile
): Promise<StoryQuiz> {
  let quizRetryCount = 0;
  const emptyQuiz: StoryQuiz = {
    fill_in_blank: [],
    true_false: [],
    comprehension: [],
    word_match: []
  };

  while (quizRetryCount <= MAX_QUIZ_RETRIES) {
    try {
      const quizResponse = await callQuizGeneration(segments, vocabulary, grammarFocus, profile);
      const quizValidation = validateQuizResponse(quizResponse as unknown as QuizResponse);

      if (quizValidation.valid) {
        console.log('   ✅ Quiz generated successfully (background)');
        return quizResponse.quiz;
      } else {
        console.log(`   ⚠️ Quiz validation failed (background attempt ${quizRetryCount + 1})`);
        if (quizRetryCount < MAX_QUIZ_RETRIES) {
          await delay(RETRY_DELAY_MS);
          quizRetryCount++;
        } else {
          console.log('   ⚠️ Returning empty quiz after retries');
          return emptyQuiz;
        }
      }
    } catch (error: any) {
      console.error(`   ❌ Quiz API Error (background): ${error.message}`);
      if (quizRetryCount < MAX_QUIZ_RETRIES) {
        await delay(RETRY_DELAY_MS);
        quizRetryCount++;
      } else {
        return emptyQuiz;
      }
    }
  }

  return emptyQuiz;
}

// ═══════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR FUNCTION
// ═══════════════════════════════════════════════════════════════
export async function generateCompleteStory(
  profile: UserProfile,
  grammarFocus: string = 'General',
  reviewWords: WordAnalysis[] = []
): Promise<StoryGenerationResult> {
  console.log('🚀 Story Generation Started');
  console.log(`   Level: ${profile.level}`);
  console.log(`   Grammar: ${grammarFocus}`);
  console.log(`   Review Words: ${reviewWords.length}`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Generate Story (API Call 1)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📖 Step 1: Generating Story...');

  let storyResponse: AIStoryResponse | null = null;
  let storyRetryCount = 0;
  let storyValidation = { valid: false, errors: ['Not attempted'], warnings: [] };

  while (storyRetryCount <= MAX_STORY_RETRIES) {
    try {
      storyResponse = await callStoryGeneration(profile, grammarFocus, reviewWords);
      storyValidation = validateStoryResponse(storyResponse as unknown as StoryResponse, profile.level);

      if (storyValidation.valid) {
        console.log('   ✅ Story generated successfully');
        break;
      } else {
        console.log(`   ⚠️ Story validation failed (attempt ${storyRetryCount + 1}/${MAX_STORY_RETRIES + 1})`);
        console.log(`      Errors: ${storyValidation.errors.join(', ')}`);

        if (storyRetryCount < MAX_STORY_RETRIES) {
          await delay(RETRY_DELAY_MS);
          storyRetryCount++;
        } else {
          throw new Error(`Story generation failed after ${MAX_STORY_RETRIES + 1} attempts: ${storyValidation.errors.join(', ')}`);
        }
      }
    } catch (error: any) {
      console.error(`   ❌ Story API Error: ${error.message}`);
      if (storyRetryCount < MAX_STORY_RETRIES) {
        await delay(RETRY_DELAY_MS);
        storyRetryCount++;
      } else {
        throw error;
      }
    }
  }

  if (!storyResponse) {
    throw new Error('Story generation failed: No response');
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Generate Quiz (API Call 2)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📝 Step 2: Generating Quiz...');

  let quizResponse: AIQuizResponse | null = null;
  let quizRetryCount = 0;
  let quizValidation = { valid: false, errors: ['Not attempted'], warnings: [] };

  while (quizRetryCount <= MAX_QUIZ_RETRIES) {
    try {
      quizResponse = await callQuizGeneration(
        storyResponse.segments,
        storyResponse.vocabulary,
        grammarFocus,
        profile
      );
      quizValidation = validateQuizResponse(quizResponse as unknown as QuizResponse);

      if (quizValidation.valid) {
        console.log('   ✅ Quiz generated successfully');
        break;
      } else {
        console.log(`   ⚠️ Quiz validation failed (attempt ${quizRetryCount + 1}/${MAX_QUIZ_RETRIES + 1})`);
        console.log(`      Errors: ${quizValidation.errors.join(', ')}`);

        if (quizRetryCount < MAX_QUIZ_RETRIES) {
          await delay(RETRY_DELAY_MS);
          quizRetryCount++;
        } else {
          // Quiz failure is not critical, continue with partial data
          console.log('   ⚠️ Continuing without complete quiz');
          break;
        }
      }
    } catch (error: any) {
      console.error(`   ❌ Quiz API Error: ${error.message}`);
      if (quizRetryCount < MAX_QUIZ_RETRIES) {
        await delay(RETRY_DELAY_MS);
        quizRetryCount++;
      } else {
        // Quiz failure is not critical
        console.log('   ⚠️ Continuing without quiz');
        break;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Calculate Analytics (Client-side, NO API)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📊 Step 3: Calculating Analytics...');

  const analytics = calculateLearningAnalytics(
    storyResponse.vocabulary,
    storyResponse.grammar_focus_used,
    storyResponse.segments
  );

  console.log(`   Total vocabulary: ${analytics.total_vocabulary}`);
  console.log(`   New words: ${analytics.new_words}`);
  console.log(`   Review words: ${analytics.review_words}`);
  console.log(`   Grammar structures: ${analytics.grammar_structures_used}`);
  console.log(`   Difficulty: ${analytics.difficulty_score}`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 4: Quality Check (Client-side, NO API)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n🔍 Step 4: Quality Check...');

  const qualityCheck = performQualityCheck(
    storyResponse as unknown as StoryResponse,
    quizResponse as unknown as QuizResponse,
    analytics,
    profile.level
  );

  console.log(`   Confidence Score: ${qualityCheck.confidence_score}`);
  if (qualityCheck.errors.length > 0) {
    console.log(`   Errors: ${qualityCheck.errors.join(', ')}`);
  }
  if (qualityCheck.warnings.length > 0) {
    console.log(`   Warnings: ${qualityCheck.warnings.join(', ')}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 5: Assemble Final Response
  // ═══════════════════════════════════════════════════════════════
  console.log('\n✨ Step 5: Assembling Response...');

  const fullContent = storyResponse.segments.map(s => s.target).join('\n\n');

  const story: Story = {
    id: `ai_${Date.now()}`,
    title: storyResponse.title,
    titleNative: storyResponse.title_native,
    content: fullContent,
    segments: storyResponse.segments,
    language: profile.targetLang || 'en',
    topicIds: profile.interests,
    level: storyResponse.metadata.level,
    vocabulary: storyResponse.vocabulary,
    metadata: {
      teaser: storyResponse.metadata.teaser,
      teaser_native: storyResponse.metadata.teaser_native,
      genre: storyResponse.metadata.genre,
      emotion: storyResponse.metadata.emotion,
      word_count: storyResponse.metadata.word_count,
      estimated_read_minutes: storyResponse.metadata.estimated_read_minutes,
    },
    series_state: storyResponse.series_state,
    grammar_focus_used: storyResponse.grammar_focus_used,
    quiz: quizResponse?.quiz
  };

  const result: StoryGenerationResult = {
    story,
    quiz: quizResponse?.quiz || {
      fill_in_blank: [],
      true_false: [],
      comprehension: [],
      word_match: []
    },
    analytics,
    quality: qualityCheck
  };

  console.log('\n🎉 Story Generation Complete!');

  return result;
}

// ═══════════════════════════════════════════════════════════════
// API CALL FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function callStoryGeneration(
  profile: UserProfile,
  grammarFocus: string,
  reviewWords: WordAnalysis[]
): Promise<AIStoryResponse> {
  const { data, error } = await supabase.functions.invoke('generate-story', {
    body: {
      level: profile.level,
      interests: profile.interests,
      targetLang: profile.targetLang || 'en',
      nativeLang: profile.nativeLang || 'tr',
      grammarFocus: grammarFocus,
      reviewWords: reviewWords.map(w => ({
        word: w.word,
        translation: w.translation
      }))
    }
  });

  if (error) {
    throw new Error(`Story generation API error: ${error.message}`);
  }

  return data as AIStoryResponse;
}

async function callQuizGeneration(
  segments: any[],
  vocabulary: WordAnalysis[],
  grammarFocus: string,
  profile: UserProfile
): Promise<AIQuizResponse> {
  const { data, error } = await supabase.functions.invoke('generate-quiz', {
    body: {
      segments,
      vocabulary,
      grammarFocus,
      level: profile.level,
      targetLang: profile.targetLang || 'en',
      nativeLang: profile.nativeLang || 'tr',
    }
  });

  if (error) {
    throw new Error(`Quiz generation API error: ${error.message}`);
  }

  return data as AIQuizResponse;
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY WRAPPER
// ═══════════════════════════════════════════════════════════════

/**
 * Legacy wrapper for backward compatibility with existing code
 * Use generateCompleteStory for new implementations
 */
export async function generateDailyStoryLegacy(
  profile: UserProfile,
  grammarFocus: string = 'General',
  reviewWords: WordAnalysis[] = []
): Promise<Story> {
  const result = await generateCompleteStory(profile, grammarFocus, reviewWords);
  return result.story;
}
