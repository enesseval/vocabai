// src/utils/storyOrchestrator.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../context/OnboardingContext';
import { Story, StoryQuiz } from '../types/story';
import { FALLBACK_STORIES } from '../data/fallbackStories';
import { generateStoryFast } from '../services/aiService';
import { decideStorySource, DecisionContext } from './storyDecisionEngine';
import { getGrammarTopic } from '../data/grammarSyllabus';
import { WordAnalysis } from '../types/story';
import { LearningAnalytics } from './learningAnalytics';

const STORAGE_KEY_HISTORY = 'story_history';
const STORAGE_KEY_LAST_FETCH = 'last_story_date';

// Progressive loading result type
export interface ProgressiveStoryResult {
    story: Story;
    analytics: LearningAnalytics;
    quizPromise: Promise<StoryQuiz>;
}

// YENİ YARDIMCI FONKSİYON: Rastgele 4 eski kelime seç
async function getReviewWords(count: number = 4): Promise<WordAnalysis[]> {
    try {
        const json = await AsyncStorage.getItem('user_vocabulary');
        if (!json) return [];
        const allWords: WordAnalysis[] = JSON.parse(json);

        // Basit Karıştırma (Shuffle) ve ilk 'count' kadarını alma
        const shuffled = allWords.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    } catch (e) {
        console.warn("Kelime geçmişi okunamadı", e);
        return [];
    }
}

/**
 * Progressive Story Loading - Story hemen döner, Quiz arka planda yüklenir
 */
export const getStoryForUserProgressive = async (
    userProfile: UserProfile,
    phase: 'ONBOARDING_END' | 'RETURNING_USER' = 'ONBOARDING_END'
): Promise<ProgressiveStoryResult> => {

    const todayStr = new Date().toISOString().split('T')[0];
    const lastFetchDate = await AsyncStorage.getItem(STORAGE_KEY_LAST_FETCH);
    const isOffline = false;
    const hasStoryForToday = lastFetchDate === todayStr;

    const context: DecisionContext = {
        phase,
        hasStoryForToday,
        isOffline,
        lastStoryDate: lastFetchDate || undefined
    };

    const source = decideStorySource(context);
    console.log(`Orchestrator Verdict: [${source}]`);

    try {
        switch (source) {
            case 'AI_DAILY':
            case 'ARCHIVE':
                return await handleAIDailyProgressive(userProfile, todayStr);

            case 'EMERGENCY':
            case 'MAGIC_STATIC':
            default:
                // Fallback için empty quiz promise
                const fallbackStory = getFallbackStory(userProfile);
                return {
                    story: fallbackStory,
                    analytics: {
                        total_vocabulary: 0,
                        new_words: 0,
                        review_words: 0,
                        grammar_structures_used: 0,
                        difficulty_score: 0,
                        vocabulary_breakdown: { verbs: 0, nouns: 0, adjectives: 0, adverbs: 0, phrases: 0, idioms: 0 },
                        priority_breakdown: { high: 0, medium: 0, low: 0 }
                    },
                    quizPromise: Promise.resolve({
                        fill_in_blank: [],
                        true_false: [],
                        comprehension: [],
                        word_match: []
                    })
                };
        }
    } catch (error) {
        console.error("Orchestrator Crash:", error);
        const fallbackStory = getFallbackStory(userProfile);
        return {
            story: fallbackStory,
            analytics: {
                total_vocabulary: 0,
                new_words: 0,
                review_words: 0,
                grammar_structures_used: 0,
                difficulty_score: 0,
                vocabulary_breakdown: { verbs: 0, nouns: 0, adjectives: 0, adverbs: 0, phrases: 0, idioms: 0 },
                priority_breakdown: { high: 0, medium: 0, low: 0 }
            },
            quizPromise: Promise.resolve({
                fill_in_blank: [],
                true_false: [],
                comprehension: [],
                word_match: []
            })
        };
    }
};

/**
 * Legacy function - backward compatibility
 */
export const getStoryForUser = async (
    userProfile: UserProfile,
    phase: 'ONBOARDING_END' | 'RETURNING_USER' = 'ONBOARDING_END'
): Promise<Story> => {
    const result = await getStoryForUserProgressive(userProfile, phase);
    // Quiz'i bekle ve story'ye attach et
    const quiz = await result.quizPromise;
    return { ...result.story, quiz };
};

// --- Yardımcı Uygulayıcılar ---

async function handleAIDailyProgressive(profile: UserProfile, dateStr: string): Promise<ProgressiveStoryResult> {

    // 1. Kaçıncı hikaye olduğunu bul
    const historyJson = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
    const history = historyJson ? JSON.parse(historyJson) : [];
    const storyCount = history.length;

    // 2. Müfredattan konuyu seç
    const grammarTopic = getGrammarTopic(profile.level, storyCount);

    // 3. Tekrar edilecek kelimeleri seç
    const reviewWords = await getReviewWords(5);

    // 4. Progressive generation - Story hemen, Quiz arka planda
    const { story, analytics, quizPromise } = await generateStoryFast(profile, grammarTopic, reviewWords);

    // 5. Kaydet (async, beklemeden)
    saveToHistory(story);
    AsyncStorage.setItem(STORAGE_KEY_LAST_FETCH, dateStr);

    return { story, analytics, quizPromise };
}

function getFallbackStory(profile: UserProfile): Story {
    const lang = profile.targetLang || 'en';
    // @ts-ignore
    return FALLBACK_STORIES[lang] || FALLBACK_STORIES['en'];
}

async function saveToHistory(story: Story) {
    const history = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
    let stories = history ? JSON.parse(history) : [];

    if (!stories.some((s: Story) => s.id === story.id)) {
        stories.push(story);
        if (stories.length > 10) stories.shift();
        await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(stories));
    }
}
