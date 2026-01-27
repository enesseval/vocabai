// src/screens/PaywallScreen.tsx
// A/B Testing Paywall (3 Variants)

import React, { useMemo, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../types/navigation';
import { SubscriptionPlan } from '../types/subscription';
import { useSubscription } from '../context/SubscriptionContext';
import { usePaywallExperiment } from '../hooks/usePaywallExperiment';
import { PaywallVariantA } from './paywall/PaywallVariantA';
import { PaywallVariantB } from './paywall/PaywallVariantB';
import { PaywallVariantC } from './paywall/PaywallVariantC';

export default function PaywallScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { updateSubscription, subscription } = useSubscription();

    // Calculate user metrics
    const daysSinceSignup = useMemo(() => {
        if (!subscription?.startDate) return 0;
        const signupDate = new Date(subscription.startDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - signupDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, [subscription?.startDate]);

    // Mock data for streak (TODO: Replace with actual user data)
    const currentStreak = 15;

    // A/B Testing experiment
    const {
        variant,
        isLoading: isExperimentLoading,
        logImpression,
        logPlanSelected,
        logCtaClicked,
        logTrialStarted,
        logDismissed,
    } = usePaywallExperiment(daysSinceSignup, currentStreak);

    // Log impression when screen mounts
    useEffect(() => {
        logImpression();
    }, []);

    // Handle subscription
    const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
        try {
            await logCtaClicked(plan);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            await updateSubscription(plan as SubscriptionPlan);
            await logTrialStarted(plan);

            // Navigate to home (MainTabs)
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (error) {
            console.error('[Paywall] Subscription error:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    // Handle dismiss - go to home
    const handleDismiss = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        logDismissed('user_dismissed');
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
        });
    };

    // Handle restore purchases
    const handleRestore = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // TODO: Implement restore purchases logic
        console.log('[Paywall] Restore purchases requested');
    };

    // Show loading state while experiment is initializing
    if (isExperimentLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FCD34D" />
            </View>
        );
    }

    // Render variant based on experiment assignment
    const variantProps = {
        onSubscribe: handleSubscribe,
        onDismiss: handleDismiss,
        onRestore: handleRestore,
        currentStreak: currentStreak,
        daysSinceSignup: daysSinceSignup,
        isLoading: false,
    };

    switch (variant) {
        case 'A':
            return <PaywallVariantA {...variantProps} />;
        case 'B':
            return <PaywallVariantB {...variantProps} />;
        case 'C':
            return <PaywallVariantC {...variantProps} />;
        default:
            return <PaywallVariantA {...variantProps} />;
    }
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
