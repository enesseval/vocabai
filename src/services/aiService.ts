import { UserProfile } from '../context/OnboardingContext';
import { Story } from '../types/story';
import { supabase } from '../utils/supabaseClient';

export const generateDailyStory = async (profile: UserProfile): Promise<Story> => {
    try {
        console.log("📡 Supabase Edge Function çağrılıyor...");

        // Backend'deki 'generate-story' fonksiyonuna istek atıyoruz
        const { data, error } = await supabase.functions.invoke('generate-story', {
            body: {
                level: profile.level,
                interests: profile.interests,
                targetLang: profile.targetLang || 'en',
                nativeLang: profile.nativeLang || 'tr'
            }
        });

        if (error) {
            console.error("Supabase Function Error:", error);
            throw new Error(`Story generation failed: ${error.message}`);
        }

        // Gelen veri zaten bizim istediğimiz formatta (Prompt'u backend'de ayarladık)
        const aiResponse = data;

        // TTS için full metin oluşturma (Paragrafları birleştiriyoruz)
        const fullContent = aiResponse.segments.map((s: any) => s.target).join('\n\n');

        return {
            id: `ai_${Date.now()}`,
            title: aiResponse.title,
            titleNative: aiResponse.title_native,
            content: fullContent,
            segments: aiResponse.segments,
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