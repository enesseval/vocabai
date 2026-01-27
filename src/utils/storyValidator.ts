// src/utils/storyValidator.ts
// Client-side validation for story and quiz responses

import { LearningAnalytics } from './learningAnalytics';

// Types for validation
export interface StoryResponse {
  title: string;
  title_native: string;
  metadata: {
    teaser: string;
    teaser_native: string;
    emotion: string;
    genre: string;
    level: string;
    word_count: number;
    estimated_read_minutes: number;
  };
  grammar_focus_used: string;
  segments: Array<{
    target: string;
    native: string;
    marked_words: string[];
  }>;
  vocabulary: Array<{
    word: string;
    lemma: string;
    type: string;
    translation: string;
    explanation: string;
    phonetic: string;
    priority: string;
    is_review_word: boolean;
    in_story_context: string;
    example_sentences: Array<{
      original: string;
      translated: string;
    }>;
  }>;
  series_state: {
    can_continue: boolean;
    series_id: string | null;
    episode: number;
    protagonist: string;
    setting: string;
    current_conflict: string;
    unresolved_hook: string;
    key_characters: string[];
    suggested_next_title: string;
  };
}

export interface QuizResponse {
  quiz: {
    fill_in_blank: Array<{
      sentence: string;
      answer: string;
      options: string[];
      hint: string;
      tests_grammar: string;
    }>;
    true_false: Array<{
      statement: string;
      answer: boolean;
      evidence: string;
    }>;
    comprehension: Array<{
      question: string;
      answer: string;
      answer_native: string;
    }>;
    word_match: Array<{
      word: string;
      translation: string;
    }>;
  };
}

export interface QualityCheck {
  word_count_valid: boolean;
  segments_complete: boolean;
  vocabulary_min_met: boolean;
  vocabulary_consistency: boolean;
  grammar_focus_applied: boolean;
  quiz_complete: boolean;
  confidence_score: number;
  errors: string[];
  warnings: string[];
}

// Word count ranges by level
const LEVEL_WORD_RANGES: Record<string, { min: number; max: number }> = {
  'A1': { min: 80, max: 180 },
  'A2': { min: 130, max: 230 },
  'B1': { min: 180, max: 320 },
  'B2': { min: 250, max: 400 },
  'C1': { min: 320, max: 500 },
};

/**
 * Validate story response from API
 */
export function validateStoryResponse(
  story: StoryResponse,
  level: string
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check required fields exist
  if (!story.title) errors.push('Missing title');
  if (!story.title_native) errors.push('Missing title_native');
  if (!story.metadata) errors.push('Missing metadata');
  if (!story.segments || story.segments.length === 0) errors.push('Missing segments');
  if (!story.vocabulary || story.vocabulary.length === 0) errors.push('Missing vocabulary');

  // 2. Word count validation
  const wordCount = story.metadata?.word_count || 0;
  const range = LEVEL_WORD_RANGES[level] || LEVEL_WORD_RANGES['B1'];

  if (wordCount < range.min) {
    warnings.push(`Word count ${wordCount} below minimum ${range.min} for ${level}`);
  }
  if (wordCount > range.max) {
    warnings.push(`Word count ${wordCount} above maximum ${range.max} for ${level}`);
  }

  // 3. Segments completeness
  story.segments?.forEach((seg, idx) => {
    if (!seg.target) errors.push(`Segment ${idx + 1} missing target text`);
    if (!seg.native) errors.push(`Segment ${idx + 1} missing native translation`);
    if (!seg.marked_words || seg.marked_words.length === 0) {
      warnings.push(`Segment ${idx + 1} has no marked words`);
    }
  });

  // 4. Vocabulary minimum (15 words)
  const vocabCount = story.vocabulary?.length || 0;
  if (vocabCount < 15) {
    errors.push(`Vocabulary count ${vocabCount} below minimum 15`);
  }

  // 5. Vocabulary consistency: all marked_words exist in vocabulary
  const vocabWords = new Set(
    story.vocabulary?.map(v => v.word.toLowerCase()) || []
  );
  const allMarkedWords = story.segments?.flatMap(s => s.marked_words || []) || [];
  const missingWords = allMarkedWords.filter(w => !vocabWords.has(w.toLowerCase()));

  if (missingWords.length > 0) {
    errors.push(`Marked words not in vocabulary: ${[...new Set(missingWords)].join(', ')}`);
  }

  // 6. Vocabulary field validation
  story.vocabulary?.forEach((vocab, idx) => {
    if (!vocab.word) errors.push(`Vocabulary item ${idx + 1} missing word`);
    if (!vocab.translation) warnings.push(`Vocabulary item "${vocab.word}" missing translation`);
    if (!vocab.type) warnings.push(`Vocabulary item "${vocab.word}" missing type`);
    if (!vocab.example_sentences || vocab.example_sentences.length < 2) {
      warnings.push(`Vocabulary item "${vocab.word}" has fewer than 2 example sentences`);
    }
  });

  // 7. Series state validation
  if (!story.series_state) {
    warnings.push('Missing series_state');
  }

  // 8. Teaser validation
  if (!story.metadata?.teaser || story.metadata.teaser.length < 20) {
    warnings.push('Teaser is missing or too short');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate quiz response from API
 */
export function validateQuizResponse(
  quiz: QuizResponse
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!quiz.quiz) {
    errors.push('Missing quiz object');
    return { valid: false, errors, warnings };
  }

  const q = quiz.quiz;

  // Fill in blank validation (need 3)
  if (!q.fill_in_blank || q.fill_in_blank.length < 3) {
    errors.push(`Fill-in-blank questions: ${q.fill_in_blank?.length || 0}/3 required`);
  } else {
    q.fill_in_blank.forEach((item, idx) => {
      if (!item.sentence?.includes('___')) {
        errors.push(`Fill-in-blank ${idx + 1} missing blank (___)`);
      }
      if (!item.options || item.options.length !== 4) {
        errors.push(`Fill-in-blank ${idx + 1} needs exactly 4 options`);
      }
      if (item.options && !item.options.includes(item.answer)) {
        errors.push(`Fill-in-blank ${idx + 1} answer not in options`);
      }
    });
  }

  // True/false validation (need 3)
  if (!q.true_false || q.true_false.length < 3) {
    errors.push(`True/false questions: ${q.true_false?.length || 0}/3 required`);
  } else {
    const trueCount = q.true_false.filter(t => t.answer === true).length;
    const falseCount = q.true_false.filter(t => t.answer === false).length;
    if (trueCount === 0 || falseCount === 0) {
      warnings.push('True/false should have mix of true and false answers');
    }
    q.true_false.forEach((item, idx) => {
      if (!item.evidence) {
        warnings.push(`True/false ${idx + 1} missing evidence`);
      }
    });
  }

  // Comprehension validation (need 2)
  if (!q.comprehension || q.comprehension.length < 2) {
    errors.push(`Comprehension questions: ${q.comprehension?.length || 0}/2 required`);
  }

  // Word match validation (need 5)
  if (!q.word_match || q.word_match.length < 5) {
    errors.push(`Word match pairs: ${q.word_match?.length || 0}/5 required`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Full quality check combining story, quiz, and analytics
 */
export function performQualityCheck(
  story: StoryResponse,
  quiz: QuizResponse | null,
  analytics: LearningAnalytics,
  level: string
): QualityCheck {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Story validation
  const storyValidation = validateStoryResponse(story, level);
  errors.push(...storyValidation.errors);
  warnings.push(...storyValidation.warnings);

  // Quiz validation
  let quizComplete = false;
  if (quiz) {
    const quizValidation = validateQuizResponse(quiz);
    errors.push(...quizValidation.errors.map(e => `Quiz: ${e}`));
    warnings.push(...quizValidation.warnings.map(w => `Quiz: ${w}`));
    quizComplete = quizValidation.valid;
  }

  // Grammar focus validation using analytics
  const grammarFocusApplied =
    story.grammar_focus_used !== 'General' &&
    analytics.grammar_structures_used >= 6;

  if (story.grammar_focus_used !== 'General' && analytics.grammar_structures_used < 6) {
    warnings.push(
      `Grammar focus "${story.grammar_focus_used}" used only ${analytics.grammar_structures_used} times (minimum: 6)`
    );
  }

  // Calculate checks
  const wordCountValid = (() => {
    const range = LEVEL_WORD_RANGES[level] || LEVEL_WORD_RANGES['B1'];
    const wc = story.metadata?.word_count || 0;
    return wc >= range.min && wc <= range.max;
  })();

  const segmentsComplete = story.segments?.every(seg =>
    seg.target && seg.native && seg.marked_words?.length > 0
  ) ?? false;

  const vocabularyMinMet = (story.vocabulary?.length || 0) >= 15;

  const vocabWords = new Set(story.vocabulary?.map(v => v.word.toLowerCase()) || []);
  const allMarkedWords = story.segments?.flatMap(s => s.marked_words || []) || [];
  const vocabularyConsistency = allMarkedWords.every(w => vocabWords.has(w.toLowerCase()));

  // Confidence score
  const checks = [
    wordCountValid,
    segmentsComplete,
    vocabularyMinMet,
    vocabularyConsistency,
    grammarFocusApplied,
    quizComplete
  ];
  const passedChecks = checks.filter(Boolean).length;
  const confidenceScore = Math.round((passedChecks / checks.length) * 100) / 100;

  return {
    word_count_valid: wordCountValid,
    segments_complete: segmentsComplete,
    vocabulary_min_met: vocabularyMinMet,
    vocabulary_consistency: vocabularyConsistency,
    grammar_focus_applied: grammarFocusApplied,
    quiz_complete: quizComplete,
    confidence_score: confidenceScore,
    errors,
    warnings
  };
}

/**
 * Determine if story should be retried
 */
export function shouldRetryStory(
  storyValidation: { valid: boolean; errors: string[] }
): boolean {
  // Retry if there are critical errors
  return !storyValidation.valid || storyValidation.errors.length > 0;
}

/**
 * Determine if quiz should be retried
 */
export function shouldRetryQuiz(
  quizValidation: { valid: boolean; errors: string[] }
): boolean {
  return !quizValidation.valid;
}
