// src/types/story.ts

// Eksik olan WordAnalysis geri geldi
export interface WordAnalysis {
    word: string;
    lemma: string;
    translation: string;
    explanation: string;
    example: string;
    type:string;
    
}

export interface StorySegment {
    target: string;
    native: string;
}

export type StoryCategory = 'Mystery' | 'Romance' | 'Adventure' | 'Sci-Fi' | 'Comedy' | 'Drama';
export type StoryDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface StoryMetadata {
    teaser?: string; // 2-sentence hook for home screen
    category?: StoryCategory;
    difficulty?: StoryDifficulty;
    estimatedMinutes?: number;
    xpReward?: number;
    imageUrl?: string;
    emotion?: 'suspenseful' | 'romantic' | 'exciting' | 'thoughtful' | 'funny';
}

export interface Story {
    id: string;
    title: string;
    titleNative: string; // Türkçe Başlık
    content: string; // TTS için full metin
    segments?: StorySegment[];
    language: string;
    topicIds: number[];
    level: string;
    vocabulary?: WordAnalysis[]; // Burada kullanılıyor
    metadata?: StoryMetadata; // New: story metadata for home screen
}

export interface AIStoryResponse {
    title: string;
    title_native: string; // JSON'dan gelen
    segments: StorySegment[];
    level: string;
    vocabulary: WordAnalysis[];
}