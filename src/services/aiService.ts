// src/services/aiService.ts
import { UserProfile } from '../context/OnboardingContext';
import { Story, AIStoryResponse } from '../types/story';

// API KEY (.env dosyasından gelir)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("API Key eksik! .env dosyasını kontrol et.");
}

// 🔥 MODEL: En stabil JSON modu için 'gemini-1.5-flash' kullanıyoruz.
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
    const nativeLangName = getLanguageName(profile.nativeLang || 'tr');

    // 🔥 MASTER PROMPT: PARALLEL TEXT + STRICT VOCABULARY ANALYSIS 🔥
    const prompt = `
    [SYSTEM SETTING]
    You are an advanced Linguistic AI Engine.
    Modes: "Creative Author" (${targetLangName}) & "Analytical Translator" (${nativeLangName}).

    [USER CONTEXT]
    - Level: ${profile.level}
    - Native: ${nativeLangName}
    - Interests: ${topicNames}

    [TASK]
    1. Create a story (200-300 words) in ${targetLangName}.
    2. Split it into EXACTLY 3 paragraphs.
    3. Provide the ${nativeLangName} translation for EACH paragraph.
    4. Provide a creative Title in ${targetLangName} AND ${nativeLangName}.
    5. Extract 18-25 key vocabulary items.

    [OUTPUT SCHEMA (Raw JSON)]
    {
      "title": "Title in ${targetLangName}",
      "title_native": "Title in ${nativeLangName}",
      "segments": [
        { "target": "Para 1...", "native": "Para 1 translation..." },
        { "target": "Para 2...", "native": "Para 2 translation..." },
        { "target": "Para 3...", "native": "Para 3 translation..." }
      ],
      "level": "${profile.level}",
      "vocabulary": [
        {
          "word": "word",
          "lemma": "root",
          "translation": "meaning",
          "explanation": "Context in ${nativeLangName}",
          "example": "Example sentence"
        }
      ]
    }
    `;

    try {
        console.log("📡 Gemini'ye istek atılıyor...");

        const response = await fetch(GEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                // Güvenlik ayarlarını biraz esnetiyoruz ki hikaye bloklanmasın
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.70
                }
            })
        });

        const data = await response.json();

        // 🔍 DEBUG: Hata durumunda detaylı log
        if (!data.candidates?.[0]?.content) {
            console.error("🔴 GEMINI BLOCK DETAYI:", JSON.stringify(data, null, 2));
            const blockReason = data.promptFeedback?.blockReason || "Unknown";
            throw new Error(`Gemini blocked response. Reason: ${blockReason}`);
        }

        const rawText = data.candidates[0].content.parts[0].text;

        // Markdown temizliği (```json ... ```)
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        const aiResponse: AIStoryResponse = JSON.parse(cleanJson);

        // UI için segments kullanacağız, ama TTS (Sesli okuma) için birleşik metin lazım
        const fullContent = aiResponse.segments.map(s => s.target).join('\n\n');

        return {
            id: `ai_${Date.now()}`,
            title: aiResponse.title,
            titleNative: aiResponse.title_native,
            content: fullContent, // TTS için
            segments: aiResponse.segments, // UI (Magic Paragraph) için
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