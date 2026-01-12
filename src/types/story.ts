// src/types/story.ts

export interface WordAnalysis {
    word: string;
    lemma: string;
    translation: string;
    explanation: string;
    example: string;
}

export interface Story {
    id: string;
    title: string;
    content: string;
    language: string; // 'en', 'de', 'tr', 'fr', 'es'
    topicIds: number[]; // İlgi alanı ID'leri
    level: string; // 'Beginner', 'Intermediate', 'Advanced'
    vocabulary?: WordAnalysis[];
}

export interface AIStoryResponse {
    title: string;
    content: string;
    level: string;
    vocabulary: WordAnalysis[]; // Kelimeler artık hikaye ile birlikte geliyor!
}