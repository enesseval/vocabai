// src/constants/paywallConfig.ts

import { PaywallVariant, Testimonial } from '../types/paywall';

export const EXPERIMENT_CONFIG = {
    enabled: true,
    variants: ['A', 'B', 'C'] as PaywallVariant[],
    distribution: [0.33, 0.33, 0.34], // A, B, C
    minSampleSize: 100,
    testDuration: 14, // days
};

// Variant A: Social Proof testimonials
export const TESTIMONIALS: Testimonial[] = [
    {
        name: 'Sarah Jenkins',
        role: 'Polyglot (5 languages)',
        quote: 'VocabAI helped me learn Turkish through engaging stories. The AI-powered approach is genius!',
    },
    {
        name: 'James Chen',
        role: 'Language Tutor',
        quote: 'My students love learning with stories. VocabAI makes vocabulary stick naturally.',
    },
    {
        name: 'Elena Rodriguez',
        role: 'Travel Blogger',
        quote: 'I can finally have conversations in the countries I visit. Worth every penny!',
    },
];

// Pricing constants
export const PRICING = {
    yearly: {
        price: 1199, // ₺
        monthlyEquivalent: 99,
        currency: '₺',
        savingsPercent: 50,
        dailyCost: 3.28,
    },
    monthly: {
        price: 199, // ₺
        currency: '₺',
    },
    trialDays: 7,
};

// Achievement badges for Variant C
export const ACHIEVEMENT_BADGES = [
    {
        id: 'streak_repair',
        title: 'Streak Repair',
        description: 'Never lose your progress',
        icon: '🔥',
        locked: true,
    },
    {
        id: 'ai_tutor',
        title: 'AI Tutor',
        description: 'Personal guidance',
        icon: '🤖',
        locked: true,
    },
    {
        id: 'offline_mode',
        title: 'Offline Mode',
        description: 'Learn anywhere',
        icon: '📥',
        locked: true,
    },
];
