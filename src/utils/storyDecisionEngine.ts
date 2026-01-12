// src/utils/storyDecisionEngine.ts

export type StorySource = 'MAGIC_STATIC' | 'AI_DAILY' | 'ARCHIVE' | 'EMERGENCY';

export type DecisionContext = {
    phase: 'ONBOARDING_END' | 'RETURNING_USER'; // Kullanıcı hangi aşamada?
    hasStoryForToday: boolean;   // Bugün için zaten üretilmiş/kaydedilmiş hikaye var mı?
    isOffline: boolean;          // İnternet var mı?
    lastStoryDate?: string;      // En son ne zaman hikaye aldı?
};

/**
 * Task 1.1 - Merkezi Karar Fonksiyonu
 */
export const decideStorySource = (ctx: DecisionContext): StorySource => {
    console.log("Decision Engine Context:", ctx);

    // 1. Durum: İnternet Yoksa -> Arşiv veya Acil Durum
    if (ctx.isOffline) {
        if (ctx.hasStoryForToday) return 'ARCHIVE';
        return 'EMERGENCY';
    }

    // 2. Durum: Onboarding yeni bitti (İlk Heyecan)
    if (ctx.phase === 'ONBOARDING_END') {
        // Eğer onboarding sırasında arkada fetch başarısız olduysa Emergency,
        // ama normal şartlarda buraya 'AI_DAILY' kararı verilir.
        // Pre-fetch yapılmışsa bile kaynağı AI_DAILY olarak işaretleriz.
        return 'AI_DAILY';
    }

    // 3. Durum: Geri dönen kullanıcı
    if (ctx.phase === 'RETURNING_USER') {
        // Bugün zaten hikayesi varsa onu göster (Maliyet kontrolü + Tutarlılık)
        if (ctx.hasStoryForToday) {
            return 'ARCHIVE';
        }
        // Yeni gün, yeni hikaye
        return 'AI_DAILY';
    }

    // Fallback
    return 'EMERGENCY';
};