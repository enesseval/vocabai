// src/data/fallbackStories.ts
import { Story } from '../types/story';

// Her dil için SADECE 1 tane genel, her seviyeye uygun hikaye.
export const FALLBACK_STORIES: Record<string, Story> = {
    en: {
        id: 'fallback_en',
        title: 'The Journey Begins',
        content: 'Every great journey starts with a single step...',
        language: 'en',
        level: 'Beginner',
        topicIds: [] // Genel konu
    },
    tr: {
        id: 'fallback_tr',
        title: 'Yolculuk Başlıyor',
        content: 'Her büyük yolculuk tek bir adımla başlar...',
        language: 'tr',
        level: 'Başlangıç',
        topicIds: []
    },
    de: {
        id: 'fallback_de',
        title: 'Die Reise beginnt',
        content: 'Jede große Reise beginnt mit einem einzigen Schritt...',
        language: 'de',
        level: 'Anfänger',
        topicIds: []
    },
    // ... diğer diller (fr, es)
};