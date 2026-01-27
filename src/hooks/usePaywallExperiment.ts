// src/hooks/usePaywallExperiment.ts

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaywallVariant, UserSegment, PaywallExperiment, PaywallAnalytics } from '../types/paywall';
import { EXPERIMENT_CONFIG } from '../constants/paywallConfig';

const EXPERIMENT_STORAGE_KEY = '@paywall/experiment';
const ANALYTICS_STORAGE_KEY = '@paywall/analytics';
const DISMISSAL_COUNT_KEY = '@paywall/dismissals';

interface UsePaywallExperimentResult {
    variant: PaywallVariant;
    isLoading: boolean;
    logImpression: () => Promise<void>;
    logPlanSelected: (plan: 'monthly' | 'yearly') => Promise<void>;
    logCtaClicked: (plan: 'monthly' | 'yearly') => Promise<void>;
    logTrialStarted: (plan: 'monthly' | 'yearly') => Promise<void>;
    logDismissed: (reason?: string) => Promise<void>;
}

export const usePaywallExperiment = (
    daysSinceSignup: number,
    currentStreak?: number
): UsePaywallExperimentResult => {
    const [variant, setVariant] = useState<PaywallVariant>('A');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        initializeExperiment();
    }, []);

    const initializeExperiment = async () => {
        try {
            // Check if user already has an assigned variant
            const stored = await AsyncStorage.getItem(EXPERIMENT_STORAGE_KEY);

            if (stored) {
                const experiment: PaywallExperiment = JSON.parse(stored);
                setVariant(experiment.variant);
            } else {
                // Assign new variant based on segmentation
                const segment = determineUserSegment(daysSinceSignup, currentStreak);
                const assignedVariant = assignVariant(segment);

                const experiment: PaywallExperiment = {
                    variant: assignedVariant,
                    assignedAt: new Date().toISOString(),
                    segment,
                };

                await AsyncStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(experiment));
                setVariant(assignedVariant);
            }
        } catch (error) {
            console.error('Failed to initialize paywall experiment:', error);
            // Fallback to variant A
            setVariant('A');
        } finally {
            setIsLoading(false);
        }
    };

    const determineUserSegment = (days: number, streak?: number): UserSegment => {
        // Check dismissal count for price-sensitive segment
        AsyncStorage.getItem(DISMISSAL_COUNT_KEY).then(count => {
            const dismissals = count ? parseInt(count) : 0;
            if (dismissals >= 2) return 'price_sensitive';
        });

        // New users (0-3 days)
        if (days <= 3) return 'new';

        // Active users (7+ day streak)
        if (streak && streak >= 7) return 'active';

        return 'default';
    };

    const assignVariant = (segment: UserSegment): PaywallVariant => {
        if (!EXPERIMENT_CONFIG.enabled) {
            return 'A'; // Default to A if experiment is disabled
        }

        const { variants, distribution } = EXPERIMENT_CONFIG;

        // Adjust distribution based on segment
        let weights = [...distribution];

        switch (segment) {
            case 'price_sensitive':
                // 50% B, 25% A, 25% C
                weights = [0.25, 0.5, 0.25];
                break;
            case 'active':
                // 50% C, 25% A, 25% B
                weights = [0.25, 0.25, 0.5];
                break;
            case 'new':
            case 'default':
            default:
                // Equal distribution
                weights = distribution;
                break;
        }

        // Weighted random selection
        const random = Math.random();
        let cumulative = 0;

        for (let i = 0; i < variants.length; i++) {
            cumulative += weights[i];
            if (random < cumulative) {
                return variants[i];
            }
        }

        return variants[0]; // Fallback
    };

    const logEvent = useCallback(
        async (analytics: Omit<PaywallAnalytics, 'variant' | 'timestamp'>) => {
            try {
                const event: PaywallAnalytics = {
                    ...analytics,
                    variant,
                    timestamp: new Date().toISOString(),
                };

                // Store analytics locally (in production, send to analytics service)
                const stored = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
                const events: PaywallAnalytics[] = stored ? JSON.parse(stored) : [];
                events.push(event);

                await AsyncStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events));

                // TODO: Send to analytics service (Amplitude, Mixpanel, etc.)
                console.log('Paywall analytics:', event);
            } catch (error) {
                console.error('Failed to log paywall event:', error);
            }
        },
        [variant]
    );

    const logImpression = useCallback(async () => {
        await logEvent({ event: 'view' });
    }, [logEvent]);

    const logPlanSelected = useCallback(
        async (plan: 'monthly' | 'yearly') => {
            await logEvent({ event: 'plan_selected', planType: plan });
        },
        [logEvent]
    );

    const logCtaClicked = useCallback(
        async (plan: 'monthly' | 'yearly') => {
            await logEvent({ event: 'cta_clicked', planType: plan });
        },
        [logEvent]
    );

    const logTrialStarted = useCallback(
        async (plan: 'monthly' | 'yearly') => {
            await logEvent({ event: 'trial_started', planType: plan });
        },
        [logEvent]
    );

    const logDismissed = useCallback(
        async (reason?: string) => {
            await logEvent({ event: 'dismissed', dismissReason: reason });

            // Increment dismissal count
            const count = await AsyncStorage.getItem(DISMISSAL_COUNT_KEY);
            const dismissals = count ? parseInt(count) : 0;
            await AsyncStorage.setItem(DISMISSAL_COUNT_KEY, (dismissals + 1).toString());
        },
        [logEvent]
    );

    return {
        variant,
        isLoading,
        logImpression,
        logPlanSelected,
        logCtaClicked,
        logTrialStarted,
        logDismissed,
    };
};
