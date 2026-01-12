// src/services/aiService.ts
import { UserProfile } from '../context/OnboardingContext';
import { Story, AIStoryResponse } from '../types/story';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("API Key eksik! .env dosyasını kontrol et.");
}

// Model: gemini-1.5-flash (JSON modu en stabil ve itaatkar model)
const GEN_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

const TOPIC_MAP: Record<number, string> = {
    1: "Technology and AI", 2: "Philosophy and Ethics", 3: "Art and Creativity",
    4: "Business and Startup Culture", 5: "Nature and Environment", 6: "Science and Space",
    7: "Literature and Books", 8: "History and Ancient Civilizations",
    9: "Cinema and Movies", 10: "Travel and Adventure"
};

const getLanguageName = (code: string | null) => {
    const langs: Record<string, string> = { 'tr': 'Turkish', 'de': 'German', 'es': 'Spanish', 'fr': 'French', 'it': 'Italian' };
    return langs[code || 'en'] || 'English';
};

export const generateDailyStory = async (profile: UserProfile): Promise<Story> => {
    const topicNames = profile.interests.map(id => TOPIC_MAP[id]).join(", ");
    const targetLangName = getLanguageName(profile.targetLang);
    const nativeLangName = getLanguageName(profile.nativeLang || 'tr'); // Varsayılan Türkçe

    // 🔥 MASTER PROMPT v2.0 (Role-Switching & Negative Constraints) 🔥
    const prompt = `
    [SYSTEM SETTING]
    You are an advanced Linguistic AI Engine capable of two distinct modes: 
    1. "Creative Author" (Target Language: ${targetLangName})
    2. "Analytical Translator" (Native Language: ${nativeLangName})

    [USER CONTEXT]
    - Proficiency: ${profile.level}
    - Native Language: ${nativeLangName}
    - Interests: ${topicNames}

    [STEP 1: CREATIVE AUTHOR MODE]
    Action: Write an immersive, culturally relevant story in ${targetLangName}.
    Constraints:
    - Length: 150-200 words.
    - Structure: MUST consist of EXACTLY 3 paragraphs separated by '\\n\\n'.
    - Tone: Engaging and educational.

    [STEP 2: ANALYTICAL TRANSLATOR MODE]
    Action: Extract and analyze 18-25 key vocabulary items.
    Constraints:
    - Selection: Mix of Verbs, Adjectives, Nouns, and Idioms.
    - 🛑 NEGATIVE CONSTRAINT: DO NOT use ${targetLangName} for explanations.
    - ✅ POSITIVE CONSTRAINT: The 'translation' and 'explanation' fields MUST be in ${nativeLangName}.
    - Context: Explain *why* the word was used in that specific sentence (e.g., metaphorical meaning, tense nuance).

    [OUTPUT CONFIGURATION]
    Return ONLY raw JSON. No markdown. Follow this schema strictly:

    {
      "title": "Story Title in ${targetLangName}",
      "content": "Paragraph 1...\\n\\nParagraph 2...\\n\\nParagraph 3...",
      "level": "${profile.level}",
      "vocabulary": [
        {
          "word": "The exact word from the text",
          "lemma": "The dictionary root form",
          "translation": "Direct meaning in ${nativeLangName}",
          "explanation": "Contextual analysis strictly in ${nativeLangName}. (Ex: 'Bu kelime burada mecazi anlamda...')",
          "example": "A simple example sentence in ${targetLangName} containing the word"
        }
      ]
    }
    `;

    try {
        const response = await fetch(GEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.70 // Yaratıcılık ile tutarlılık arasındaki altın oran
                }
            })
        });

        const data = await response.json();

        if (!data.candidates?.[0]?.content) {
            console.error("Gemini Blocked:", data);
            throw new Error("Gemini blocked response");
        }

        const rawText = data.candidates[0].content.parts[0].text;

        // Temizlik (Markdown gelirse diye)
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        const aiResponse: AIStoryResponse = JSON.parse(cleanJson);

        return {
            id: `ai_${Date.now()}`,
            title: aiResponse.title,
            content: aiResponse.content,
            language: profile.targetLang || 'en',
            topicIds: profile.interests,
            level: aiResponse.level,
            vocabulary: aiResponse.vocabulary
        };
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};