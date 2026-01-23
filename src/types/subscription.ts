// src/types/subscription.ts

export type SubscriptionPlan = 'free' | 'weekly' | 'monthly' | 'yearly';

export interface SubscriptionDetails {
    plan: SubscriptionPlan;
    isPremium: boolean;
    startDate?: Date;
    expiryDate?: Date;
    autoRenew?: boolean;
}

export interface PlanOption {
    id: SubscriptionPlan;
    name: string;
    price: string;
    priceMonthly?: string; // For yearly plan
    duration: string;
    features: string[];
    badge?: string; // "Most Popular", "Best Value", etc.
    discount?: string; // "Save 50%"
    isMostPopular?: boolean;
}
