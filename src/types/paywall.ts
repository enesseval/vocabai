// src/types/paywall.ts

export type PaywallVariant = 'A' | 'B' | 'C';

export type UserSegment = 'new' | 'active' | 'price_sensitive' | 'default';

export interface PaywallExperiment {
    variant: PaywallVariant;
    assignedAt: string;
    segment: UserSegment;
}

export interface PaywallAnalytics {
    variant: PaywallVariant;
    event: 'view' | 'plan_selected' | 'cta_clicked' | 'trial_started' | 'dismissed';
    planType?: 'monthly' | 'yearly';
    dismissReason?: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface Testimonial {
    name: string;
    role: string;
    quote: string;
    avatar?: string;
}

export interface PaywallVariantProps {
    onSubscribe: (plan: 'monthly' | 'yearly') => Promise<void>;
    onDismiss: () => void;
    onRestore: () => void;
    isLoading: boolean;
    currentStreak?: number;
    daysSinceSignup: number;
}
