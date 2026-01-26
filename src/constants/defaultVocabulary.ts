// Smart vocabulary selection system using multi-tag filtering
// Reads from JSON dataset and selects words based on user's interests, purpose, and level

import { WordAnalysis } from '../types/story';
import vocabularyDataset from '../data/vocabulary-dataset.json';

// Interest ID to topic key mapping
const INTEREST_TO_TOPIC: Record<number, string> = {
    1: 'tech',
    2: 'philosophy',
    3: 'art',
    4: 'business',
    5: 'nature',
    6: 'science',
    7: 'literature',
    8: 'history',
    9: 'cinema',
    10: 'travel',
};

// Purpose ID to purpose key mapping
const PURPOSE_TO_KEY: Record<string, string> = {
    'career': 'career',
    'culture': 'culture',
    'brain': 'brain',
    'exam': 'exam',
};

interface FilterCriteria {
    interests: number[];      // User's selected interest IDs
    purpose?: string;         // User's learning purpose
    level?: string;           // User's proficiency level
}

/**
 * Filters words from dataset based on user criteria
 */
function filterWords(criteria: FilterCriteria): WordAnalysis[] {
    const { interests, purpose, level } = criteria;
    const dataset = vocabularyDataset.words as WordAnalysis[];

    // Convert interest IDs to topic keys
    const selectedTopics = interests.map(id => INTEREST_TO_TOPIC[id]).filter(Boolean);

    return dataset.filter(word => {
        // Filter by topics: word must have at least one matching topic
        const hasMatchingTopic = word.topics?.some(topic => selectedTopics.includes(topic));
        if (!hasMatchingTopic) return false;

        // Filter by purpose (if specified)
        if (purpose) {
            const purposeKey = PURPOSE_TO_KEY[purpose];
            const hasMatchingPurpose = word.purposes?.includes(purposeKey);
            if (!hasMatchingPurpose) return false;
        }

        // Filter by level (if specified)
        if (level && word.level !== level) {
            return false;
        }

        return true;
    });
}

/**
 * Shuffles array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Main function: Get default words based on user profile
 * Returns 5 random words matching user's interests, purpose, and level
 */
export function getDefaultWordsForInterests(
    interestIds: number[],
    purpose?: string,
    level?: string
): WordAnalysis[] {
    // Fallback if no interests selected
    if (interestIds.length === 0) {
        interestIds = [1]; // Default to tech
    }

    // Filter words based on criteria
    const matchingWords = filterWords({
        interests: interestIds,
        purpose,
        level,
    });

    // If we have enough words, shuffle and pick 5
    if (matchingWords.length >= 5) {
        const shuffled = shuffleArray(matchingWords);
        return shuffled.slice(0, 5);
    }

    // If not enough matching words, relax filters progressively

    // Step 1: Try without level filter
    if (level) {
        const withoutLevel = filterWords({
            interests: interestIds,
            purpose,
        });
        if (withoutLevel.length >= 5) {
            const shuffled = shuffleArray(withoutLevel);
            return shuffled.slice(0, 5);
        }
    }

    // Step 2: Try without purpose filter
    if (purpose) {
        const withoutPurpose = filterWords({
            interests: interestIds,
        });
        if (withoutPurpose.length >= 5) {
            const shuffled = shuffleArray(withoutPurpose);
            return shuffled.slice(0, 5);
        }
    }

    // Step 3: Last resort - just return first 5 from dataset
    console.warn('Not enough matching words, using fallback');
    const allWords = vocabularyDataset.words as WordAnalysis[];
    return shuffleArray(allWords).slice(0, 5);
}

/**
 * Get words for a specific topic
 */
export function getWordsByTopic(topic: string, limit: number = 10): WordAnalysis[] {
    const dataset = vocabularyDataset.words as WordAnalysis[];
    const filtered = dataset.filter(word => word.topics?.includes(topic));
    return shuffleArray(filtered).slice(0, limit);
}

/**
 * Get words for a specific purpose
 */
export function getWordsByPurpose(purpose: string, limit: number = 10): WordAnalysis[] {
    const dataset = vocabularyDataset.words as WordAnalysis[];
    const purposeKey = PURPOSE_TO_KEY[purpose];
    const filtered = dataset.filter(word => word.purposes?.includes(purposeKey));
    return shuffleArray(filtered).slice(0, limit);
}

/**
 * Get words by level
 */
export function getWordsByLevel(level: string, limit: number = 10): WordAnalysis[] {
    const dataset = vocabularyDataset.words as WordAnalysis[];
    const filtered = dataset.filter(word => word.level === level);
    return shuffleArray(filtered).slice(0, limit);
}
