// src/types/story.ts

// ═══════════════════════════════════════════════════════════════
// EXAMPLE SENTENCE
// ═══════════════════════════════════════════════════════════════
export interface ExampleSentence {
  original: string;
  translated: string;
}

// ═══════════════════════════════════════════════════════════════
// WORD ANALYSIS (Enhanced with new fields)
// ═══════════════════════════════════════════════════════════════
export interface WordAnalysis {
  word: string;
  lemma: string;
  translation: string;
  explanation: string;
  type: string; // Noun | Verb | Adjective | Adverb | Phrase | Idiom
  phonetic?: string;

  // Priority & Review tracking
  priority?: 'high' | 'medium' | 'low';
  is_review_word?: boolean;

  // Context from story
  in_story_context?: string;
  example_sentences?: ExampleSentence[];

  // Legacy fields (for backward compatibility)
  example?: string;
  level?: string;
  category?: string;
  topics?: string[];
  purposes?: string[];
  exampleSentences?: ExampleSentence[]; // Legacy naming
  relatedWords?: string[];
}

// ═══════════════════════════════════════════════════════════════
// STORY SEGMENT (Enhanced with marked words)
// ═══════════════════════════════════════════════════════════════
export interface StorySegment {
  target: string;
  native: string;
  marked_words?: string[]; // Words to highlight in this segment
}

// ═══════════════════════════════════════════════════════════════
// STORY CATEGORIES & EMOTIONS
// ═══════════════════════════════════════════════════════════════
export type StoryCategory = 'Mystery' | 'Romance' | 'Adventure' | 'Sci-Fi' | 'Comedy' | 'Drama';
export type StoryEmotion = 'suspenseful' | 'romantic' | 'exciting' | 'thoughtful' | 'funny';
export type StoryDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

// ═══════════════════════════════════════════════════════════════
// STORY METADATA (Enhanced)
// ═══════════════════════════════════════════════════════════════
export interface StoryMetadata {
  teaser?: string;
  teaser_native?: string;
  category?: StoryCategory;
  genre?: StoryCategory; // Alias for category
  emotion?: StoryEmotion;
  difficulty?: StoryDifficulty;
  estimatedMinutes?: number;
  estimated_read_minutes?: number; // API naming
  word_count?: number;
  xpReward?: number;
  imageUrl?: string;
}

// ═══════════════════════════════════════════════════════════════
// SERIES STATE (For story continuation)
// ═══════════════════════════════════════════════════════════════
export interface SeriesState {
  can_continue: boolean;
  series_id: string | null;
  episode: number;
  protagonist: string;
  setting: string;
  current_conflict: string;
  unresolved_hook: string;
  key_characters: string[];
  suggested_next_title: string;
}

// ═══════════════════════════════════════════════════════════════
// QUIZ TYPES
// ═══════════════════════════════════════════════════════════════
export interface FillInBlankQuestion {
  sentence: string;
  answer: string;
  options: string[];
  hint: string;
  tests_grammar: string;
}

export interface TrueFalseQuestion {
  statement: string;
  answer: boolean;
  evidence: string;
}

export interface ComprehensionQuestion {
  question: string;
  answer: string;
  answer_native: string;
}

export interface WordMatchPair {
  word: string;
  translation: string;
}

export interface StoryQuiz {
  fill_in_blank: FillInBlankQuestion[];
  true_false: TrueFalseQuestion[];
  comprehension: ComprehensionQuestion[];
  word_match: WordMatchPair[];
}

// ═══════════════════════════════════════════════════════════════
// MAIN STORY INTERFACE (Enhanced)
// ═══════════════════════════════════════════════════════════════
export interface Story {
  id: string;
  title: string;
  titleNative: string;
  content: string; // Full text for TTS
  segments?: StorySegment[];
  language: string;
  topicIds: number[];
  level: string;
  vocabulary?: WordAnalysis[];
  metadata?: StoryMetadata;
  series_state?: SeriesState;
  quiz?: StoryQuiz;
  grammar_focus_used?: string;
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════
export interface AIStoryResponse {
  title: string;
  title_native: string;
  metadata: {
    teaser: string;
    teaser_native: string;
    emotion: StoryEmotion;
    genre: StoryCategory;
    level: string;
    word_count: number;
    estimated_read_minutes: number;
  };
  grammar_focus_used: string;
  segments: StorySegment[];
  vocabulary: WordAnalysis[];
  series_state: SeriesState;
}

export interface AIQuizResponse {
  quiz: StoryQuiz;
}

// ═══════════════════════════════════════════════════════════════
// GENERATION RESULT (Complete response from orchestrator)
// ═══════════════════════════════════════════════════════════════
export interface StoryGenerationResult {
  story: Story;
  quiz: StoryQuiz;
  analytics: {
    total_vocabulary: number;
    new_words: number;
    review_words: number;
    grammar_structures_used: number;
    difficulty_score: number;
    vocabulary_breakdown: {
      verbs: number;
      nouns: number;
      adjectives: number;
      adverbs: number;
      phrases: number;
      idioms: number;
    };
    priority_breakdown: {
      high: number;
      medium: number;
      low: number;
    };
  };
  quality: {
    word_count_valid: boolean;
    segments_complete: boolean;
    vocabulary_min_met: boolean;
    vocabulary_consistency: boolean;
    grammar_focus_applied: boolean;
    quiz_complete: boolean;
    confidence_score: number;
    errors: string[];
    warnings: string[];
  };
}
