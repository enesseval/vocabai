// src/utils/storyManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../context/OnboardingContext';
import { AIStoryResponse, Story } from '../types/story';
import { FALLBACK_STORIES } from '../data/fallbackStories';

// ⚠️ GÜVENLİK UYARISI: API Anahtarını Production'da backend'e taşımalısın.
const API_KEY = "AIzaSyCPAadCOzShg2gAry_40EnAGBDJD5YXhKA"; // Senin Key'in

// Model: gemini-1.5-flash (En güncel, hızlı ve JSON modu stabil olan model)
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

const TOPIC_MAP: Record<number, string> = {
    1: "Technology and AI",
    2: "Philosophy and Ethics",
    3: "Art and Creativity",
    4: "Business and Startup Culture",
    5: "Nature and Environment",
    6: "Science and Space",
    7: "Literature and Books",
    8: "History and Ancient Civilizations",
    9: "Cinema and Movies",
    10: "Travel and Adventure"
};

export const fetchStoryFromGemini = async (profile: UserProfile): Promise<Story> => {
    const topicNames = profile.interests.map(id => TOPIC_MAP[id]).join(", ");
    const targetLangName = getLanguageName(profile.targetLang);
    const nativeLangName = getLanguageName(profile.nativeLang || 'tr');

    // 🔥 PROMPT MÜHENDİSLİĞİ UYGULANMIŞ GÜÇLÜ İSTEM 🔥
    const prompt = `
    ROLE:
    You are an award-winning author and expert linguist specialized in teaching ${targetLangName} to ${nativeLangName} speakers. Your goal is to create immersive reading material that is educational yet captivating.

    USER PROFILE:
    - Target Language: ${targetLangName}
    - Native Language: ${nativeLangName}
    - Proficiency Level: ${profile.level} (A1-A2: Simple sentences, B1-B2: Complex structures, C1-C2: Native-like nuances)
    - Interests: ${topicNames}

    INSTRUCTIONS:
    1. STORY STRUCTURE (CRITICAL):
       - Write a story between 200-300 words.
       - **MUST split the story into EXACTLY 3 distinct paragraphs.**
       - Use the '\\n\\n' escape character to separate paragraphs in the JSON output.
       - The tone should be engaging, encouraging, and culturally relevant to the target language.

    2. VOCABULARY SELECTION:
       - Identify **18 to 25** important words or phrases from the story.
       - Include a mix of: Verbs, Adjectives, Nouns, and at least 1 Idiom/Expression.
       - Focus on words that are slightly challenging for the '${profile.level}' level to promote growth.

    3. ANALYSIS:
       - For each selected word, provide the translation and explanation strictly in ${nativeLangName}.
       - The 'explanation' should clarify *why* the word is used in that specific context (e.g., "Used here as a metaphor for...").

    OUTPUT FORMAT:
    Return strictly raw JSON (no markdown, no code blocks). Follow this schema exactly:

    {
      "title": "Creative Title in ${targetLangName}",
      "content": "Paragraph 1 text...\\n\\nParagraph 2 text...\\n\\nParagraph 3 text...",
      "level": "${profile.level}",
      "vocabulary": [
        {
          "word": "word form text",
          "lemma": "dictionary form",
          "translation": "meaning in ${nativeLangName}",
          "explanation": "contextual note in ${nativeLangName}",
          "example": "simple example sentence in ${targetLangName}"
        }
      ]
    }
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json", // JSON Modunu zorla
                    temperature: 0.75, // Biraz daha yaratıcı olsun
                }
            })
        });

        const data = await response.json();

        // API Yanıt Kontrolü
        if (!data.candidates || !data.candidates[0].content) {
            console.error("Gemini Response Blocked/Empty:", data);
            throw new Error("Gemini blocked the response or returned empty.");
        }

        const rawText = data.candidates[0].content.parts[0].text;

        // Bazen AI markdown ```json ... ``` içinde dönebilir, temizleyelim
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        const aiResponse: AIStoryResponse = JSON.parse(cleanJson);

        return {
            id: `gemini_${Date.now()}`,
            title: aiResponse.title,
            content: aiResponse.content, // \n\n karakterleri burada olacak
            language: profile.targetLang || 'en',
            topicIds: profile.interests,
            level: aiResponse.level,
            vocabulary: aiResponse.vocabulary
        };

    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
};

const getLanguageName = (code: string | null) => {
    switch (code) {
        case 'tr': return 'Turkish';
        case 'de': return 'German';
        case 'es': return 'Spanish';
        case 'fr': return 'French';
        case 'it': return 'Italian';
        default: return 'English';
    }
};

// 2. Ana Yönetici Fonksiyon
export const getStoryForUser = async (userProfile: UserProfile): Promise<Story> => {
    try {
        console.log("✨ Gemini AI Hikaye Hazırlıyor (Gelişmiş Prompt)...");
        const aiStory = await fetchStoryFromGemini(userProfile);

        // Başarılıysa geçmişe kaydet
        await saveToHistory(aiStory);

        return aiStory;

    } catch (error) {
        console.log("⚠️ AI Başarısız oldu. Fallback devreye giriyor.", error);

        // Önce Cache'e bak
        const localHistory = await AsyncStorage.getItem('story_history');
        if (localHistory) {
            const stories = JSON.parse(localHistory);
            const targetLang = userProfile.targetLang || 'en';
            const langStories = stories.filter((s: Story) => s.language === targetLang);

            if (langStories.length > 0) {
                console.log("📦 Cache'den eski hikaye getirildi.");
                // Rastgele birini döndür
                return langStories[Math.floor(Math.random() * langStories.length)];
            }
        }

        // Cache boşsa Fallback
        const lang = userProfile.targetLang || 'en';
        // @ts-ignore
        return FALLBACK_STORIES[lang] || FALLBACK_STORIES['en'];
    }
};

const saveToHistory = async (story: Story) => {
    try {
        const history = await AsyncStorage.getItem('story_history');
        let stories = history ? JSON.parse(history) : [];

        // Son 10 hikayeyi tut, eskileri sil (Cache yönetimi)
        if (stories.length >= 10) {
            stories.shift();
        }

        stories.push(story);
        await AsyncStorage.setItem('story_history', JSON.stringify(stories));
    } catch (e) {
        console.error("Cache hatası", e);
    }
};