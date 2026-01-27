// src/utils/learningAnalytics.ts
// Client-side analytics calculator - Zero API cost

import { WordAnalysis, StorySegment } from '../types/story';

export interface LearningAnalytics {
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
}

// Grammar pattern mappings for different focus areas
const GRAMMAR_PATTERNS: Record<string, RegExp> = {
  // Past Simple
  'past simple': /\b(went|did|was|were|had|saw|came|took|made|got|said|knew|thought|found|gave|told|felt|became|left|kept|let|began|seemed|showed|heard|played|moved|lived|believed|brought|happened|wrote|sat|stood|lost|paid|met|ran|sent|held|read|spent|grew|opened|walked|won|taught|called|tried|needed|turned|started|looked|used|worked|wanted|asked|liked|helped|talked|watched|waited|stopped|loved|remembered|understood|decided|learned|changed|followed|created|considered|appeared|expected|continued|allowed)\b/gi,

  // Present Simple
  'present simple': /\b(go|goes|do|does|is|am|are|have|has|see|sees|come|comes|take|takes|make|makes|get|gets|say|says|know|knows|think|thinks|find|finds|give|gives|tell|tells|feel|feels|become|becomes|leave|leaves|keep|keeps|let|lets|begin|begins|seem|seems)\b/gi,

  // Present Continuous
  'present continuous': /\b(am|is|are)\s+(being|going|doing|having|seeing|coming|taking|making|getting|saying|knowing|thinking|finding|giving|telling|feeling|becoming|leaving|keeping|letting|beginning|seeming|\w+ing)\b/gi,

  // Past Continuous
  'past continuous': /\b(was|were)\s+(\w+ing)\b/gi,

  // Present Perfect
  'present perfect': /\b(have|has)\s+(been|gone|done|had|seen|come|taken|made|got|gotten|said|known|thought|found|given|told|felt|become|left|kept|let|begun|seemed|\w+ed|\w+en)\b/gi,

  // Future (will)
  'future': /\b(will|shall|'ll)\s+(\w+)\b/gi,

  // Going to
  'going to': /\b(am|is|are)\s+going\s+to\s+(\w+)\b/gi,

  // Conditionals
  'conditional': /\b(if|unless|provided|supposing)\b.*\b(will|would|could|might|may)\b/gi,
  'first conditional': /\bif\b.*\b(will|'ll)\b/gi,
  'second conditional': /\bif\b.*\b(would|'d)\b/gi,
  'third conditional': /\bif\b.*\bhad\b.*\b(would have|'d have)\b/gi,

  // Passive Voice
  'passive': /\b(is|are|was|were|been|being)\s+(\w+ed|\w+en)\b/gi,

  // Modal Verbs
  'modal': /\b(can|could|may|might|must|shall|should|will|would|ought to)\b/gi,

  // Comparatives
  'comparative': /\b(\w+er)\s+than\b|\bmore\s+\w+\s+than\b/gi,

  // Superlatives
  'superlative': /\b(the\s+\w+est)\b|\bthe\s+most\s+\w+\b/gi,

  // Used to
  'used to': /\bused\s+to\s+(\w+)\b/gi,

  // Reported Speech
  'reported speech': /\b(said|told|asked|mentioned|explained|replied)\s+(that|if|whether)?\b/gi,
};

/**
 * Calculate learning analytics from story data
 * This runs entirely client-side - no API calls needed
 */
export function calculateLearningAnalytics(
  vocabulary: WordAnalysis[],
  grammarFocusUsed: string,
  segments: StorySegment[]
): LearningAnalytics {
  // Vocabulary counts
  const total = vocabulary.length;
  const reviewWords = vocabulary.filter(w => w.is_review_word === true).length;
  const newWords = total - reviewWords;

  // Type breakdown
  const typeCount = (type: string) =>
    vocabulary.filter(w => w.type?.toLowerCase() === type.toLowerCase()).length;

  // Priority breakdown
  const priorityCount = (priority: string) =>
    vocabulary.filter(w => w.priority === priority).length;

  // Grammar structures: pattern-based counting
  const grammarStructuresUsed = countGrammarUsage(segments, grammarFocusUsed);

  // Difficulty score (0.0 - 1.0)
  const difficultyScore = calculateDifficultyScore(vocabulary, segments);

  return {
    total_vocabulary: total,
    new_words: newWords,
    review_words: reviewWords,
    grammar_structures_used: grammarStructuresUsed,
    difficulty_score: difficultyScore,
    vocabulary_breakdown: {
      verbs: typeCount('Verb'),
      nouns: typeCount('Noun'),
      adjectives: typeCount('Adjective'),
      adverbs: typeCount('Adverb'),
      phrases: typeCount('Phrase'),
      idioms: typeCount('Idiom'),
    },
    priority_breakdown: {
      high: priorityCount('high'),
      medium: priorityCount('medium'),
      low: priorityCount('low'),
    }
  };
}

/**
 * Count grammar structure usage with pattern matching
 */
function countGrammarUsage(
  segments: StorySegment[],
  grammarFocus: string
): number {
  // Combine all target text
  const fullText = segments.map(s => s.target).join(' ');

  // Normalize grammar focus for pattern lookup
  const normalizedFocus = grammarFocus.toLowerCase().trim();

  // Find matching pattern
  let pattern: RegExp | null = null;

  for (const [key, regex] of Object.entries(GRAMMAR_PATTERNS)) {
    if (normalizedFocus.includes(key) || key.includes(normalizedFocus)) {
      pattern = regex;
      break;
    }
  }

  // If no specific pattern found, count marked words as fallback
  if (!pattern) {
    return segments.reduce((count, seg) => count + (seg.marked_words?.length || 0), 0);
  }

  // Count matches
  const matches = fullText.match(pattern);
  return matches ? matches.length : 0;
}

/**
 * Calculate difficulty score based on multiple factors
 * Returns a value between 0.0 (easiest) and 1.0 (hardest)
 */
function calculateDifficultyScore(
  vocabulary: WordAnalysis[],
  segments: StorySegment[]
): number {
  if (vocabulary.length === 0) return 0;

  // Factor 1: High priority word ratio (more = harder)
  const highPriorityRatio =
    vocabulary.filter(w => w.priority === 'high').length / vocabulary.length;

  // Factor 2: Average word length in vocabulary (longer = harder)
  const avgWordLength =
    vocabulary.reduce((sum, w) => sum + (w.word?.length || 0), 0) / vocabulary.length;
  const lengthFactor = Math.min(avgWordLength / 12, 1); // 12+ chars = max difficulty

  // Factor 3: Total word count in story (more words = harder)
  const totalStoryWords = segments
    .map(s => s.target?.split(/\s+/).length || 0)
    .reduce((a, b) => a + b, 0);
  const countFactor = Math.min(totalStoryWords / 400, 1); // 400+ words = max

  // Factor 4: Vocabulary density (vocab words / total words)
  const vocabDensity = vocabulary.length / Math.max(totalStoryWords, 1);
  const densityFactor = Math.min(vocabDensity * 10, 1); // 10%+ = max

  // Weighted average
  const score =
    (highPriorityRatio * 0.35) +
    (lengthFactor * 0.25) +
    (countFactor * 0.20) +
    (densityFactor * 0.20);

  return Math.round(score * 100) / 100; // 2 decimal places
}

/**
 * Get grammar usage details for display
 */
export function getGrammarUsageDetails(
  segments: StorySegment[],
  grammarFocus: string
): { count: number; examples: string[] } {
  const fullText = segments.map(s => s.target).join(' ');
  const normalizedFocus = grammarFocus.toLowerCase().trim();

  let pattern: RegExp | null = null;
  for (const [key, regex] of Object.entries(GRAMMAR_PATTERNS)) {
    if (normalizedFocus.includes(key) || key.includes(normalizedFocus)) {
      pattern = regex;
      break;
    }
  }

  if (!pattern) {
    return { count: 0, examples: [] };
  }

  const matches = fullText.match(pattern);
  return {
    count: matches ? matches.length : 0,
    examples: matches ? [...new Set(matches)].slice(0, 5) : []
  };
}
