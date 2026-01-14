// src/types/story.ts

// Eksik olan WordAnalysis geri geldi
export interface WordAnalysis {
    word: string;
    lemma: string;
    translation: string;
    explanation: string;
    example: string;
}

export interface StorySegment {
    target: string;
    native: string;
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
}

export interface AIStoryResponse {
    title: string;
    title_native: string; // JSON'dan gelen
    segments: StorySegment[];
    level: string;
    vocabulary: WordAnalysis[];
}